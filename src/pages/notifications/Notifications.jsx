import { useEffect, useState } from "react";
import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import PageHeading from "../../components/common/PageHeading";
import TableSkeleton from "../../components/common/TableSkeleton";
import EmptyState from "../../components/common/EmptyState";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      const d = res.data?.data || {};
      setItems(d.items || []);
      setUnread(d.unread || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not mark as read");
    }
  }

  return (
    <div className="page-content">
      <PageHeading
        title="Notifications"
        description="Stay updated on equipment alerts, maintenance schedules and support activities."
        action={
          <button className="btn btn-secondary" onClick={load} type="button">
            <RefreshCw size={17} /> Refresh
          </button>
        }
      />

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>All notifications</h3>
            <p>{unread} unread</p>
          </div>
        </div>

        {loading ? <TableSkeleton rows={3} /> : items.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up." icon={Bell} />
        ) : (
          <div>
            {items.map((n) => (
              <div className={`notification-row ${n.readAt ? "notification-read" : ""}`} key={n._id}>
                <div className={`notification-icon notif-${n.type}`}>
                  <Bell size={16} />
                </div>
                <div className="notification-content">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.readAt && (
                  <button className="btn btn-secondary" onClick={() => markRead(n._id)} type="button">
                    <CheckCircle2 size={15} /> Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
