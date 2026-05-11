// =============================================================================
// NotificationsPanel.jsx
// Renders filtered notifications for currentUser.
// Used inside Notifications (Alerts tab) AND the MobileLayout bell dropdown.
// =============================================================================
import React from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import './NotificationsPanel.css';

export default function NotificationsPanel() {
  const { myNotifs, unreadCount, markOneRead, markAllRead } = useNotifications();

  return (
    <div className="neu-notif-panel">

      <div className="neu-notif-header">
        <div className="neu-notif-title-row">
          
          {unreadCount > 0 && (
            <span className="neu-notif-badge">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="neu-mark-all-btn" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

    

      <div className="neu-notif-list">
        {myNotifs.map((notif) => (
          <NotificationItem
            key={notif.id}
            notif={notif}
            onMarkRead={markOneRead}
          />
        ))}
      </div>

    </div>
  );
}