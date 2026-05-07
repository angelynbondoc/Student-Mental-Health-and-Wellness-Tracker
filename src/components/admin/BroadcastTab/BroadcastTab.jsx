// =============================================================================
// BroadcastTab.jsx
// Admin tab for composing and sending announcements to all or specific users.
// =============================================================================
import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Send,
  Search,
  Check,
  Users as UsersIcon,
  UserCheck,
  Bell,
} from 'lucide-react';
import './BroadcastTab.css';

const MAX_TITLE = 120;
const MAX_MSG   = 500;

export default function BroadcastTab({ users = [], broadcastNotification }) {
  const [title, setTitle]             = useState('');
  const [message, setMessage]         = useState('');
  const [targetType, setTargetType]   = useState('all');
  const [userSearch, setUserSearch]   = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending]         = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────
  const eligibleUsers = useMemo(
    () => users.filter(u => u.status !== 'suspended'),
    [users]
  );

  const filteredUsers = useMemo(
    () =>
      eligibleUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase())
      ),
    [eligibleUsers, userSearch]
  );

  const allSelected =
    selectedIds.size > 0 && selectedIds.size === eligibleUsers.length;

  const recipientCount =
    targetType === 'all' ? eligibleUsers.length : selectedIds.size;

  const recipientLabel =
    targetType === 'all'
      ? `All active users (${eligibleUsers.length})`
      : `${selectedIds.size} user${selectedIds.size !== 1 ? 's' : ''} selected`;

  const canSend =
    !sending &&
    message.trim().length > 0 &&
    title.trim().length > 0 &&
    !(targetType === 'selected' && selectedIds.size === 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleUser = id =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(
      allSelected ? new Set() : new Set(eligibleUsers.map(u => u.id))
    );

  const handleSend = async () => {
    setSending(true);
    const ok = await broadcastNotification({
      title,
      message,
      targetType,
      selectedUserIds: targetType === 'selected' ? [...selectedIds] : [],
    });
    setSending(false);
    if (ok) {
      setTitle('');
      setMessage('');
      setSelectedIds(new Set());
      setUserSearch('');
      setTargetType('all');
    }
  };

  const counterClass =
    message.length > MAX_MSG * 0.9
      ? 'bc-counter bc-counter--warn'
      : 'bc-counter';

  return (
    <div className="bc-root">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bc-header">
        <div className="bc-header__icon" aria-hidden="true">
          <Megaphone size={22} strokeWidth={2} />
        </div>
        <div className="bc-header__text">
          <h2 className="bc-title">Broadcast Announcement</h2>
          <p className="bc-sub">
            Send a notification to selected users or to everyone in the community.
          </p>
        </div>
      </div>

      <div className="bc-body">
        {/* ── LEFT: Compose card ────────────────────────────────────────── */}
        <section className="bc-compose">
          {/* Title input */}
          <div className="bc-field">
            <div className="bc-field__head">
              <label htmlFor="bc-title" className="bc-label">Title</label>
              <span className={title.length > MAX_TITLE * 0.9 ? 'bc-counter bc-counter--warn' : 'bc-counter'}>
                {title.length}/{MAX_TITLE}
              </span>
            </div>
            <input
              id="bc-title"
              className="bc-input"
              type="text"
              placeholder="e.g. System maintenance scheduled"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={MAX_TITLE}
            />
          </div>

          {/* Message input */}
          <div className="bc-field">
            <div className="bc-field__head">
              <label htmlFor="bc-msg" className="bc-label">Message</label>
              <span className={counterClass}>
                {message.length}/{MAX_MSG}
              </span>
            </div>
            <textarea
              id="bc-msg"
              className="bc-textarea"
              placeholder="Write your announcement here…"
              rows={5}
              maxLength={MAX_MSG}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {/* Audience segmented control */}
          <div className="bc-field">
            <label className="bc-label">Audience</label>
            <div className="bc-segmented" role="tablist" aria-label="Audience">
              <button
                type="button"
                role="tab"
                aria-selected={targetType === 'all'}
                className={`bc-segmented__btn ${targetType === 'all' ? 'is-active' : ''}`}
                onClick={() => setTargetType('all')}
              >
                <UsersIcon size={15} strokeWidth={2} />
                <span>All users</span>
                <span className="bc-segmented__count">{eligibleUsers.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={targetType === 'selected'}
                className={`bc-segmented__btn ${targetType === 'selected' ? 'is-active' : ''}`}
                onClick={() => setTargetType('selected')}
              >
                <UserCheck size={15} strokeWidth={2} />
                <span>Selected</span>
                <span className="bc-segmented__count">{selectedIds.size}</span>
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="bc-field">
            <label className="bc-label">Preview</label>
            <div className="bc-preview">
              <div className="bc-preview__strip" aria-hidden="true" />
              <div className="bc-preview__icon" aria-hidden="true">
                <Bell size={16} strokeWidth={2} />
              </div>
              <div className="bc-preview__body">
                <div className="bc-preview__meta">
                  <span className="bc-preview__source">NEU Wellness · Admin</span>
                  <span className="bc-preview__dot" aria-hidden="true">·</span>
                  <span className="bc-preview__time">just now</span>
                </div>
                <p className={`bc-preview__title ${!title ? 'is-placeholder' : ''}`}>
                  {title || 'Announcement title'}
                </p>
                <p className={`bc-preview__msg ${!message ? 'is-placeholder' : ''}`}>
                  {message || 'Your message will appear here. Keep it clear, calm, and helpful.'}
                </p>
              </div>
            </div>
          </div>

          {/* Send footer */}
          <div className="bc-send-row">
            <div className="bc-recipient">
              <UsersIcon size={14} strokeWidth={2} />
              <span>{recipientLabel}</span>
            </div>
            <button
              type="button"
              className="bc-send-btn"
              onClick={handleSend}
              disabled={!canSend}
              aria-label={`Send announcement to ${recipientCount} recipients`}
            >
              {sending ? (
                <>
                  <span className="bc-spinner" aria-hidden="true" />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <Send size={15} strokeWidth={2} />
                  <span>Send announcement</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── RIGHT: User picker (only when 'selected') ─────────────────── */}
        {targetType === 'selected' && (
          <aside className="bc-picker">
            <div className="bc-picker__header">
              <div>
                <p className="bc-picker__title">Recipients</p>
                <p className="bc-picker__count">
                  {selectedIds.size} of {eligibleUsers.length} selected
                </p>
              </div>
              <button
                type="button"
                className="bc-select-all"
                onClick={toggleAll}
                disabled={eligibleUsers.length === 0}
              >
                {allSelected ? 'Clear' : 'Select all'}
              </button>
            </div>

            <div className="bc-picker__search-wrap">
              <Search size={14} strokeWidth={2} className="bc-picker__search-icon" aria-hidden="true" />
              <input
                className="bc-picker__search"
                type="text"
                placeholder="Search users…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <ul className="bc-user-list" role="listbox" aria-multiselectable="true">
              {filteredUsers.length === 0 ? (
                <li className="bc-user-empty">
                  <Search size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>No users match your search.</span>
                </li>
              ) : (
                filteredUsers.map(u => {
                  const isSelected = selectedIds.has(u.id);
                  return (
                    <li
                      key={u.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`bc-user-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => toggleUser(u.id)}
                    >
                      <div className="bc-user-avatar" aria-hidden="true">
                        {u.avatar || (u.name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="bc-user-info">
                        <span className="bc-user-name">{u.name}</span>
                        <span className="bc-user-role">{u.role}</span>
                      </div>
                      <div
                        className={`bc-user-check ${isSelected ? 'is-on' : ''}`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}