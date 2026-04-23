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
import { NotificationsPanel } from '../components/notifications';
import { generateUUID } from '../Mockdata';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-inbox {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
    display: flex;              /* ← add these 3 lines */
    flex-direction: column;
    align-items: center;
  }
  .neu-inbox-inner { max-width: 720px;
  width: 100%; }
  .neu-inbox-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 22px; font-weight: 600;
    color: #1A1A1A; margin: 0 0 20px;
  }

  /* Tab bar */
  .neu-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .neu-tab {
    flex: 1; padding: 10px 8px;
    border-radius: 10px; border: 1px solid #E8E8E8;
    background: #FFFFFF; cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-weight: 500; font-size: 14px;
    color: #616161; display: flex;
    align-items: center; justify-content: center;
    gap: 6px; transition: all 0.15s ease;
  }
  .neu-tab:hover { border-color: #2E7D32; color: #2E7D32; background: #E8F5E9; }
  /* Active tab — primary green */
  .neu-tab--active {
    background: #2E7D32; color: #FFFFFF;
    border-color: #2E7D32;
    box-shadow: 0 2px 8px rgba(46,125,50,0.22);
  }
  .neu-tab--active:hover { background: #1B5E20; border-color: #1B5E20; color: #FFFFFF; }

  /* Thread list */
  .neu-thread-list { display: flex; flex-direction: column; gap: 6px; }
  .neu-inbox-empty {
    font-family: 'DM Sans', sans-serif;
    color: #9E9E9E; font-size: 14px;
    text-align: center; padding: 48px 0; font-style: italic;
  }

  /* Thread item */
  .neu-thread-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; border-radius: 12px;
    cursor: pointer; background: #FFFFFF;
    border: 1px solid #E8E8E8;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .neu-thread-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); border-color: #2E7D32; }
  /* Unread: green tint + left border */
  .neu-thread-item--unread {
    background: #E8F5E9; border-left: 3px solid #2E7D32;
  }
  .neu-thread-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #2E7D32, #66BB6A);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 16px;
  }
  .neu-thread-preview { flex: 1; min-width: 0; }
  .neu-thread-row {
    display: flex; justify-content: space-between;
    align-items: center; gap: 8px;
  }
  .neu-thread-name {
    font-family: 'Poppins', sans-serif;
    font-size: 14px; font-weight: 600; color: #1A1A1A;
  }
  .neu-thread-time {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: #9E9E9E; flex-shrink: 0;
  }
  .neu-thread-snippet {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: #9E9E9E; margin: 3px 0 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .neu-unread-badge {
    background: #2E7D32; color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    border-radius: 100px; padding: 2px 8px; flex-shrink: 0;
  }

  /* Chat thread */
  .neu-chat-wrapper {
    display: flex; flex-direction: column;
    height: calc(100vh - 200px);
    min-height: 400px;
  }
  .neu-back-btn {
    background: none; border: none;
    color: #2E7D32; font-family: 'Poppins', sans-serif;
    font-weight: 600; font-size: 14px;
    cursor: pointer; padding: 0 0 10px; text-align: left;
    transition: color 0.15s ease;
  }
  .neu-back-btn:hover { color: #1B5E20; }
  .neu-chat-header {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #9E9E9E; margin-bottom: 16px;
  }
  .neu-chat-header strong {
    font-family: 'Poppins', sans-serif;
    color: #1A1A1A;
  }
  .neu-bubble-list {
    flex: 1; overflow-y: auto;
    display: flex; flex-direction: column;
    gap: 8px; padding-bottom: 12px;
  }
  .neu-bubble-row { display: flex; }
  .neu-bubble { max-width: 72%; padding: 10px 14px; border-radius: 16px; }
  /* My bubble: primary green */
  .neu-bubble--mine {
    background: #2E7D32; color: #FFFFFF;
    border-bottom-right-radius: 4px;
  }
  /* Their bubble: muted surface */
  .neu-bubble--theirs {
    background: #F2F2F2; color: #1A1A1A;
    border-bottom-left-radius: 4px;
  }
  .neu-bubble-text { font-family: 'DM Sans', sans-serif; font-size: 14px; margin: 0; line-height: 1.5; }
  .neu-bubble-time { font-family: 'DM Sans', sans-serif; font-size: 10px; opacity: 0.65; margin: 4px 0 0; text-align: right; }
  .neu-compose-row { display: flex; gap: 8px; padding-top: 10px; }
  .neu-compose-input {
    flex: 1; padding: 11px 16px;
    border-radius: 100px; border: 1px solid #E8E8E8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none;
    background: #F2F2F2; color: #1A1A1A;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .neu-compose-input:focus {
    border-color: #2E7D32; background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(46,125,50,0.10);
  }
  .neu-send-btn {
    padding: 11px 22px; border-radius: 100px; border: none;
    background: #2E7D32; color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-weight: 600; font-size: 14px;
    cursor: pointer; white-space: nowrap;
    transition: background 0.15s ease;
  }
  .neu-send-btn:hover { background: #1B5E20; }

  @media (max-width: 768px) { .neu-inbox { padding: 24px 20px; } }
  @media (max-width: 480px) { .neu-inbox { padding: 18px 16px; } .neu-bubble { max-width: 88%; } }
`;

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

  const threads        = getThreads();
  const lastMsg        = (msgs) => msgs[msgs.length - 1];
  const unreadInThread = (msgs) =>
    msgs.filter((dm) => dm.receiver_id === currentUser.id && !dm.is_read).length;
  const getProfile     = (id) => profiles.find((p) => p.id === id);

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
    <div className="neu-thread-list">
      {threads.size === 0 && <p className="neu-inbox-empty">No messages yet.</p>}
      {[...threads.entries()].map(([otherId, messages]) => {
        const other  = getProfile(otherId);
        const last   = lastMsg(messages);
        const unread = unreadInThread(messages);
        return (
          <div
            key={otherId}
            className={`neu-thread-item${unread > 0 ? ' neu-thread-item--unread' : ''}`}
            onClick={() => openThread(otherId)}
          >
            <div className="neu-thread-avatar">
              {(other?.display_name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="neu-thread-preview">
              <div className="neu-thread-row">
                <span className="neu-thread-name">{other?.display_name ?? otherId}</span>
                <span className="neu-thread-time">
                  {new Date(last.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="neu-thread-snippet">
                {last.sender_id === currentUser.id ? 'You: ' : ''}
                {last.message_text.length > 50
                  ? last.message_text.slice(0, 50) + '…'
                  : last.message_text}
              </p>
            </div>
            {unread > 0 && <span className="neu-unread-badge">{unread}</span>}
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
      <div className="neu-chat-wrapper">
        <button className="neu-back-btn" onClick={() => setOpenThreadId(null)}>
          ← Back
        </button>
        <p className="neu-chat-header">
          Chat with <strong>{otherUser?.display_name ?? openThreadId}</strong>
        </p>
        <div className="neu-bubble-list">
          {messages.map((dm) => {
            const isMine = dm.sender_id === currentUser.id;
            return (
              <div
                key={dm.id}
                className="neu-bubble-row"
                style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}
              >
                <div className={`neu-bubble${isMine ? ' neu-bubble--mine' : ' neu-bubble--theirs'}`}>
                  <p className="neu-bubble-text">{dm.message_text}</p>
                  <p className="neu-bubble-time">
                    {new Date(dm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMine && (dm.is_read ? ' · Read' : ' · Sent')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="neu-compose-row">
          <input
            className="neu-compose-input"
            type="text"
            placeholder="Type a message…"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="neu-send-btn" onClick={handleSend}>Send ➤</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="neu-inbox">
        <div className="neu-inbox-inner">
          <h2 className="neu-inbox-heading">Inbox</h2>

          <div className="neu-tabs">
            <button
              className={`neu-tab${activeTab === 'dms' ? ' neu-tab--active' : ''}`}
              onClick={() => { setActiveTab('dms'); setOpenThreadId(null); }}
            >
              💬 Messages
            </button>
            <button
              className={`neu-tab${activeTab === 'alerts' ? ' neu-tab--active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              🔔 Alerts
              {unreadAlerts > 0 && (
                /* Muted Red badge — alerts only per design rationale */
                <span style={{
                  background: '#C62828', color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 100, padding: '1px 6px',
                }}>
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'dms'    && (openThreadId ? renderChatThread() : renderThreadList())}
          {activeTab === 'alerts' && <NotificationsPanel />}
        </div>
      </div>
    </>
  );
}