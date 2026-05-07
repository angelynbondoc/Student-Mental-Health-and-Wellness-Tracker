import { X, CheckCircle, UserX, ShieldAlert } from "lucide-react";
import { Avatar, Modal } from "./UI";
import { timeAgo } from "../../utils/timeAgo";

export default function UserReportModal({ report, mode, note, setNote, onClose, onResolve }) {
  if (!report) return null;

  const closeBtn = (
    <button className="modal-close" onClick={onClose}>
      <X size={18} />
    </button>
  );

  if (mode === "details") {
    return (
      <Modal onClose={onClose}>
        <div className="modal-header">
          <h3>User Report Details</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-section__label">Reported User</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={report.reportedUser.avatar} size={40} bg="#EDE7F6" color="#5E35B1" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  {report.reportedUser.name}
                </p>
                <small style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {report.reportedUser.program} · {report.reportedUser.postCount} posts
                </small>
              </div>
            </div>
          </div>
          <div className="modal-info" style={{ marginBottom: 14 }}>
            <p><strong>Reason:</strong> {report.reason}</p>
            <p><strong>Details:</strong> {report.description}</p>
            <small>Reported by <strong>{report.reporter.name}</strong> · {timeAgo(report.reportedAt)}</small>
          </div>
          <label className="modal-label">Admin Note (optional)</label>
          <textarea
            className="modal-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note before taking action..."
          />
          <div className="modal-actions">
            <button className="btn btn--primary" onClick={() => onResolve(report.id, "dismissed")}>
              <CheckCircle size={14} /> Dismiss
            </button>
            <button className="btn btn--danger" onClick={() => onResolve(report.id, "suspended")}>
              <UserX size={14} /> Suspend User
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (mode === "dismiss") {
    return (
      <Modal onClose={onClose}>
        <div className="modal-header">
          <h3>Dismiss User Report</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            No action will be taken against <strong>{report.reportedUser.name}</strong>.
          </p>
          <textarea
            className="modal-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for dismissal (optional)..."
          />
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn--primary-solid" onClick={() => onResolve(report.id, "dismissed")}>
              <CheckCircle size={14} /> Confirm Dismiss
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (mode === "suspend") {
    return (
      <Modal onClose={onClose}>
        <div className="modal-header">
          <h3 style={{ color: "var(--danger)" }}>Suspend User</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <div className="modal-warn-icon">
            <ShieldAlert size={22} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            This will restrict <strong>{report.reportedUser.name}</strong>'s access to the platform.
          </p>
          <div className="modal-danger-user">
            <Avatar initials={report.reportedUser.avatar} size={32} bg="#FFCDD2" color="var(--danger)" />
            <div>
              <p>{report.reportedUser.name}</p>
              <small>{report.reportedUser.program}</small>
            </div>
          </div>
          <textarea
            className="modal-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for suspension (recommended)..."
          />
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn--danger" onClick={() => onResolve(report.id, "suspended")}>
              <UserX size={14} /> Confirm Suspend
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}   