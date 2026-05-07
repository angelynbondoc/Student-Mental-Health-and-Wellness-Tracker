import { Search, UserX, UserCheck } from "lucide-react";
import { Avatar, Badge } from "./UI";

export default function UserManagementTab({ users, search, setSearch, toggleUser }) {
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="admin-section-header">
        <h2>User Management</h2>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search
            size={14}
            style={{ position: "absolute", left: 10, color: "var(--text-muted)", pointerEvents: "none" }}
          />
          <input
            className="admin-search"
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or program..."
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Program</th>
              <th>Posts</th>
              <th>Reports</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="table-user-cell">
                    <Avatar
                      initials={u.avatar}
                      size={32}
                      bg={u.status === "suspended" ? "#FFEBEE" : "#E8F5E9"}
                      color={u.status === "suspended" ? "var(--danger)" : "var(--primary)"}
                    />
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.program}</td>
                <td>{u.postCount}</td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color:
                      u.reportCount >= 3 ? "var(--danger)"
                      : u.reportCount >= 1 ? "var(--warn)"
                      : "var(--primary)",
                  }}>
                    {u.reportCount}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {new Date(u.joinedAt).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}
                </td>
                <td><Badge type={u.status}>{u.status}</Badge></td>
                <td>
                  {u.status === "active" ? (
                    <button
                      className="btn btn--danger-outline btn--sm"
                      onClick={() => toggleUser(u.id, "suspended")}
                    >
                      <UserX size={13} /> Suspend
                    </button>
                  ) : (
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => toggleUser(u.id, "active")}
                    >
                      <UserCheck size={13} /> Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}