import { Menu } from "lucide-react";
import { Avatar } from "./UI";

export default function AdminTopbar({ pendingPosts, pendingUsers, onMenuClick }) {
  const totalPending = pendingPosts + pendingUsers;

  return (
    <header className="admin-topbar">
      <button className="admin-topbar__menu-btn" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <div className="admin-topbar__brand">
        <img src="/NEULogo1.png" alt="NEU Logo" className="admin-topbar__logo-img" />
        <div className="admin-topbar__brand-text">
          <h1>NEU Wellness</h1>
          <span>Admin Panel</span>
        </div>
      </div>

      <div className="admin-topbar__spacer" />

      {totalPending > 0 && (
        <div className="admin-topbar__alert">
          <span className="admin-topbar__alert-dot" />
          <span>{totalPending} pending report{totalPending > 1 ? "s" : ""}</span>
        </div>
      )}

      <div className="admin-topbar__profile">
        <div className="admin-topbar__profile-text">
          <strong>Admin</strong>
        </div>
        <Avatar initials="AD" size={34} bg="#2E7D32" color="#fff" />
      </div>
    </header>
  );
}