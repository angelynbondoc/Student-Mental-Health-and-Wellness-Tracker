// =============================================================================
// NotificationItem.jsx
// Single notification row — handles its own icon, content, timestamp,
// and mark-as-read button.
// =============================================================================
import React from 'react';
import { MessageSquare, ThumbsUp, Repeat2, Bell, Check } from 'lucide-react';

const TYPE_ICON = {
  comment:  MessageSquare,
  reaction: ThumbsUp,
  share:    Repeat2,
  system:   Bell,
};

function NotifIcon({ type }) {
  const Icon = TYPE_ICON[type] ?? Bell;
  return <Icon size={18} className="neu-notif-icon" />;
}

export default function NotificationItem({ notif, onMarkRead }) {
  return (
    <div className={`neu-notif-item ${notif.is_read ? 'neu-notif-item--read' : 'neu-notif-item--unread'}`}>
      <NotifIcon type={notif.type} />
      <div className="neu-notif-body">
        <p className="neu-notif-text">{notif.content}</p>
        <p className="neu-notif-time">
          {new Date(notif.created_at).toLocaleString()}
        </p>
      </div>
      {!notif.is_read && (
        <button
          className="neu-read-btn"
          onClick={() => onMarkRead(notif.id)}
          aria-label="Mark as read"
        >
          <Check size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}