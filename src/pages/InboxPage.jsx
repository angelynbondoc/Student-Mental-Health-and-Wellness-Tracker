// =============================================================================
// InboxPage.jsx
// Features 11 & 12: Tabbed Inbox — "DMs" + "Alerts"
//
// ORAL DEFENSE — DM GROUPING ALGORITHM:
//   direct_messages is a FLAT array (one row = one message).
//   To show threads, we:
//   1. FILTER rows where I am sender OR receiver
//   2. IDENTIFY the "other person" in each row
//   3. GROUP into a Map (key=otherUserId, value=messages[])
//   4. SORT each thread chronologically
//   This mirrors: SELECT * FROM direct_messages WHERE sender_id=? OR receiver_id=?
// =============================================================================
import React, { useContext, useState } from 'react';
import AppContext from '../AppContext';
import NotificationsPanel from '../components/NotificationsPanel';
import { generateUUID } from '../Mockdata';

export default function InboxPage() {
  const {
    currentUser, profiles,
    directMessages, setDirectMessages,
    notifications,
  } = useContext(AppContext);

  const [activeTab,    setActiveTab]    = useState('dms');
  const [openThreadId, setOpenThreadId] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const unreadAlerts = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read
  ).length;

  // ── STEP 1–4: Build thread map ────────────────────────────────────────────
  const getThreads = () => {
    // STEP 1: Only messages involving me
    const myMessages = directMessages.filter(
      (dm) => dm.sender_id === currentUser.id || dm.receiver_id === currentUser.id
    );

    // STEP 2 & 3: Group by the other participant's ID
    const threadMap = new Map();
    myMessages.forEach((dm) => {
      const otherId = dm.sender_id === currentUser.id ? dm.receiver_id : dm.sender_id;
      if (!threadMap.has(otherId)) threadMap.set(otherId, []);
      threadMap.get(otherId).push(dm);
    });

    // STEP 4: Sort each thread oldest → newest
    threadMap.forEach((msgs, key) => {
      threadMap.set(key, msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    });

    return threadMap;
  };

  const threads    = getThreads();
  const lastMsg    = (msgs) => msgs[msgs.length - 1];
  const unreadInThread = (msgs) =>
    msgs.filter((dm) => dm.receiver_id === currentUser.id && !dm.is_read).length;
  const getProfile = (id) => profiles.find((p) => p.id === id);

  // ── Send a new message ─────────────────────────────────────────────────────
  // ORAL DEFENSE: Follows schema exactly — sender_id, receiver_id, is_read=false
  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !openThreadId) return;
    setDirectMessages((prev) => [
      ...prev,
      {
        id:           generateUUID(),
        sender_id:    currentUser.id,
        receiver_id:  openThreadId,
        message_text: trimmed,
        is_read:      false,
        created_at:   new Date().toISOString(),
      },
    ]);
    setMessageInput('');
  };

  // Auto-mark thread messages as read when opened
  const openThread = (otherId) => {
    setOpenThreadId(otherId);
    setDirectMessages((prev) =>
      prev.map((dm) =>
        dm.sender_id === otherId && dm.receiver_id === currentUser.id && !dm.is_read
          ? { ...dm, is_read: true }
          : dm
      )
    );
  };

  // ── Thread list ────────────────────────────────────────────────────────────
  const renderThreadList = () => (
    <div style={styles.threadList}>
      {threads.size === 0 && <p style={styles.empty}>No messages yet.</p>}
      {[...threads.entries()].map(([otherId, messages]) => {
        const other  = getProfile(otherId);
        const last   = lastMsg(messages);
        const unread = unreadInThread(messages);
        return (
          <div
            key={otherId}
            style={{ ...styles.threadItem, ...(unread > 0 ? styles.threadUnread : {}) }}
            onClick={() => openThread(otherId)}
          >
            <div style={styles.avatar}>
              {(other?.display_name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div style={styles.threadPreview}>
              <div style={styles.threadRow}>
                <span style={styles.threadName}>{other?.display_name ?? otherId}</span>
                <span style={styles.threadTime}>
                  {new Date(last.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={styles.threadSnippet}>
                {last.sender_id === currentUser.id ? 'You: ' : ''}
                {last.message_text.length > 50
                  ? last.message_text.slice(0, 50) + '…'
                  : last.message_text}
              </p>
            </div>
            {unread > 0 && <span style={styles.unreadBadge}>{unread}</span>}
          </div>
        );
      })}
    </div>
  );

  // ── Chat thread ────────────────────────────────────────────────────────────
  const renderChatThread = () => {
    const messages  = threads.get(openThreadId) ?? [];
    const otherUser = getProfile(openThreadId);
    return (
      <div style={styles.chatWrapper}>
        <button style={styles.backBtn} onClick={() => setOpenThreadId(null)}>
          ← Back
        </button>
        <p style={styles.chatHeader}>
          Chat with <strong>{otherUser?.display_name ?? openThreadId}</strong>
        </p>
        <div style={styles.bubbleList}>
          {messages.map((dm) => {
            const isMine = dm.sender_id === currentUser.id;
            return (
              <div
                key={dm.id}
                style={{ ...styles.bubbleRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}
              >
                <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}>
                  <p style={styles.bubbleText}>{dm.message_text}</p>
                  <p style={styles.bubbleTime}>
                    {new Date(dm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMine && (dm.is_read ? ' · Read' : ' · Sent')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={styles.composeRow}>
          <input
            style={styles.composeInput}
            type="text"
            placeholder="Type a message…"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button style={styles.sendBtn} onClick={handleSend}>Send ➤</button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Inbox</h2>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'dms' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('dms'); setOpenThreadId(null); }}
        >
          💬 Messages
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'alerts' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Alerts
          {unreadAlerts > 0 && <span style={styles.tabBadge}>{unreadAlerts}</span>}
        </button>
      </div>

      {activeTab === 'dms'    && (openThreadId ? renderChatThread() : renderThreadList())}
      {activeTab === 'alerts' && <NotificationsPanel />}
    </div>
  );
}

const styles = {
  page:    { padding: '20px 16px', fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' },
  heading: { fontSize: 22, fontWeight: 700, margin: '0 0 16px' },
  tabs:    { display: 'flex', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1, padding: '10px 8px', borderRadius: 12, border: '1.5px solid #e5e7eb',
    background: '#f9fafb', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  tabBadge: {
    background: '#ef4444', color: '#fff', fontSize: 10,
    borderRadius: 20, padding: '1px 5px', fontWeight: 700,
  },
  threadList: { display: 'flex', flexDirection: 'column', gap: 4 },
  empty:      { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '32px 0' },
  threadItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    borderRadius: 14, cursor: 'pointer', background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  threadUnread: { background: '#eff6ff', borderLeft: '3px solid #6366f1' },
  avatar: {
    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 17,
  },
  threadPreview: { flex: 1, minWidth: 0 },
  threadRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  threadName:    { fontSize: 14, fontWeight: 700, color: '#111827' },
  threadTime:    { fontSize: 11, color: '#9ca3af' },
  threadSnippet: {
    fontSize: 12, color: '#6b7280', margin: '2px 0 0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  unreadBadge: {
    background: '#6366f1', color: '#fff', fontSize: 11,
    fontWeight: 700, borderRadius: 20, padding: '2px 7px', flexShrink: 0,
  },
  chatWrapper:  { display: 'flex', flexDirection: 'column', height: '70vh' },
  backBtn: {
    background: 'none', border: 'none', color: '#6366f1',
    fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '0 0 8px', textAlign: 'left',
  },
  chatHeader:   { fontSize: 15, color: '#374151', marginBottom: 12 },
  bubbleList: {
    flex: 1, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12,
  },
  bubbleRow:    { display: 'flex' },
  bubble:       { maxWidth: '75%', padding: '10px 14px', borderRadius: 18 },
  bubbleMine:   { background: '#6366f1', color: '#fff', borderBottomRightRadius: 4 },
  bubbleTheirs: { background: '#f3f4f6', color: '#111827', borderBottomLeftRadius: 4 },
  bubbleText:   { fontSize: 14, margin: 0, lineHeight: 1.5 },
  bubbleTime:   { fontSize: 10, opacity: 0.7, margin: '4px 0 0', textAlign: 'right' },
  composeRow:   { display: 'flex', gap: 8, paddingTop: 8 },
  composeInput: {
    flex: 1, padding: '12px 14px', borderRadius: 24,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
  },
  sendBtn: {
    padding: '12px 18px', borderRadius: 24, border: 'none',
    background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
};