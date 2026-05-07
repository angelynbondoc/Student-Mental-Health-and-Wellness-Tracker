import React, { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from '../../components/notifications/NotificationItem';
import { PageShell } from '../../components/ui';
import './NotificationsPage.css';

const FILTERS = ['All', 'Unread', 'Likes', 'Comments', 'Community', 'Announcements']

export default function NotificationsPage() {
  const { myNotifs, unreadCount, markOneRead, markAllRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = myNotifs.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.is_read;
    if (activeFilter === 'Likes') return n.type === 'reaction';
    if (activeFilter === 'Comments') return n.type === 'comment';
    if (activeFilter === 'Community') return n.type === 'moderation';
    if (activeFilter === 'Announcements') return n.type === 'announcement';
    return true;
  });

  return (
    <PageShell heading="Notifications" sub="Stay updated on your activity.">

      {/* Filter chips */}
      <div className="np-filter-row">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`np-chip${activeFilter === f ? ' np-chip--active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="np-chip-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mark all read */}
      {unreadCount > 0 && (
        <div className="np-actions-row">
          <button className="np-mark-all-btn" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className="np-list">
        {filtered.length === 0 ? (
          <div className="np-empty">
            <p className="np-empty-icon">🔔</p>
            <p className="np-empty-msg">You're all caught up! No notifications yet.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onMarkRead={markOneRead}
            />
          ))
        )}
      </div>

    </PageShell>
  );
}