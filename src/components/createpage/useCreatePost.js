// src/components/createpage/useCreatePost.js
// Added: crisis keyword detection on post submit.
// If triggered → flag post, insert report, notify all admins immediately.

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../AppContext';
import { supabase } from '../../supabase';
import { containsCrisisKeywords } from '../../utils/crisisKeywords';

/**
 * Custom hook managing the state and submission logic for creating a new community post.
 * Validates inputs, handles database insertion, and automatically scans the content 
 * for crisis keywords. If crisis content is detected, it silently flags the post, 
 * generates a system report, and alerts all administrators.
 *
 * @returns {Object} State variables and the handleSubmit function for the post creation form.
 */

export default function useCreatePost() {
  const { communities, setPosts, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [content,             setContent]             = useState('');
  const [isAnonymous,         setIsAnonymous]         = useState(false);
  const [error,               setError]               = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim())      { setError('Post content cannot be empty.'); return; }
    if (!selectedCommunityId) { setError('Please select a community.');    return; }
    if (!currentUser)         { setError('Not logged in.');                return; }

    const isCrisis = containsCrisisKeywords(content.trim());

    // Insert the post
    const { data, error: dbError } = await supabase
      .from('posts')
      .insert({
        author_id:    currentUser.id,
        community_id: selectedCommunityId,
        content:      content.trim(),
        is_anonymous: isAnonymous,
        is_flagged:   isCrisis, // immediately flag if crisis keywords found
      })
      .select()
      .single();

    if (dbError) { setError(dbError.message); return; }

    // --- Crisis auto-flag flow ---
    if (isCrisis) {
      try {
        // 1. Insert a report so it shows up in admin Reported Posts tab
        await supabase.from('reports').insert({
          type:        'post',
          post_id:     data.id,
          reporter_id: currentUser.id, // self-reported by system
          reason:      'crisis_auto_flagged',
          details:     'Auto-flagged by crisis keyword detection. Immediate review recommended.',
          status:      'pending',
        });

        // 2. Fetch all admins to notify
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['admin', 'superadmin']);

        // 3. Send a notification to each admin
        if (admins && admins.length > 0) {
          const notifRows = admins.map(a => ({
            user_id:  a.id,
            type:     'system',
            title:    '🚨 Crisis Content Detected',
            message:  `A post was auto-flagged for potential crisis content. The user may need immediate support. Review it now in Reported Posts.`,
            is_read:  false,
          }));
          await supabase.from('notifications').insert(notifRows);
        }
      } catch (flagErr) {
        // Non-blocking — post is already submitted
        console.error('Crisis flag error:', flagErr);
      }
    }
    // --- End crisis flow ---

    setPosts((prev) => [data, ...prev]);
    navigate('/home');
  };

  return {
    communities,
    selectedCommunityId,
    content,
    isAnonymous,
    error,
    setSelectedCommunityId,
    setContent,
    setIsAnonymous,
    handleSubmit,
  };
}