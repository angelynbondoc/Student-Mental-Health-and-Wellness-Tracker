import { Flag, ShieldAlert, Users, LayoutGrid, Megaphone, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const NAV_ITEMS = [
  { key: "reports",      label: "Reported Posts",   Icon: Flag },
  { key: "userreports",  label: "Reported Users",   Icon: ShieldAlert },
  { key: "users",        label: "User Management",  Icon: Users },
  { key: "communities",  label: "Community Review", Icon: LayoutGrid },
  { key: "broadcast",    label: "Broadcast",        Icon: Megaphone }, 
];

export default function AdminSidebar({
  tab,
  setTab,
  sidebarOpen,
  closeSidebar,
  pendingPosts,
  pendingUsers,
  resolved,
  suspended,
  pendingCommunityCount,
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? '');
    });
  }, []);

  const badges = {
    reports:      pendingPosts,
    userreports:  pendingUsers,
    users:        0,
    communities:  pendingCommunityCount,
    broadcast:    0, 
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="admin-sidebar__label">Navigation</div>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`admin-sidebar__nav-btn ${tab === item.key ? "active" : ""}`}
            onClick={() => {
              setTab(item.key);
              closeSidebar();
            }}
          >
            <item.Icon size={16} />
            {item.label}
            {badges[item.key] > 0 && (
              <span className="nav-badge">{badges[item.key]}</span>
            )}
          </button>
        ))}

        <hr className="admin-sidebar__divider" />
        <div className="admin-sidebar__label">Overview</div>

        {[
          ["Post Reports",        pendingPosts,          "var(--warn)"],
          ["User Reports",        pendingUsers,          "var(--warn)"],
          ["Pending Communities", pendingCommunityCount, "var(--primary)"],
          ["Resolved",            resolved,              "var(--primary)"],
          ["Suspended",           suspended,             "var(--danger)"],
        ].map(([label, value, color]) => (
          <div key={label} className="admin-sidebar__stat-row">
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
          </div>
        ))}

        {/* ── Footer: email + Sign Out ─────────────────────────────────────── */}
        <div className="admin-sidebar__footer">
          <hr className="admin-sidebar__divider" />
          <div className="admin-sidebar__user-email" title={email}>
            {email || "Admin"}
          </div>
          <button className="admin-sidebar__signout-btn" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
}