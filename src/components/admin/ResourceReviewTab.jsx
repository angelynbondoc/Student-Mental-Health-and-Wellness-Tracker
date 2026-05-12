import React, { useState, useContext } from 'react';
import {
  Check, X, BookMarked, User, Clock, Link as LinkIcon,
  Plus, BookOpen, Calendar, FileText, Lightbulb, AlignLeft,
  Quote, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../supabase';
import AppContext from '../../AppContext';
import './CommunityReviewTab/CommunityReviewTab.css';
import './ResourceReviewTab.css';

/* ─── Admin Add Resource Modal ───────────────────────────────────────────── */
function AdminAddResourceModal({ onClose, onAdded }) {
  const { currentUser } = useContext(AppContext);
  const [form, setForm] = useState({
    year: '', key_idea: '', title: '', findings: '', citation: '', url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.key_idea.trim()) { setError('Key idea is required.'); return; }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from('resources').insert({
      key_idea:     form.key_idea.trim(),
      title:        form.title.trim()    || null,
      year:         form.year ? parseInt(form.year, 10) : null,
      findings:     form.findings.trim() || null,
      citation:     form.citation.trim() || null,
      url:          form.url.trim()      || null,
      status:       'approved',            // admin adds directly — no review needed
      submitted_by: currentUser?.id ?? null,
    });
    setSubmitting(false);
    if (err) { setError('Failed to add resource. Please try again.'); return; }
    onAdded();
  };

  return (
    <div className="rrt-overlay" onClick={onClose}>
      <div className="rrt-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rrt-modal-header">
          <div className="rrt-modal-header__icon" aria-hidden="true">
            <BookOpen size={18} strokeWidth={2} />
          </div>
          <div>
            <h2 className="rrt-modal-title">Add Resource</h2>
            <p className="rrt-modal-sub">
              Published immediately — no review queue.
            </p>
          </div>
          <button className="rrt-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Live preview */}
        <div className="rrt-preview">
          <span className="rrt-preview__label">Preview</span>
          <div className="rrt-preview__card">
            <div className="rrt-preview__index">01</div>
            <div className="rrt-preview__meta">
              <div className="rrt-preview__topline">
                <Calendar size={11} strokeWidth={2.2} />
                <span>{form.year || 'Year'}</span>
                <span className="rrt-preview__dot">·</span>
                <FileText size={11} strokeWidth={2.2} />
                <span>Research article</span>
              </div>
              <p className="rrt-preview__key-idea">
                {form.key_idea || 'Key idea will appear here'}
              </p>
              {form.title && <p className="rrt-preview__title">{form.title}</p>}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="rrt-fields">

          {/* Year + Key Idea row */}
          <div className="rrt-row">
            <div className="rrt-field rrt-field--sm">
              <label className="rrt-label">
                <Calendar size={13} strokeWidth={2.2} /> Year
              </label>
              <input
                className="rrt-input"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="2024"
                value={form.year}
                onChange={set('year')}
              />
            </div>
            <div className="rrt-field rrt-field--grow">
              <label className="rrt-label">
                <Lightbulb size={13} strokeWidth={2.2} />
                Key Idea <span className="rrt-required">*</span>
              </label>
              <input
                className="rrt-input"
                type="text"
                placeholder="The main takeaway or headline"
                value={form.key_idea}
                onChange={set('key_idea')}
                maxLength={120}
              />
            </div>
          </div>

          {/* Title */}
          <div className="rrt-field">
            <label className="rrt-label">
              <FileText size={13} strokeWidth={2.2} /> Article Title
            </label>
            <input
              className="rrt-input"
              type="text"
              placeholder="Full title of the paper or article"
              value={form.title}
              onChange={set('title')}
              maxLength={200}
            />
          </div>

          {/* Findings */}
          <div className="rrt-field">
            <label className="rrt-label">
              <AlignLeft size={13} strokeWidth={2.2} /> Key Findings
            </label>
            <textarea
              className="rrt-textarea"
              rows={3}
              placeholder="Summarise the main findings or conclusions…"
              value={form.findings}
              onChange={set('findings')}
              maxLength={600}
            />
            <span className="rrt-char">{form.findings.length}/600</span>
          </div>

          {/* Citation */}
          <div className="rrt-field">
            <label className="rrt-label">
              <Quote size={13} strokeWidth={2.2} /> Citation
            </label>
            <input
              className="rrt-input"
              type="text"
              placeholder="APA or MLA citation"
              value={form.citation}
              onChange={set('citation')}
              maxLength={300}
            />
          </div>

          {/* URL */}
          <div className="rrt-field">
            <label className="rrt-label">
              <LinkIcon size={13} strokeWidth={2.2} /> Article URL
            </label>
            <input
              className="rrt-input"
              type="url"
              placeholder="https://doi.org/…"
              value={form.url}
              onChange={set('url')}
            />
          </div>

          {error && <p className="rrt-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="rrt-modal-footer">
          <button
            className="rrt-btn rrt-btn--ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="rrt-btn rrt-btn--primary"
            onClick={handleSubmit}
            disabled={submitting || !form.key_idea.trim()}
          >
            {submitting ? (
              <><span className="rrt-spinner" aria-hidden="true" /> Publishing…</>
            ) : (
              <><Check size={14} /> Publish resource</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success toast ──────────────────────────────────────────────────────── */
function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="rrt-toast" role="status">
      <CheckCircle2 size={15} strokeWidth={2.5} />
      {message}
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function ResourceReviewTab({ resources = [], onApprove, onReject }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast]               = useState(null);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  const handleAdded = () => {
    setShowAddModal(false);
    setToast('Resource published to the library.');
  };

  const handleApproved = (id) => {
    onApprove(id);
    setToast('Resource approved and published.');
  };

  const handleRejected = (id) => {
    onReject(id);
    setToast('Resource rejected and removed from queue.');
  };

  return (
    <>
      <div className="crt-root">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="crt-header">
          <div className="crt-header__icon" aria-hidden="true">
            <BookMarked size={18} strokeWidth={2} />
          </div>
          <div className="crt-header__text">
            <h2 className="crt-title">Resource Review</h2>
            <p className="crt-sub">
              Review user-submitted academic resources before publishing.
            </p>
          </div>

          {/* Right side: pending pill + add button */}
          <div className="rrt-header-actions">
            {resources.length > 0 ? (
              <span className="crt-pending-pill">
                <span className="crt-pending-pill__count">{resources.length}</span>
                <span className="crt-pending-pill__label">pending</span>
              </span>
            ) : (
              <span className="crt-clear-pill">
                <CheckCircle2 size={12} strokeWidth={2.4} aria-hidden="true" />
                All clear
              </span>
            )}
            <button
              type="button"
              className="rrt-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add resource
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="crt-content">
          {resources.length === 0 ? (
            <div className="crt-empty-state">
              <div className="crt-empty-art" aria-hidden="true">
                <div className="crt-empty-art__ring" />
                <div className="crt-empty-art__icon">
                  <CheckCircle2 size={28} strokeWidth={1.8} />
                </div>
              </div>
              <p className="crt-empty-heading">Queue is empty</p>
              <p className="crt-empty-body">
                No resources are waiting for review right now.
              </p>
            </div>
          ) : (
            resources.map((res) => (
              <article key={res.id} className="crt-card">
                <span className="crt-card__rail" />

                {/* Top */}
                <div className="crt-card__top">
                  <div className="crt-identity">
                    <div className="crt-identity__text">
                      <h3 className="crt-community-name">{res.title || res.key_idea}</h3>
                      <div className="crt-identity__meta">
                        <span className="crt-badge-pending">
                          <span className="crt-badge-pending__dot" aria-hidden="true" />
                          Awaiting review
                        </span>
                        <span className="crt-meta-divider" aria-hidden="true">·</span>
                        <span className="crt-time">
                          <Clock size={11} strokeWidth={2.2} />
                          {fmtDate(res.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail strip */}
                <div className="crt-detail-strip">
                  <div className="crt-detail">
                    <span className="crt-detail__label">Key Idea</span>
                    <span className="crt-detail__value">{res.key_idea}</span>
                  </div>
                  <div className="crt-detail">
                    <span className="crt-detail__label">
                      <User size={11} /> Submitted by
                    </span>
                    <span className="crt-detail__value">
                      {res.submitter?.display_name ?? 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Extra details */}
                <div className="rrt-detail-body">
                  {res.findings && (
                    <p><strong>Findings:</strong> {res.findings}</p>
                  )}
                  {res.citation && (
                    <p><strong>Citation:</strong> {res.citation}</p>
                  )}
                  {res.url && (
                    <p>
                      <strong>URL:</strong>{' '}
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="rrt-link">
                        {res.url}
                      </a>
                    </p>
                  )}
                  {res.year && <p><strong>Year:</strong> {res.year}</p>}
                </div>

                {/* Actions */}
                <div className="crt-action-row">
                  <button
                    className="crt-btn crt-btn--approve"
                    onClick={() => handleApproved(res.id)}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    className="crt-btn crt-btn--reject"
                    onClick={() => handleRejected(res.id)}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {showAddModal && (
        <AdminAddResourceModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </>
  );
}