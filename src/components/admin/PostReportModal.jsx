import { X, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Avatar, Modal } from "./UI";
import { timeAgo } from "../../utils/timeAgo";

export default function PostReportModal({ report, mode, note, setNote, onClose, onResolve }) {
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
          <h3>Report Details</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-section__label">Reported Post</div>
            <div className="post-preview__author">
              <Avatar initials={report.post.author.avatar} size={28} bg="#EDE7F6" color="#5E35B1" />
              <div className="post-preview__author-info">
                <p>{report.post.author.name}</p>
                <small>{report.post.author.program}</small>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, marginTop: 6 }}>
              {report.post.content}
            </p>
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
              <CheckCircle size={14} /> Dismiss Report
            </button>
            <button className="btn btn--danger" onClick={() => onResolve(report.id, "removed")}>
              <XCircle size={14} /> Remove Post
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
          <h3>Dismiss Report</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            The post will remain visible. No action taken against the author.
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

  if (mode === "remove") {
    return (
      <Modal onClose={onClose}>
        <div className="modal-header">
          <h3 style={{ color: "var(--danger)" }}>Remove Post</h3>
          {closeBtn}
        </div>
        <div className="modal-body">
          <div className="modal-warn-icon">
            <AlertTriangle size={22} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            This will permanently remove the post. This cannot be undone.
          </p>
          <div className="modal-danger-preview">
            <p>"{report.post.content.substring(0, 100)}..."</p>
          </div>
          <textarea
            className="modal-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for removal (recommended)..."
          />
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn--danger" onClick={() => onResolve(report.id, "removed")}>
              <XCircle size={14} /> Remove Post
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}