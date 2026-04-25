// =============================================================================
// useNotifications.js
// Custom hook — encapsulates all notification filtering and mutation logic.
// Consumed by NotificationsPanel (and any future notification-aware component).
// =============================================================================
import { useContext } from 'react';
import AppContext from '../AppContext'; //adjust the path to match wherever your AooContext lives

export default function useNotifications() {
  const { currentUser, notifications, setNotifications } = useContext(AppContext);

  // Filter to this user's notifications, sorted newest-first
  const myNotifs = notifications
    .filter((n) => n.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = myNotifs.filter((n) => !n.is_read).length;

  // Mark a single notification as read
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

  return { myNotifs, unreadCount, markOneRead, markAllRead };
}