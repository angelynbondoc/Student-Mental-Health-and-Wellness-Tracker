// =============================================================================
// MobileLayout.jsx
// Shell layout — composes TopBar, Sidebar, BottomNav, and page Outlet.
//
// Layout strategy:
//   Desktop (≥1024px): top bar + left sidebar + full-width main
//   Mobile  (<1024px):  top bar + full-width main + fixed bottom tab bar
// =============================================================================
import React, { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppContext from '../../AppContext';
import { NotificationsPanel } from '../notifications';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './MobileLayout.css';

export default function MobileLayout() {
  const { currentUser, notifications, setSearchQuery } = useContext(AppContext);
  const navigate = useNavigate();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadCount = notifications.filter(
    (n) => currentUser && n.user_id === currentUser.id && !n.is_read
  ).length;

const [searchQuery] = useState('');

const handleSearch = (query) => {
  setSearchQuery(query);
  if (query) navigate('/home');
};

  return (
    <div className="neu-shell">

      <TopBar
        displayName={currentUser.display_name}
        isAdmin={currentUser.role === 'admin'}
        unreadCount={unreadCount}
        onBellClick={() => setShowNotifPanel((v) => !v)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />


      <div className="neu-body">
        <Sidebar />
        <main className="neu-main">
          <Outlet />
        </main>
      </div>

      <BottomNav />

    </div>
  );
}