import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Monitor, Headset, Wrench, ShieldCheck, Activity, ArrowUpRight,
  CalendarDays, ChevronRight, Plus, Users, Package
} from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import Status from "../../components/common/Status";
import TableSkeleton from "../../components/common/TableSkeleton";

export default function Dashboard() {
  const { user, isTechnician } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.get("/dashboard/overview")
      .then((res) => {
        if (!alive) return;
        const data = res.data?.data || {};
        setStats(data.stats || {});
        setRecentTickets(data.recentTickets || []);
        setRecentMaintenance(data.recentMaintenance || []);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="page-content">
      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-label"><Activity size={14} /> OPERATIONS OVERVIEW</span>
          <h1>Welcome back, {firstName} 👋</h1>
          <p>Here's what's happening across your IT infrastructure today.</p>
          <div className="welcome-actions">
            <NavLink to={isTechnician ? "/maintenance" : "/equipment"} className="welcome-link">
              {isTechnician ? "View assigned jobs" : "Explore equipment"}
              <ArrowUpRight size={16} />
            </NavLink>
          </div>
        </div>
        <div className="welcome-decoration">
          <div className="decoration-circle circle-one" />
          <div className="decoration-circle circle-two" />
          <div className="decoration-icon"><Monitor size={48} /></div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Performance overview</h2>
          <p>Your organization's current operational status.</p>
        </div>
        <span className="date-chip">
          <CalendarDays size={15} /> {new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
        </span>
      </div>

      <div className="stats-grid">
        <StatCard title="Total equipment" value={stats?.equipmentTotal ?? "—"} change="Inventory" icon={Monitor} color="purple" />
        <StatCard title="Open tickets" value={stats?.openTickets ?? "—"} change="Active requests" icon={Headset} color="orange" trend="down" />
        <StatCard title="Maintenance due" value={stats?.maintenanceDue ?? "—"} change="Next 7 days" icon={Wrench} color="blue" />
        <StatCard title="Active users" value={stats?.usersTotal ?? "—"} change="Accounts" icon={Users} color="green" />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent support tickets</h3>
              <p>Latest technical support requests</p>
            </div>
            <NavLink to="/tickets" className="text-link">View all <ChevronRight size={16} /></NavLink>
          </div>

          {loading ? <TableSkeleton /> : recentTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Headset size={27} /></div>
              <h3>No recent tickets</h3>
              <p>When staff submit support requests they'll appear here.</p>
            </div>
          ) : (
            <div>
              {recentTickets.map((t) => (
                <div className="ticket-item" key={t._id}>
                  <div className="ticket-avatar"><Headset size={18} /></div>
                  <div className="ticket-info">
                    <strong>{t.subject}</strong>
                    <span>{t.requester?.name || "Staff"} · {t.ticketNumber || t._id?.slice(-6)}</span>
                  </div>
                  <Status value={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Maintenance schedule</h3>
              <p>Upcoming equipment maintenance</p>
            </div>
            <NavLink to="/maintenance" className="text-link">View all <ChevronRight size={16} /></NavLink>
          </div>

          {loading ? <TableSkeleton /> : recentMaintenance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Wrench size={27} /></div>
              <h3>Nothing scheduled</h3>
              <p>Create a maintenance task to see it here.</p>
            </div>
          ) : (
            <div>
              {recentMaintenance.map((m) => (
                <div className="schedule-item" key={m._id}>
                  <div className="schedule-date"><CalendarDays size={18} /></div>
                  <div className="schedule-info">
                    <strong>{m.equipment?.name || m.title || "Maintenance"}</strong>
                    <span>{m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : "TBD"}</span>
                  </div>
                  <Status value={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel quick-panel">
        <div className="panel-header">
          <div>
            <h3>Quick actions</h3>
            <p>Common operations at your fingertips.</p>
          </div>
        </div>
        <div className="quick-actions">
          <NavLink to="/equipment" className="quick-action">
            <div className="quick-icon purple"><Plus size={21} /></div>
            <div><strong>Equipment inventory</strong><span>Register and manage assets</span></div>
            <ChevronRight size={18} />
          </NavLink>
          <NavLink to="/maintenance" className="quick-action">
            <div className="quick-icon blue"><Wrench size={21} /></div>
            <div><strong>Schedule maintenance</strong><span>Plan equipment servicing</span></div>
            <ChevronRight size={18} />
          </NavLink>
          <NavLink to="/tickets" className="quick-action">
            <div className="quick-icon orange"><Headset size={21} /></div>
            <div><strong>Support tickets</strong><span>Handle technical issues</span></div>
            <ChevronRight size={18} />
          </NavLink>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div>
            <h3>Health snapshot</h3>
            <p>Operational availability indicators</p>
          </div>
          <ShieldCheck size={20} style={{ color: "var(--success)" }} />
        </div>
        <div className="health-strip">
          <div className="health-item">
            <span className="pulse-dot" /> API online
          </div>
          <div className="health-item">
            <span className="pulse-dot" /> Database synced
          </div>
          <div className="health-item">
            <Package size={16} /> {stats?.equipmentAvailable ?? "—"} equipment available
          </div>
          <div className="health-item">
            <Headset size={16} /> {stats?.resolvedThisMonth ?? "—"} tickets resolved this month
          </div>
        </div>
      </div>
    </div>
  );
}
