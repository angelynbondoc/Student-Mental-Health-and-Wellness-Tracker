// =============================================================================
// ReportModal.jsx — uses createPortal to escape overflow:hidden parents
// =============================================================================
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ReportModal.css';

const POST_REASONS = [
  { id: 'harmful',        label: 'Harmful or dangerous content' },
  { id: 'harassment',     label: 'Harassment or bullying' },
  { id: 'misinformation', label: 'Misinformation or false claims' },
  { id: 'spam',           label: 'Spam or repetitive content' },
  { id: 'inappropriate',  label: 'Sexually inappropriate' },
  { id: 'selfharm',       label: 'Self-harm or suicidal content' },
  { id: 'other',          label: 'Other' },
];

const PROFILE_REASONS = [
  { id: 'impersonation',  label: 'Impersonating someone' },
  { id: 'harassment',     label: 'Harassment or threatening behavior' },
  { id: 'fake',           label: 'Fake or bot account' },
  { id: 'inappropriate',  label: 'Inappropriate profile content' },
  { id: 'spam',           label: 'Spam account' },
  { id: 'other',          label: 'Other' },
];

export default function ReportModal({ type = 'post', targetId, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails]               = useState('');
  const [submitted, setSubmitted]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);

  const reasons = type === 'profile' ? PROFILE_REASONS : POST_REASONS;
  const title   = type === 'profile' ? 'Report Profile' : 'Report Post';

  async function handleSubmit() {
    if (!selectedReason) return;
    setSubmitting(true);
    await onSubmit?.(selectedReason, details, targetId, type);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return createPortal(
      <div className="rm-backdrop" onClick={onClose}>
        <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rm-success">
            <div className="rm-success-icon" aria-hidden="true">✓</div>
            <h2 className="rm-success-title">Report submitted</h2>
            <p className="rm-success-body">
              Thank you for helping keep this community safe. Our team will review your report.
            </p>
            <button className="rm-btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="rm-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>

        <div className="rm-header">
          <h2 className="rm-title">{title}</h2>
          <button className="rm-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="rm-subtitle">
          Why are you reporting this {type}? Your report is anonymous.
        </p>

        <ul className="rm-reasons" role="radiogroup">
          {reasons.map((r) => (
            <li key={r.id}>
              <button
                role="radio"
                aria-checked={selectedReason === r.id}
                className={`rm-reason-btn ${selectedReason === r.id ? 'rm-reason-btn--selected' : ''}`}
                onClick={() => setSelectedReason(r.id)}
              >
                <span className="rm-reason-radio" aria-hidden="true" />
                {r.label}
              </button>
            </li>
          ))}
        </ul>

        {selectedReason && (
          <div className="rm-details-wrap">
            <label className="rm-details-label" htmlFor="rm-details">
              Additional details <span className="rm-optional">(optional)</span>
            </label>
            <textarea
              id="rm-details"
              className="rm-details-input"
              placeholder="Provide any additional context…"
              maxLength={500}
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <span className="rm-char-count">{details.length}/500</span>
          </div>
        )}

        <div className="rm-actions">
          <button className="rm-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="rm-btn-primary"
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}