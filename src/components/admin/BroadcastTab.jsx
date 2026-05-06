// =============================================================================
// BroadcastTab.jsx
// Admin tab for composing and sending announcements to all or specific users.
// =============================================================================
import React, { useState, useMemo } from 'react';
import './BroadcastTab.css';

const MAX_MSG = 500;

export default function BroadcastTab({ users = [], broadcastNotification }) {
  const [title, setTitle]           = useState('');
  const [message, setMessage]       = useState('');
  const [targetType, setTargetType] = useState('all');   // 'all' | 'selected'
  const [userSearch, setUserSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending]       = useState(false);

  // ── User picker (only active / non-admin users shown) ───────────────────────
  const eligibleUsers = useMemo(() =>
    users.filter(u => u.status !== 'suspended'),
    [users]
  );

  const filteredUsers = useMemo(() =>
    eligibleUsers.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase())
    ),
    [eligibleUsers, userSearch]
  );

  const toggleUser = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === eligibleUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleUsers.map(u => u.id)));
    }
  };

  // ── Send ────────────────────────────────────────────────────────────────────
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

  const recipientLabel =
    targetType === 'all'
      ? `All active users (${eligibleUsers.length})`
      : `${selectedIds.size} user${selectedIds.size !== 1 ? 's' : ''} selected`;

  return (
    <div className="bc-root">
      <div className="bc-header">
        <h2 className="bc-title">Broadcast Announcement</h2>
        <p className="bc-sub">
          Post an admin message — it will appear in every recipient's Notifications page.
        </p>
      </div>

      <div className="bc-body">
        {/* ── LEFT: Compose ───────────────────────────────────────────── */}
        <div className="bc-compose">

          {/* Title */}
          <label className="bc-label" htmlFor="bc-title">Title</label>
          <input
            id="bc-title"
            className="bc-input"
            type="text"
            placeholder="e.g. System maintenance scheduled"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
          />

          {/* Message */}
          <label className="bc-label" htmlFor="bc-msg">
            Message
            <span className={`bc-counter ${message.length > MAX_MSG * 0.9 ? 'bc-counter--warn' : ''}`}>
              {message.length}/{MAX_MSG}
            </span>
          </label>
          <textarea
            id="bc-msg"
            className="bc-textarea"
            placeholder="Write your announcement here…"
            rows={6}
            maxLength={MAX_MSG}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          {/* Audience toggle */}
          <label className="bc-label">Audience</label>
          <div className="bc-audience-row">
            <button
              className={`bc-audience-btn ${targetType === 'all' ? 'bc-audience-btn--active' : ''}`}
              onClick={() => setTargetType('all')}
            >
              All Users
            </button>
            <button
              className={`bc-audience-btn ${targetType === 'selected' ? 'bc-audience-btn--active' : ''}`}
              onClick={() => setTargetType('selected')}
            >
              Selected Users
            </button>
          </div>

          {/* Preview card */}
          <div className="bc-preview">
            <div className="bc-preview-label">Preview</div>
            <div className="bc-preview-notif">
              <span className="bc-preview-icon">📣</span>
              <div className="bc-preview-text">
                <p className="bc-preview-title">{title || 'Announcement title'}</p>
                <p className="bc-preview-msg">{message || 'Your message will appear here…'}</p>
              </div>
            </div>
          </div>

          {/* Send */}
          <div className="bc-send-row">
            <span className="bc-recipient-label">{recipientLabel}</span>
            <button
              className="bc-send-btn"
              onClick={handleSend}
              disabled={sending || !message.trim() || (targetType === 'selected' && selectedIds.size === 0)}
            >
              {sending ? 'Sending…' : '📤 Send Announcement'}
            </button>
          </div>
        </div>

        {/* ── RIGHT: User picker (only when 'selected') ───────────────── */}
        {targetType === 'selected' && (
          <div className="bc-picker">
            <div className="bc-picker-header">
              <span className="bc-picker-title">Select Recipients</span>
              <button className="bc-select-all" onClick={toggleAll}>
                {selectedIds.size === eligibleUsers.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <input
              className="bc-picker-search"
              type="text"
              placeholder="Search users…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />

            <ul className="bc-user-list">
              {filteredUsers.length === 0 && (
                <li className="bc-user-empty">No users found.</li>
              )}
              {filteredUsers.map(u => (
                <li
                  key={u.id}
                  className={`bc-user-row ${selectedIds.has(u.id) ? 'bc-user-row--selected' : ''}`}
                  onClick={() => toggleUser(u.id)}
                >
                  <div className="bc-user-avatar">{u.avatar}</div>
                  <div className="bc-user-info">
                    <span className="bc-user-name">{u.name}</span>
                    <span className="bc-user-role">{u.role}</span>
                  </div>
                  <div className={`bc-user-check ${selectedIds.has(u.id) ? 'bc-user-check--on' : ''}`}>
                    {selectedIds.has(u.id) ? '✓' : ''}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}