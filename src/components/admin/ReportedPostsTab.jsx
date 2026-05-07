import { Clock, Heart, MessageCircle, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Avatar, Badge, FilterBar } from "./UI";
import { timeAgo } from "../../utils/timeAgo";

export default function ReportedPostsTab({
  reports, filter, setFilter,
  setSelReport, setPostModal,
}) {
  const filtered = reports.filter((r) => r.status === filter);

  return (
    <section>
      <div className="admin-section-header">
        <h2>Reported Posts</h2>
        <FilterBar value={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty">No {filter} post reports.</div>
      )}

      <div className="report-list">
        {filtered.map((rep) => {
          const accentColor =
            rep.status === "pending" ? "var(--warn)"
            : rep.resolution === "removed" ? "var(--danger)"
            : "var(--primary)";

          return (
            <div key={rep.id} className="report-card" style={{ borderLeftColor: accentColor }}>
              {/* Header */}
              <div className="report-card__header">
                <div className="report-card__meta">
                  <div className="report-card__badges">
                    <Badge type={rep.status === "pending" ? "pending" : rep.resolution}>
                      {rep.status === "pending" ? "Pending"
                        : rep.resolution === "removed" ? "Post Removed"
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
                </div>

                <div className="report-card__reporter">
                  <Avatar initials={rep.reporter.avatar} size={28} />
                  <div className="report-card__reporter-info">
                    <p>{rep.reporter.name}</p>
                    <small>{rep.reporter.program}</small>
                  </div>
                </div>
              </div>

              {/* Post preview */}
              <div className="post-preview">
                <div className="post-preview__author">
                  <Avatar initials={rep.post.author.avatar} size={26} bg="#EDE7F6" color="#5E35B1" />
                  <div className="post-preview__author-info">
                    <p>{rep.post.author.name}</p>
                    <small>{rep.post.author.program} · {timeAgo(rep.post.postedAt)}</small>
                  </div>
                </div>
                <p className="post-preview__content">{rep.post.content}</p>
                <div className="post-preview__stats">
                  <span><Heart size={11} style={{ display: "inline", marginRight: 3 }} />{rep.post.likes}</span>
                  <span><MessageCircle size={11} style={{ display: "inline", marginRight: 3 }} />{rep.post.comments}</span>
                </div>
              </div>

              {/* Actions */}
              {rep.status === "pending" && (
                <div className="report-card__actions">
                  <button className="btn btn--ghost" onClick={() => { setSelReport(rep); setPostModal("details"); }}>
                    <ChevronRight size={14} /> Details
                  </button>
                  <button className="btn btn--primary" onClick={() => { setSelReport(rep); setPostModal("dismiss"); }}>
                    <CheckCircle size={14} /> Dismiss
                  </button>
                  <button className="btn btn--danger" onClick={() => { setSelReport(rep); setPostModal("remove"); }}>
                    <XCircle size={14} /> Remove Post
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