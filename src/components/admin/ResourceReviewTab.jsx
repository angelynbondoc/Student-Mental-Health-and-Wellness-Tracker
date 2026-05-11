import React from 'react';
import { Check, X, BookMarked, User, Clock, Link as LinkIcon } from 'lucide-react';
import './CommunityReviewTab/CommunityReviewTab.css'; 

export default function ResourceReviewTab({ resources = [], onApprove, onReject }) {
  
  const fmtDate = iso =>
    new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="crt-root">
      <header className="crt-header">
        <div className="crt-header__icon" aria-hidden="true">
          <BookMarked size={18} strokeWidth={2} />
        </div>
        <div className="crt-header__text">
          <h2 className="crt-title">Resource Review</h2>
          <p className="crt-sub">Review user-submitted academic resources before publishing.</p>
        </div>
        <div className="crt-header__pill-wrap">
          {resources.length > 0 ? (
            <span className="crt-pending-pill">
              <span className="crt-pending-pill__count">{resources.length}</span>
              <span className="crt-pending-pill__label">pending</span>
            </span>
          ) : (
            <span className="crt-clear-pill">All clear</span>
          )}
        </div>
      </header>

      <div className="crt-content">
        {resources.length === 0 ? (
          <div className="crt-empty-state">
            <p className="crt-empty-heading">Queue is empty</p>
            <p className="crt-empty-body">No resources are waiting for review right now.</p>
          </div>
        ) : (
          resources.map((res) => (
            <article key={res.id} className="crt-card">
              <span className="crt-card__rail" />
              
              <div className="crt-card__top">
                <div className="crt-identity">
                  <div className="crt-identity__text">
                    <h3 className="crt-community-name">{res.title}</h3>
                    <div className="crt-identity__meta">
                      <span className="crt-badge-pending">Awaiting review</span>
                      <span className="crt-meta-divider">·</span>
                      <span className="crt-time"><Clock size={11}/> {fmtDate(res.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="crt-detail-strip">
                <div className="crt-detail">
                  <span className="crt-detail__label">Key Idea</span>
                  <span className="crt-detail__value">{res.key_idea}</span>
                </div>
                <div className="crt-detail">
                  <span className="crt-detail__label"><User size={11}/> Submitted by</span>
                  <span className="crt-detail__value">{res.submitter?.display_name ?? 'Unknown'}</span>
                </div>
              </div>

              {/* Extra details specifically for resources */}
              <div style={{ marginBottom: '16px', fontSize: '13px', color: '#525252', background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #ECECEC' }}>
                {res.findings && <p style={{ marginBottom: '8px' }}><strong>Findings:</strong> {res.findings}</p>}
                {res.citation && <p style={{ marginBottom: '8px' }}><strong>Citation:</strong> {res.citation}</p>}
                {res.url && <p><strong><LinkIcon size={12}/> URL:</strong> <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2E7D32' }}>{res.url}</a></p>}
                {res.year && <p style={{ marginTop: '8px' }}><strong>Year:</strong> {res.year}</p>}
              </div>

              <div className="crt-action-row">
                <button className="crt-btn crt-btn--approve" onClick={() => onApprove(res.id)}>
                  <Check size={14} /> Approve
                </button>
                <button className="crt-btn crt-btn--reject" onClick={() => onReject(res.id)}>
                  <X size={14} /> Reject
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}