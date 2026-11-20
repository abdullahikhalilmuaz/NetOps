import { Menu, Search, Bell, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const titles = {
  "/": "Dashboard",
  "/equipment": "Equipment",
  "/maintenance": "Maintenance",
  "/tickets": "Support Tickets",
  "/team": "Team",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings"
};

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/equipment/")) return "Equipment details";
  if (pathname.startsWith("/tickets/")) return "Ticket details";
  return "Dashboard";
}

export default function Topbar({ onMenu, unread = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenu} type="button" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={15} />
          <strong>{resolveTitle(location.pathname)}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="global-search">
          <Search size={17} />
          <input placeholder="Search anything..." />
          <kbd>⌘ K</kbd>
        </div>
        <button
          className="notification-button"
          onClick={() => navigate("/notifications")}
          type="button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unread > 0 && <span />}
        </button>
        <div className="topbar-avatar">
          {user?.name?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
