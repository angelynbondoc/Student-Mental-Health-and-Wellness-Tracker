// components/admin/CommunityReviewTab.jsx
import React, { useState } from 'react';

export default function CommunityReviewTab({ communities, onApprove, onReject }) {
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const pending = communities.filter(c => c.status === 'pending');

  if (!pending.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No communities pending review.</p>;
  }

  return (
    <div className="admin-tab-content">
      {pending.map(c => (
        <div key={c.id} className="report-card">
          <div className="report-card__header">
            <div>
              <strong>{c.emoji} {c.name}</strong>
              <span className="report-card__badge report-card__badge--pending">Pending</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', margin: '0.5rem 0', color: 'var(--text-muted)' }}>
            <span>Category: <strong>{c.category}</strong></span>
            {' · '}
            <span>By: <strong>{c.creator?.display_name ?? 'Unknown'}</strong></span>
            {c.creator?.moderation_strikes > 0 && (
              <span style={{ color: 'var(--danger)', marginLeft: 8 }}>
                ⚠️ {c.creator.moderation_strikes} strike(s)
              </span>
            )}
          </div>

          {rejectingId === c.id ? (
            <div style={{ marginTop: '0.75rem' }}>
              <textarea
                placeholder="Rejection reason (shown to user)..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="action-btn action-btn--danger" onClick={() => { onReject(c.id, reason); setRejectingId(null); setReason(''); }}>
                  Confirm Reject
                </button>
                <button className="action-btn" onClick={() => { setRejectingId(null); setReason(''); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="action-btn action-btn--primary" onClick={() => onApprove(c.id)}>
                ✓ Approve
              </button>
              <button className="action-btn action-btn--danger" onClick={() => setRejectingId(c.id)}>
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}