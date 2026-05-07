import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Avatar } from './UI';
import { timeAgo } from '../../utils/timeAgo';

export default function AppealsTab({ appeals, onResolve, onReject }) {
  const [filter, setFilter] = useState('pending');
  const filtered = appeals.filter(a => a.status === filter);

  return (
    <section>
      <div className="admin-section-header">
        <h2>Suspension Appeals</h2>
        <div className="filter-bar">
          {['pending', 'resolved', 'rejected'].map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty">No {filter} appeals.</div>
      )}

      <div className="report-list">
        {filtered.map(appeal => (
          <div key={appeal.id} className="report-card" style={{ borderLeftColor: 'var(--warn)' }}>
            <div className="report-card__header">
              <div className="report-card__meta">
                <div className="report-card__badges">
                  <span className="time-muted">
                    <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                    {timeAgo(appeal.createdAt)}
                  </span>
                </div>
                <div className="report-card__reason">
                  Appeal from: <strong>{appeal.appellant.name}</strong>
                </div>
                <div className="report-card__desc" style={{ marginTop: 8, padding: '0.75rem', background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
                  {appeal.details}
                </div>
              </div>
              <div className="report-card__reporter">
                <Avatar initials={appeal.appellant.avatar} size={28} />
                <div className="report-card__reporter-info">
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Appellant</p>
                  <p>{appeal.appellant.name}</p>
                </div>
              </div>
            </div>

            {appeal.status === 'pending' && (
              <div className="report-card__actions">
                <button
                  className="btn btn--primary"
                  onClick={() => onResolve(appeal.id, appeal.appellant.id)}
                >
                  <CheckCircle size={14} /> Lift Suspension
                </button>
                <button
                  className="btn btn--danger"
                  onClick={() => onReject(appeal.id)}
                >
                  <XCircle size={14} /> Reject Appeal
                </button>
              </div>
            )}

            {appeal.status !== 'pending' && (
              <div className="report-card__note">
                <strong>Status: </strong>
                <span style={{ color: appeal.status === 'resolved' ? 'var(--primary)' : 'var(--danger)' }}>
                  {appeal.status === 'resolved' ? 'Suspension lifted' : 'Appeal rejected'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}