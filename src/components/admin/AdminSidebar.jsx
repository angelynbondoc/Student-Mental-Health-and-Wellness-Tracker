import { Flag, ShieldAlert, Users } from "lucide-react";

const NAV_ITEMS = [
  { key: "reports",     label: "Reported Posts", Icon: Flag },
  { key: "userreports", label: "Reported Users", Icon: ShieldAlert },
  { key: "users",       label: "User Management", Icon: Users },
];

export default function AdminSidebar({
  tab, setTab, sidebarOpen, closeSidebar,
  pendingPosts, pendingUsers, resolved, suspended,
}) {
  const badges = {
    reports: pendingPosts,
    userreports: pendingUsers,
    users: 0,
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar__label">Navigation</div>

        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`admin-sidebar__nav-btn ${tab === key ? "active" : ""}`}
            onClick={() => { setTab(key); closeSidebar(); }}
          >
            <Icon size={16} />
            {label}
            {badges[key] > 0 && (
              <span className="nav-badge">{badges[key]}</span>
            )}
          </button>
        ))}

        <hr className="admin-sidebar__divider" />
        <div className="admin-sidebar__label">Overview</div>

        {[
          ["Post Reports", pendingPosts, "var(--warn)"],
          ["User Reports", pendingUsers, "var(--warn)"],
          ["Resolved",     resolved,     "var(--primary)"],
          ["Suspended",    suspended,    "var(--danger)"],
        ].map(([label, value, color]) => (
          <div key={label} className="admin-sidebar__stat-row">
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
          </div>
        ))}
      </aside>
    </>
  );
}