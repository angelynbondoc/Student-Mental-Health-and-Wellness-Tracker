// =============================================================================
// useNotifications.js
// Custom hook — encapsulates all notification filtering and mutation logic.
// Consumed by NotificationsPanel (and any future notification-aware component).
// =============================================================================
import { useState, useEffect, useContext } from 'react';
import AppContext from '../AppContext';
import { supabase } from '../supabase';

export default function useNotifications() {
  const { currentUser } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('notifications fetch error:', error)
        return
      }
      if (data) setNotifications(data)
    }

    fetchNotifications()
  }, [currentUser?.id])

  const myNotifs = notifications
    .filter(n => n.user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const unreadCount = myNotifs.filter(n => !n.is_read).length

  const markOneRead = async (notifId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId)

    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
    )
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)

    setNotifications(prev =>
      prev.map(n => n.user_id === currentUser.id ? { ...n, is_read: true } : n)
    )
  }

  return { myNotifs, unreadCount, markOneRead, markAllRead }
}