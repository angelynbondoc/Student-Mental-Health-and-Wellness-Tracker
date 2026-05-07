// =============================================================================
// BroadcastTab.jsx
// Admin tab for composing and sending announcements to all/specific users
// or posting directly to the General community.
// =============================================================================
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../../supabase';
import {
  Megaphone,
  Send,
  Search,
  Check,
  Users as UsersIcon,
  UserCheck,
  Bell,
  MessageSquare,
  Trash2,
  Edit2
} from 'lucide-react';
import './BroadcastTab.css';

const MAX_TITLE = 120;
const MAX_MSG   = 500;

export default function BroadcastTab({ users = [], broadcastNotification, createAdminPost }) {
  const [broadcastMode, setBroadcastMode] = useState('notification'); // 'notification' | 'post'
  const [title, setTitle]             = useState('');
  const [message, setMessage]         = useState('');
  const [targetType, setTargetType]   = useState('all');
  const [userSearch, setUserSearch]   = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending]         = useState(false);

  // Past Broadcasts State
  const [pastBroadcasts, setPastBroadcasts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  useEffect(() => {
    if (broadcastMode === 'post') {
      fetchBroadcasts();
    }
  }, [broadcastMode]);

  async function fetchBroadcasts() {
    setIsFetchingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .ilike('content', '[Admin Broadcast]\n%')
      .order('created_at', { ascending: false });
    if (data) setPastBroadcasts(data);
    setIsFetchingPosts(false);
  }

  async function handleDeleteBroadcast(id) {
    if (!window.confirm("Delete this broadcast permanently?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPastBroadcasts(prev => prev.filter(p => p.id !== id));
    }
  }

  async function handleSaveEdit(id) {
    if (!editContent.trim()) return;
    const { error } = await supabase
      .from('posts')
      .update({ content: `[Admin Broadcast]\n${editContent.trim()}` })
      .eq('id', id);
    
    if (!error) {
      setPastBroadcasts(prev => prev.map(p => p.id === id ? { ...p, content: `[Admin Broadcast]\n${editContent.trim()}` } : p));
      setEditingId(null);
    }
  }

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
    (broadcastMode === 'post' || (title.trim().length > 0 && !(targetType === 'selected' && selectedIds.size === 0)));

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
    
    if (broadcastMode === 'notification') {
      const ok = await broadcastNotification({
        title,
        message,
        targetType,
        selectedUserIds: targetType === 'selected' ? [...selectedIds] : [],
      });
      if (ok) {
        setTitle('');
        setMessage('');
        setSelectedIds(new Set());
        setUserSearch('');
        setTargetType('all');
      }
    } else {
      const ok = await createAdminPost(message);
      if (ok) {
        setMessage('');
        fetchBroadcasts();
      }
    }
    
    setSending(false);
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
          <h2 className="bc-title">Broadcast & Posts</h2>
          <p className="bc-sub">
            Send direct notifications to users or post publicly to the General community.
          </p>
        </div>
      </div>

      <div className="bc-body">
        {/* ── LEFT: Compose card ────────────────────────────────────────── */}
        <section className="bc-compose">
          {/* Mode Switcher */}
          <div className="bc-field">
            <div className="bc-segmented" role="tablist" aria-label="Broadcast Mode">
              <button
                type="button"
                role="tab"
                aria-selected={broadcastMode === 'notification'}
                className={`bc-segmented__btn ${broadcastMode === 'notification' ? 'is-active' : ''}`}
                onClick={() => setBroadcastMode('notification')}
              >
                <Bell size={15} strokeWidth={2} />
                <span>Notification</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={broadcastMode === 'post'}
                className={`bc-segmented__btn ${broadcastMode === 'post' ? 'is-active' : ''}`}
                onClick={() => setBroadcastMode('post')}
              >
                <MessageSquare size={15} strokeWidth={2} />
                <span>Community Post</span>
              </button>
            </div>
          </div>

          {/* Title input (Notifications only) */}
          {broadcastMode === 'notification' && (
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
          )}

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
              placeholder={broadcastMode === 'notification' ? "Write your announcement here…" : "Write your community post here..."}
              rows={5}
              maxLength={MAX_MSG}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {/* Audience segmented control (Notifications only) */}
          {broadcastMode === 'notification' && (
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
          )}

          {/* Live preview */}
          <div className="bc-field">
            <label className="bc-label">Preview</label>
            <div className="bc-preview">
              <div className="bc-preview__strip" aria-hidden="true" />
              <div className="bc-preview__icon" aria-hidden="true">
                {broadcastMode === 'notification' ? <Bell size={16} strokeWidth={2} /> : <MessageSquare size={16} strokeWidth={2} />}
              </div>
              <div className="bc-preview__body">
                {broadcastMode === 'notification' ? (
                  <>
                    <div className="bc-preview__meta">
                      <span className="bc-preview__source">NEU Wellness · Admin</span>
                      <span className="bc-preview__dot" aria-hidden="true">·</span>
                      <span className="bc-preview__time">just now</span>
                    </div>
                    <p className={`bc-preview__title ${!title ? 'is-placeholder' : ''}`}>
                      {title || 'Announcement title'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bc-preview__meta">
                      <span className="bc-preview__source">General Community</span>
                      <span className="bc-preview__dot" aria-hidden="true">·</span>
                      <span className="bc-preview__time">just now</span>
                    </div>
                    <p className="bc-preview__title">Admin</p>
                  </>
                )}
                <p className={`bc-preview__msg ${!message ? 'is-placeholder' : ''}`}>
                  {message || (broadcastMode === 'notification' ? 'Your message will appear here. Keep it clear, calm, and helpful.' : 'Your post content will appear here.')}
                </p>
              </div>
            </div>
          </div>

          {/* Send footer */}
          <div className="bc-send-row">
            <div className="bc-recipient">
              <UsersIcon size={14} strokeWidth={2} />
              <span>{broadcastMode === 'notification' ? recipientLabel : 'General Community'}</span>
            </div>
            <button
              type="button"
              className="bc-send-btn"
              onClick={handleSend}
              disabled={!canSend}
              aria-label={broadcastMode === 'notification' ? `Send announcement to ${recipientCount} recipients` : 'Post to General Community'}
            >
              {sending ? (
                <>
                  <span className="bc-spinner" aria-hidden="true" />
                  <span>{broadcastMode === 'notification' ? 'Sending…' : 'Posting…'}</span>
                </>
              ) : (
                <>
                  <Send size={15} strokeWidth={2} />
                  <span>{broadcastMode === 'notification' ? 'Send announcement' : 'Post to Community'}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── RIGHT: User picker (only when 'selected' + notification) ─────────────────── */}
        {broadcastMode === 'notification' && targetType === 'selected' && (
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

        {/* ── RIGHT: Recent Broadcasts (only when 'post') ─────────────────── */}
        {broadcastMode === 'post' && (
          <aside className="bc-picker">
            <div className="bc-picker__header">
              <div>
                <p className="bc-picker__title">Recent Broadcasts</p>
                <p className="bc-picker__count">Manage your community posts</p>
              </div>
            </div>

            <ul className="bc-user-list" style={{ padding: '8px' }}>
              {isFetchingPosts ? (
                <li className="bc-user-empty"><span>Loading...</span></li>
              ) : pastBroadcasts.length === 0 ? (
                <li className="bc-user-empty">
                  <MessageSquare size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>No past broadcasts.</span>
                </li>
              ) : (
                pastBroadcasts.map(p => {
                  const contentText = p.content.replace('[Admin Broadcast]\n', '').trim();
                  const isEditing = editingId === p.id;

                  return (
                    <li key={p.id} className="bc-user-row" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px', cursor: 'default' }}>
                      {isEditing ? (
                        <textarea 
                          className="bc-textarea"
                          style={{ minHeight: '60px', marginBottom: '8px', padding: '8px' }}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                        />
                      ) : (
                        <p style={{ fontSize: '13px', color: 'var(--bc-text)', marginBottom: '8px', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {contentText}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--bc-text-muted)' }}>
                          {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--bc-text-secondary)', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                              <button onClick={() => handleSaveEdit(p.id)} style={{ background: 'none', border: 'none', color: 'var(--bc-green)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(p.id); setEditContent(contentText); }} style={{ background: 'none', border: 'none', color: 'var(--bc-text-secondary)', fontSize: '12px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}><Edit2 size={12}/> Edit</button>
                              <button onClick={() => handleDeleteBroadcast(p.id)} style={{ background: 'none', border: 'none', color: 'var(--bc-danger)', fontSize: '12px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}><Trash2 size={12}/> Delete</button>
                            </>
                          )}
                        </div>
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