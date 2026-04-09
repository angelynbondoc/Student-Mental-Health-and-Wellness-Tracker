// =============================================================================
// NotificationsPanel.jsx
// Feature 10: Renders filtered notifications for currentUser.
// Used inside InboxPage (Alerts tab) AND the MobileLayout bell dropdown.
// =============================================================================
import React, { useContext } from 'react';
import AppContext from '../AppContext';

const TYPE_ICON = {
  comment:  '💬',
  reaction: '👍',
  share:    '🔁',
  system:   '🔔',
};

export default function NotificationsPanel() {
  const { currentUser, notifications, setNotifications } = useContext(AppContext);

  // Filter to this user's notifications only, sorted newest-first
  // SQL equivalent: SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC
  const myNotifs = notifications
    .filter((n) => n.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = myNotifs.filter((n) => !n.is_read).length;

  // Mark one notification as read
  // Immutability pattern: .map() returns a NEW array — never mutate state directly
  const markOneRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  // Mark ALL of this user's notifications as read in one action
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.user_id === currentUser.id ? { ...n, is_read: true } : n
      )
    );
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>
          Alerts{' '}
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {myNotifs.length === 0 && (
        <p style={styles.empty}>You're all caught up! 🎉</p>
      )}

      <div style={styles.list}>
        {myNotifs.map((notif) => (
          <div
            key={notif.id}
            style={{
              ...styles.item,
              ...(notif.is_read ? styles.itemRead : styles.itemUnread),
            }}
          >
            <span style={styles.icon}>{TYPE_ICON[notif.type] ?? '🔔'}</span>
            <div style={styles.body}>
              <p style={styles.content}>{notif.content}</p>
              <p style={styles.time}>
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
            {!notif.is_read && (
              <button
                style={styles.readBtn}
                onClick={() => markOneRead(notif.id)}
                aria-label="Mark as read"
              >
                ✓
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  panel: { padding: '4px 0' },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: {
    fontSize: 16, fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  badge: {
    background: '#ef4444', color: '#fff',
    fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 7px',
  },
  markAllBtn: {
    fontSize: 12, color: '#6366f1',
    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
  },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '24px 0' },
  list:  { display: 'flex', flexDirection: 'column', gap: 8 },
  item: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '12px 14px', borderRadius: 12,
  },
  itemUnread: { background: '#eff6ff', borderLeft: '3px solid #6366f1' },
  itemRead:   { background: '#f9fafb', borderLeft: '3px solid #e5e7eb' },
  icon:  { fontSize: 20, flexShrink: 0, marginTop: 2 },
  body:  { flex: 1 },
  content: { fontSize: 13, color: '#374151', margin: 0, fontWeight: 500 },
  time:    { fontSize: 11, color: '#9ca3af', margin: '3px 0 0' },
  readBtn: {
    flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
    border: '1.5px solid #6366f1', background: '#fff',
    color: '#6366f1', cursor: 'pointer', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};