// =============================================================================
// MobileLayout.jsx
// FIX: Restored the /create nav link in the bottom tab bar.
// =============================================================================
import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import AppContext from '../AppContext';
import NotificationsPanel from './NotificationsPanel';

export default function MobileLayout() {
  const { currentUser, notifications } = useContext(AppContext);
  const navigate = useNavigate();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read
  ).length;

  // ── Bottom nav links — /create RESTORED alongside /inbox ─────────────────
  const NAV_LINKS = [
    { to: '/',          label: 'Home',      icon: '🏠' },
    { to: '/journal',   label: 'Journal',   icon: '📓' },
    { to: '/create',    label: 'Create',    icon: '✏️' },  // ← RESTORED
    { to: '/habits',    label: 'Habits',    icon: '✅' },
    { to: '/resources', label: 'Resources', icon: '💡' },
    { to: '/inbox',     label: 'Inbox',     icon: '✉️' },
  ];

  return (
    <div style={styles.shell}>
      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <header style={styles.topBar}>
        <span style={styles.appName}>🧠 MindSpace</span>
        <div style={styles.topRight}>
          <span style={styles.userChip}>
            {currentUser.display_name}
            {currentUser.role === 'admin' && (
              <span style={styles.adminChip}>Admin</span>
            )}
          </span>
          <button
            style={styles.bellBtn}
            onClick={() => setShowNotifPanel((v) => !v)}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.bellBadge}>{unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── NOTIFICATIONS DROPDOWN ───────────────────────────────────────── */}
      {showNotifPanel && (
        <div style={styles.notifDropdown}>
          <NotificationsPanel />
          <button
            style={styles.viewAllBtn}
            onClick={() => {
              setShowNotifPanel(false);
              navigate('/inbox');
            }}
          >
            View all in Inbox →
          </button>
        </div>
      )}

      {/* ── PAGE CONTENT ─────────────────────────────────────────────────── */}
      <main style={styles.main}>
        <Outlet />
      </main>

      {/* ── BOTTOM TAB BAR ───────────────────────────────────────────────── */}
      <nav style={styles.bottomNav}>
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icon}</span>
            <span style={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', background: '#f3f4f6', position: 'relative',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
  },
  appName:  { fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  userChip: {
    fontSize: 12, background: 'rgba(255,255,255,0.2)',
    padding: '4px 10px', borderRadius: 20,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  adminChip: {
    background: '#fbbf24', color: '#78350f',
    fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px',
  },
  bellBtn: {
    position: 'relative', background: 'rgba(255,255,255,0.2)',
    border: 'none', borderRadius: '50%', width: 36, height: 36,
    fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: -4, right: -4,
    background: '#ef4444', color: '#fff', fontSize: 9,
    fontWeight: 700, borderRadius: 20, padding: '1px 5px',
    border: '1.5px solid #fff',
  },
  notifDropdown: {
    position: 'absolute', top: 60, right: 12, left: 12,
    background: '#fff', borderRadius: 16, zIndex: 200,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '16px',
    maxHeight: '60vh', overflowY: 'auto',
  },
  viewAllBtn: {
    width: '100%', padding: '10px', marginTop: 8,
    background: '#f3f4f6', border: 'none', borderRadius: 10,
    color: '#6366f1', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  main: { flex: 1, overflowY: 'auto', paddingBottom: 70 },
  bottomNav: {
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#fff', borderTop: '1px solid #e5e7eb',
    padding: '8px 0 12px', zIndex: 100,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
  },
  navItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 2, textDecoration: 'none', color: '#9ca3af',
    padding: '4px 6px', borderRadius: 10,
  },
  navItemActive: { color: '#6366f1' },
  navIcon:  { fontSize: 18 },
  // Slightly smaller label to fit 6 items comfortably
  navLabel: { fontSize: 9, fontWeight: 600 },
};