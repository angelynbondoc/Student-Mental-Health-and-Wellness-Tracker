import { Clock, ChevronRight, CheckCircle, UserX } from "lucide-react";
import { Avatar, Badge, FilterBar } from "./UI";
import { timeAgo } from "../../utils/timeAgo";

export default function ReportedUsersTab({
  userReports, urFilter, setUrFilter,
  setSelUserReport, setUserModal,
}) {
  const filtered = userReports.filter((r) => r.status === urFilter);

  return (
    <section>
      <div className="admin-section-header">
        <h2>Reported Users</h2>
        <FilterBar value={urFilter} onChange={setUrFilter} />
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty">No {urFilter} user reports.</div>
      )}

      <div className="report-list">
        {filtered.map((rep) => {
          const accentColor =
            rep.status === "pending" ? "var(--warn)"
            : rep.resolution === "suspended" ? "var(--danger)"
            : "var(--primary)";

          return (
            <div key={rep.id} className="report-card" style={{ borderLeftColor: accentColor }}>
              <div className="report-card__header">
                <div className="report-card__meta">
                  <div className="report-card__badges">
                    <Badge type={rep.status === "pending" ? "pending" : rep.resolution === "suspended" ? "suspended" : "dismissed"}>
                      {rep.status === "pending" ? "Pending"
                        : rep.resolution === "suspended" ? "User Suspended"
                        : "Dismissed"}
                    </Badge>
                    <span className="time-muted">
                      <Clock size={11} style={{ display: "inline", marginRight: 3 }} />
                      {timeAgo(rep.reportedAt)}
                    </span>
                  </div>
                  <div className="report-card__reason">
                    Reason: <span>{rep.reason}</span>
                  </div>
                  <div className="report-card__desc">{rep.description}</div>

                  {/* Reported user card */}
                  <div className="user-report-card">
                    <div className="user-report-card__profile">
                      <Avatar initials={rep.reportedUser.avatar} size={38} bg="#EDE7F6" color="#5E35B1" />
                      <div className="user-report-card__info">
                        <p>{rep.reportedUser.name}</p>
                        <small>{rep.reportedUser.program}</small>
                      </div>
                    </div>
                    <div className="user-report-card__stats">
                      <div className="user-report-card__stat">
                        <strong>{rep.reportedUser.postCount}</strong>
                        Posts
                      </div>
                      <div className="user-report-card__stat">
                        <strong>
                          {new Date(rep.reportedUser.joinedAt).toLocaleDateString("en-PH", {
                            month: "short", year: "numeric",
                          })}
                        </strong>
                        Joined
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reporter info */}
                <div className="report-card__reporter">
                  <Avatar initials={rep.reporter.avatar} size={28} />
                  <div className="report-card__reporter-info">
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Reported by</p>
                    <p>{rep.reporter.name}</p>
                    <small>{rep.reporter.program}</small>
                  </div>
                </div>
              </div>

              {rep.status === "pending" && (
                <div className="report-card__actions">
                  <button className="btn btn--ghost" onClick={() => { setSelUserReport(rep); setUserModal("details"); }}>
                    <ChevronRight size={14} /> Details
                  </button>
                  <button className="btn btn--primary" onClick={() => { setSelUserReport(rep); setUserModal("dismiss"); }}>
                    <CheckCircle size={14} /> Dismiss
                  </button>
                  <button className="btn btn--danger" onClick={() => { setSelUserReport(rep); setUserModal("suspend"); }}>
                    <UserX size={14} /> Suspend User
                  </button>
                </div>
              )}

              {rep.status === "resolved" && rep.adminNote && (
                <div className="report-card__note">
                  <strong>Admin note: </strong>
                  <span>{rep.adminNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}