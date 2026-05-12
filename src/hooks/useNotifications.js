import { useContext } from 'react';
import AppContext from '../AppContext';
import { supabase } from '../supabase';

/**
 * Custom hook for managing the current user's notification feed.
 * Filters global notifications for the logged-in user, calculates the unread badge count,
 * and provides methods to mark individual or all notifications as read.
 *
 * @returns {Object} { myNotifs, unreadCount, markOneRead, markAllRead }
 */

export default function useNotifications() {
  const { currentUser, notifications, setNotifications } = useContext(AppContext);

  const myNotifs = notifications
    .filter(n => n.user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = myNotifs.filter(n => !n.is_read).length;

  const markOneRead = async (notifId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id);
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, is_read: true } : n));
  };

  return { myNotifs, unreadCount, markOneRead, markAllRead };
}