// =============================================================================
// NotificationItem.jsx
// Single notification row — handles its own icon, content, timestamp,
// and mark-as-read button.
// =============================================================================
import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // ← Import this
import { MessageSquare, ThumbsUp, Repeat2, Bell, Check, X, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_ICON = {
  comment:  MessageSquare,
  reaction: ThumbsUp,
  share:    Repeat2,
  system:   Bell,
  announcement: Megaphone // ← Added a specific icon for announcements
};

function NotifIcon({ type }) {
  const Icon = TYPE_ICON[type] ?? Bell;
  return <Icon size={18} className="neu-notif-icon" />;
}

export default function NotificationItem({ notif, onMarkRead }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // ← Modal state

  const handleClick = () => {
    // 1. If it's an announcement, open the modal
    if (notif.type === 'announcement') {
      setShowModal(true);
      // Optional: automatically mark it as read when they open the modal
      if (!notif.is_read) onMarkRead(notif.id);
      return;
    }
    
    // 2. Ignore system notifs
    if (notif.type === 'system') return;
    
    // 3. Navigate to posts
    if (notif.post_id) navigate(`/home?post=${notif.post_id}`);
  };

  // Make announcements clickable so they get the hover effects
  const isClickable = notif.type === 'announcement' || (notif.type !== 'system' && notif.post_id);

  return (
    <>
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
              {/* Truncate the message in the list view so it doesn't take up too much space */}
              {notif.message && (
                <p className="neu-notif-time" style={{ marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {notif.message}
                </p>
              )}
            </div>
          ) : (
            <p className="neu-notif-text">{notif.content}</p>
          )}
          <p className="neu-notif-time">
            {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
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

      {/* ── Announcement Modal (Rendered via Portal) ── */}
      {showModal && createPortal(
        <div className="announcement-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="announcement-modal-header">
              <div className="announcement-modal-icon-wrap">
                <Megaphone size={20} strokeWidth={2.5} />
              </div>
              <button className="announcement-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <span className="announcement-modal-badge">Admin Announcement</span>
            <h3 className="announcement-modal-title">{notif.title}</h3>
            
            <p className="announcement-modal-date">
              Posted on {new Date(notif.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="announcement-modal-body">
              {notif.message}
            </div>

            <button className="announcement-modal-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}