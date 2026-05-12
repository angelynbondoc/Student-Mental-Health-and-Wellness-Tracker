// src/components/admin/ResourceReviewTab.jsx

import React, { useState, useContext } from 'react';
import {
  Check, X, BookMarked, User, Clock, Link as LinkIcon,
  Plus, BookOpen, Calendar, FileText, Lightbulb, AlignLeft,
  Quote, CheckCircle2, Trash2, Edit
} from 'lucide-react';
import { supabase } from '../../supabase';
import AppContext from '../../AppContext';
import './CommunityReviewTab/CommunityReviewTab.css';
import './ResourceReviewTab.css';


/**
 * AdminResourceModal
 * Handles both the creation of new resources and the editing of existing ones.
 * @param {Object} props
 * @param {Object|null} props.initialData - Resource data to edit, or null for creation.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onSaved - Callback invoked when a resource is successfully saved.
 */
function AdminResourceModal({ initialData, onClose, onSaved }) {
  const { currentUser } = useContext(AppContext);
  const [form, setForm] = useState({
    year: initialData?.year || '', 
    key_idea: initialData?.key_idea || '', 
    title: initialData?.title || '', 
    findings: initialData?.findings || '', 
    citation: initialData?.citation || '', 
    url: initialData?.url || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.key_idea.trim()) { setError('Key idea is required.'); return; }
    setSubmitting(true);
    setError(null);
    
    const payload = {
      key_idea:     form.key_idea.trim(),
      title:        form.title.trim()    || null,
      year:         form.year ? parseInt(form.year, 10) : null,
      findings:     form.findings.trim() || null,
      citation:     form.citation.trim() || null,
      url:          form.url.trim()      || null,
    };

    if (initialData) {
      // Edit existing resource
      const { data, error: err } = await supabase.from('resources').update(payload)
        .eq('id', initialData.id)
        .select(`*, submitter:profiles!resources_submitted_by_fkey(id, display_name)`).single();
      
      setSubmitting(false);
      if (err) { setError('Failed to update resource. Please try again.'); return; }
      onSaved(data, true);
    } else {
      // Create new resource
      payload.status = 'approved';
      payload.submitted_by = currentUser?.id ?? null;
      
      const { data, error: err } = await supabase.from('resources').insert(payload)
        .select(`*, submitter:profiles!resources_submitted_by_fkey(id, display_name)`).single();
      
      setSubmitting(false);
      if (err) { setError('Failed to add resource. Please try again.'); return; }
      onSaved(data, false);
    }
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
            <h2 className="rrt-modal-title">{initialData ? 'Edit Resource' : 'Add Resource'}</h2>
            <p className="rrt-modal-sub">
              {initialData ? 'Modifications are published immediately.' : 'Published immediately — no review queue.'}
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
              <><span className="rrt-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              <><Check size={14} /> {initialData ? 'Save Changes' : 'Publish resource'}</>
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
export default function ResourceReviewTab({ 
  pendingResources = [], 
  publishedResources = [],
  onApprove, 
  onReject,
  onDelete,
  onAddResource,
  onUpdateResource
  }) {
  const [filter, setFilter]             = useState('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [toast, setToast]               = useState(null);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  /**
   * Handler for when a resource is successfully saved from the modal.
   * @param {Object} data - The updated or newly inserted resource.
   * @param {boolean} isEdit - Flag indicating if the operation was an edit.
   */
  const handleModalSaved = (data, isEdit) => {
    if (isEdit) {
      setEditingResource(null);
      setToast('Resource updated successfully.');
      onUpdateResource(data);
    } else {
      setShowAddModal(false);
      setToast('Resource published to the library.');
      onAddResource(data);
      setFilter('published');
    }
  };

  const handleApproved = (id) => {
    onApprove(id);
    setToast('Resource approved and published.');
  };

  const handleRejected = (id) => {
    onReject(id);
    setToast('Resource rejected and removed from queue.');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this published resource?")) {
      onDelete(id);
      setToast('Resource deleted.');
    }
  };

  const displayList = filter === 'pending' ? pendingResources : publishedResources;

  return (
    <>
      <div className="crt-root">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="crt-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="crt-header__icon" aria-hidden="true">
              <BookMarked size={18} strokeWidth={2} />
            </div>
            <div className="crt-header__text" style={{ paddingTop: 0 }}>
              <h2 className="crt-title">Resource Library</h2>
              <p className="crt-sub">
                Review user-submitted resources or manage published ones.
              </p>
            </div>
          </div>

          <div className="rrt-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="filter-bar">
              <button 
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} 
                onClick={() => setFilter('pending')}
              >
                Pending {pendingResources.length > 0 && `(${pendingResources.length})`}
              </button>
              <button 
                className={`filter-btn ${filter === 'published' ? 'active' : ''}`} 
                onClick={() => setFilter('published')}
              >
                Published
              </button>
            </div>

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
          {displayList.length === 0 ? (
            <div className="crt-empty-state">
              <div className="crt-empty-art" aria-hidden="true">
                <div className="crt-empty-art__ring" />
                <div className="crt-empty-art__icon">
                  <CheckCircle2 size={28} strokeWidth={1.8} />
                </div>
              </div>
              <p className="crt-empty-heading">
                {filter === 'pending' ? 'Queue is empty' : 'Library is empty'}
              </p>
              <p className="crt-empty-body">
                {filter === 'pending' 
                  ? 'No resources are waiting for review right now.' 
                  : 'No published resources in the library yet.'}
              </p>
            </div>
          ) : (
            displayList.map((res) => (
              <article key={res.id} className="crt-card">
                <span className="crt-card__rail" />

                {/* Top */}
                <div className="crt-card__top">
                  <div className="crt-identity">
                    <div className="crt-identity__text">
                      <h3 className="crt-community-name">{res.title || res.key_idea}</h3>
                      <div className="crt-identity__meta">
                        {res.status === 'pending' ? (
                          <span className="crt-badge-pending">
                            <span className="crt-badge-pending__dot" aria-hidden="true" />
                            Awaiting review
                          </span>
                        ) : (
                          <span className="crt-badge-pending" style={{ background: 'var(--crt-green-tint)', color: 'var(--crt-green)', border: '1px solid var(--crt-green-tint-2)' }}>
                            Published
                          </span>
                        )}
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
                  {filter === 'pending' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <button
                        className="crt-btn"
                        style={{ color: 'var(--crt-text-secondary)', borderColor: 'var(--crt-border-strong)', background: 'var(--crt-surface)' }}
                        onClick={() => setEditingResource(res)}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--crt-surface-soft)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--crt-surface)'; }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="crt-btn"
                        style={{ color: 'var(--crt-danger)', borderColor: '#EDD9D9', background: 'var(--crt-surface)' }}
                        onClick={() => handleDelete(res.id)}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--crt-danger-tint)'; e.currentTarget.style.borderColor = 'var(--crt-danger)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--crt-surface)'; e.currentTarget.style.borderColor = '#EDD9D9'; }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {(showAddModal || editingResource) && (
        <AdminResourceModal
          initialData={editingResource}
          onClose={() => {
            setShowAddModal(false);
            setEditingResource(null);
          }}
          onSaved={handleModalSaved}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </>
  );
}