// =============================================================================
// TopBar.jsx
// Sticky top navigation bar — app name, user chip, notifications bell.
// =============================================================================
import React from 'react';
import {Bell} from 'lucide-react'
export default function TopBar({ displayName, isAdmin, unreadCount, onBellClick }) {
  return (
    <header className="neu-topbar">
      <div className="neu-topbar-left">
        <span className="neu-topbar-gold-bar" />
        <span className="neu-topbar-appname">MindSpace</span>
      </div>

      <div className="neu-topbar-right">
        <span className="neu-user-chip">
          {displayName}
          {isAdmin && <span className="neu-admin-badge">Admin</span>}
        </span>

        <button
          className="neu-bell-btn"
          onClick={onBellClick}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="neu-bell-badge">{unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}