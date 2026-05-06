// =============================================================================
// NotificationItem.jsx
// Single notification row — handles its own icon, content, timestamp,
// and mark-as-read button.
// =============================================================================
import React from 'react';
import { MessageSquare, ThumbsUp, Repeat2, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleClick = () => {
    if (notif.type === 'announcement' || notif.type === 'system') return;
    if (notif.post_id) navigate(`/home?post=${notif.post_id}`);
  };

  const isClickable = notif.type !== 'announcement' && notif.type !== 'system' && notif.post_id;

  return (
    <div
      className={`neu-notif-item ${notif.is_read ? 'neu-notif-item--read' : 'neu-notif-item--unread'} ${isClickable ? 'neu-notif-item--clickable' : ''}`}
      onClick={handleClick}
    >
      <NotifIcon type={notif.type} />
      <div className="neu-notif-body">
        {notif.type === 'announcement' ? (
          <div className="neu-notif-announcement">
            <span className="neu-notif-announcement-badge">Admin Announcement</span>
            <p className="neu-notif-text" style={{ fontWeight: 600, margin: '2px 0 0' }}>{notif.title}</p>
            {notif.message && <p className="neu-notif-time" style={{ marginTop: 2 }}>{notif.message}</p>}
          </div>
        ) : (
          <p className="neu-notif-text">{notif.content}</p>
        )}
        <p className="neu-notif-time">
          {new Date(notif.created_at).toLocaleString()}
        </p>
      </div>
      {!notif.is_read && (
        <button
          className="neu-read-btn"
          onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
          aria-label="Mark as read"
        >
          <Check size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}