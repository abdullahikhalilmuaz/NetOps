import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Monitor, Wrench, Headset, Users,
  ChartNoAxesCombined, Bell, Settings, Wifi, Server,
  MoreHorizontal, CircleHelp, ArrowUpRight, LogOut, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Equipment", path: "/equipment", icon: Monitor },
      { label: "Maintenance", path: "/maintenance", icon: Wrench },
      { label: "Support Tickets", path: "/tickets", icon: Headset },
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Team", path: "/team", icon: Users },
      { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
      { label: "Notifications", path: "/notifications", icon: Bell },
    ]
  },
  {
    title: "SYSTEM",
    items: [{ label: "Settings", path: "/settings", icon: Settings }]
  }
];

export default function Sidebar({ open, onClose, unread = 0 }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand">
          <div className="brand-mark"><Wifi size={23} /></div>
          <div>
            <strong>NetOps</strong>
            <span>OPERATIONS MANAGEMENT</span>
          </div>
        </div>
        <button className="mobile-close" onClick={onClose} type="button" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="workspace-card">
        <div className="workspace-avatar"><Server size={20} /></div>
        <div>
          <strong>Organization</strong>
          <span>IT Workspace</span>
        </div>
        <MoreHorizontal size={18} />
      </div>

      <nav className="sidebar-nav">
        {navigation.map((group) => (
          <div className="nav-group" key={group.title}>
            <span className="nav-heading">{group.title}</span>
            {group.items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? "nav-active" : ""}`}
              >
                <Icon size={19} strokeWidth={1.9} />
                <span>{label}</span>
                {path === "/notifications" && unread > 0 && (
                  <span className="nav-count">{unread > 99 ? "99+" : unread}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><CircleHelp size={19} /></div>
          <div>
            <strong>Need assistance?</strong>
            <span>Visit support center</span>
          </div>
          <ArrowUpRight size={16} />
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="profile-info">
            <strong>{user?.name || "Administrator"}</strong>
            <span>{String(user?.role || "staff").replace(/_/g, " ")}</span>
          </div>
          <button className="profile-logout" onClick={logout} title="Sign out" type="button">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
