import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Headset, User, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import Status from "../../components/common/Status";
import PageHeading from "../../components/common/PageHeading";
import TableSkeleton from "../../components/common/TableSkeleton";

const STATUSES = ["open", "in_progress", "waiting_user", "resolved", "closed"];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManage, isTechnician } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${id}`);
      const t = res.data?.data?.ticket || null;
      setTicket(t);
      if (t) setNewStatus(t.status);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/comments`, { message: message.trim() });
      setMessage("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  }

  async function updateStatus() {
    try {
      await api.patch(`/tickets/${id}`, { status: newStatus });
      toast.success("Status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  }

  if (loading) return <div className="page-content"><div className="panel"><TableSkeleton /></div></div>;
  if (!ticket) return (
    <div className="page-content">
      <PageHeading title="Ticket not found" description="This ticket may have been removed." />
      <Link to="/tickets" className="btn btn-secondary"><ArrowLeft size={16} /> Back to tickets</Link>
    </div>
  );

  const canChangeStatus = canManage || isTechnician;

  return (
    <div className="page-content">
      <div className="detail-header">
        <button className="icon-button" onClick={() => navigate("/tickets")} type="button">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1>{ticket.subject}</h1>
          <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>
            {ticket.ticketNumber} · {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <Status value={ticket.status} />
      </div>

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-header"><h3>Description</h3></div>
          <p style={{ color: "#4a4759", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
            {ticket.description}
          </p>
        </div>

        <div className="panel">
          <div className="panel-header"><h3>Details</h3></div>
          <div className="info-row">
            <span className="info-icon"><User size={15} /></span>
            <div>
              <span className="info-label">Requester</span>
              <strong className="info-value">{ticket.requester?.name || "—"}</strong>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon"><Clock size={15} /></span>
            <div>
              <span className="info-label">Priority</span>
              <strong className="info-value"><Status value={ticket.priority} /></strong>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon"><Headset size={15} /></span>
            <div>
              <span className="info-label">Category</span>
              <strong className="info-value">{ticket.category}</strong>
            </div>
          </div>

          {canChangeStatus && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#5d596f", display: "block", marginBottom: 6 }}>
                Update status
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ flex: 1 }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <button className="btn btn-primary" onClick={updateStatus} type="button">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <h3>Conversation</h3>
            <p>{ticket.comments?.length || 0} message{ticket.comments?.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="comment-list">
          {(ticket.comments || []).length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 11 }}>No messages yet. Start the conversation below.</p>
          )}
          {(ticket.comments || []).map((c) => (
            <div className="comment-item" key={c._id}>
              <div className="comment-avatar">{c.author?.name?.charAt(0).toUpperCase() || "?"}</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{c.author?.name || "Unknown"}</strong>
                  <span>{c.author?.role?.replace(/_/g, " ")} · {new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p>{c.message}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="comment-form" onSubmit={sendMessage}>
          <textarea
            rows={2}
            placeholder="Write a reply..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !message.trim()}>
            <Send size={16} /> {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
