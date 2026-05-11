// components/admin/CommunityReviewTab.jsx
import React, { useState } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Inbox,
  CheckCircle2,
  User,
  Tag,
} from 'lucide-react';
import './CommunityReviewTab.css';

/* ─── Button ─────────────────────────────────────────────────────────────── */
function Btn({ variant = 'cancel', onClick, children, ariaLabel, disabled }) {
  return (
    <button
      type="button"
      className={`crt-btn crt-btn--${variant}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ─── Community card ─────────────────────────────────────────────────────── */
function CommunityCard({
  community: c,
  isRejecting,
  onApprove,
  onStartReject,
  onCancelReject,
  onConfirmReject,
  index,
}) {
  const [reason, setReason] = useState('');

  const fmtDate = iso =>
    new Date(iso).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const fmtRelative = iso => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7)   return `${days} days ago`;
    if (days < 30)  return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} ago`;
    return fmtDate(iso);
  };

  const handleConfirm = () => {
    onConfirmReject(c.id, reason);
    setReason('');
  };

  const handleCancel = () => {
    onCancelReject();
    setReason('');
  };

  const initials = (c.name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <article
      className={`crt-card ${isRejecting ? 'is-rejecting' : ''}`}
      style={{ '--crt-stagger': `${index * 60}ms` }}
      aria-label={`Community: ${c.name}`}
    >
      <span className="crt-card__rail" aria-hidden="true" />

      {/* Top row */}
      <div className="crt-card__top">
        <div className="crt-identity">
          <div className="crt-identity__text">
            <h3 className="crt-community-name">{c.name}</h3>
            <div className="crt-identity__meta">
              <span className="crt-badge-pending">
                <span className="crt-badge-pending__dot" aria-hidden="true" />
                Awaiting review
              </span>
              <span className="crt-meta-divider" aria-hidden="true">·</span>
              <span className="crt-time">
                <Clock size={11} strokeWidth={2.2} aria-hidden="true" />
                {fmtRelative(c.created_at)}
              </span>
            </div>
          </div>
        </div>

        <span className="crt-card__date" title={fmtDate(c.created_at)}>
          {fmtDate(c.created_at)}
        </span>
      </div>

      {/* Detail strip */}
      <div className="crt-detail-strip">
        <div className="crt-detail">
          <span className="crt-detail__label">
            <Tag size={11} strokeWidth={2.2} aria-hidden="true" />
            Category
          </span>
          <span className="crt-detail__value">{c.category || '—'}</span>
        </div>

        <div className="crt-detail">
          <span className="crt-detail__label">
            <User size={11} strokeWidth={2.2} aria-hidden="true" />
            Created by
          </span>
          <span className="crt-detail__value">
            {c.creator?.display_name ?? 'Unknown'}
            {c.creator?.moderation_strikes > 0 && (
              <span className="crt-strike-pill" role="status">
                <ShieldAlert size={10} strokeWidth={2.5} aria-hidden="true" />
                {c.creator.moderation_strikes} strike
                {c.creator.moderation_strikes === 1 ? '' : 's'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      {isRejecting ? (
        <div className="crt-reject-panel" role="group" aria-label="Rejection form">
          <div className="crt-reject-header">
            <AlertTriangle size={14} strokeWidth={2.2} aria-hidden="true" />
            <p className="crt-reject-label">
              Rejection reason
              <span className="crt-reject-label-hint">
                visible to the community creator
              </span>
            </p>
          </div>
          <textarea
            className="crt-textarea"
            placeholder="Briefly explain why this community wasn't approved…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            autoFocus
            aria-label={`Rejection reason for ${c.name}`}
          />
          <div className="crt-reject-actions">
            <Btn variant="cancel" onClick={handleCancel} ariaLabel="Cancel rejection">
              Cancel
            </Btn>
            <Btn
              variant="confirm-reject"
              onClick={handleConfirm}
              ariaLabel={`Confirm rejection of ${c.name}`}
              disabled={!reason.trim()}
            >
              <X size={14} strokeWidth={2.2} aria-hidden="true" />
              Reject community
            </Btn>
          </div>
        </div>
      ) : (
        <div className="crt-action-row">
          <Btn
            variant="approve"
            onClick={() => onApprove(c.id)}
            ariaLabel={`Approve ${c.name}`}
          >
            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
            Approve
          </Btn>
          <Btn
            variant="reject"
            onClick={() => onStartReject(c.id)}
            ariaLabel={`Reject ${c.name}`}
          >
            <X size={14} strokeWidth={2.4} aria-hidden="true" />
            Reject
          </Btn>
        </div>
      )}
    </article>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="crt-empty-state" role="status">
      <div className="crt-empty-art" aria-hidden="true">
        <div className="crt-empty-art__ring" />
        <div className="crt-empty-art__icon">
          <CheckCircle2 size={28} strokeWidth={1.8} />
        </div>
      </div>
      <p className="crt-empty-heading">All caught up</p>
      <p className="crt-empty-body">
        No communities are waiting for review. New submissions will appear here automatically.
      </p>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function CommunityReviewTab({ communities = [], onApprove, onReject }) {
  const [rejectingId, setRejectingId] = useState(null);

  const pending = communities.filter(c => c.status === 'pending');

  const handleConfirmReject = (id, reason) => {
    onReject(id, reason);
    setRejectingId(null);
  };

  return (
    <div className="crt-root">
      {/* Tab header */}
      <header className="crt-header">
        <div className="crt-header__icon" aria-hidden="true">
          <Inbox size={18} strokeWidth={2} />
        </div>
        <div className="crt-header__text">
          <h2 className="crt-title">Community Review</h2>
          <p className="crt-sub">
            Approve or reject student-submitted communities before they go live.
          </p>
        </div>
        <div className="crt-header__pill-wrap">
          {pending.length > 0 ? (
            <span className="crt-pending-pill" aria-live="polite">
              <span className="crt-pending-pill__count">{pending.length}</span>
              <span className="crt-pending-pill__label">
                pending
              </span>
            </span>
          ) : (
            <span className="crt-clear-pill" aria-live="polite">
              <CheckCircle2 size={12} strokeWidth={2.4} aria-hidden="true" />
              All clear
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="crt-content">
        {pending.length === 0 ? (
          <EmptyState />
        ) : (
          pending.map((c, i) => (
            <CommunityCard
              key={c.id}
              community={c}
              index={i}
              isRejecting={rejectingId === c.id}
              onApprove={onApprove}
              onStartReject={id => setRejectingId(id)}
              onCancelReject={() => setRejectingId(null)}
              onConfirmReject={handleConfirmReject}
            />
          ))
        )}
      </div>
    </div>
  );
}