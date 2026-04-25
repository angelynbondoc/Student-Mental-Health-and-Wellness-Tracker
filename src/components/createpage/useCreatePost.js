// =============================================================================
// useCreatePost.js
// Custom hook — encapsulates all form state and post submission logic.
// Keeps CreatePage.jsx a pure orchestrator with zero business logic.
// =============================================================================
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../AppContext';
import { generateUUID } from '../../mockData';

export default function useCreatePost() {
  const { communities, setPosts, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id ?? '');
  const [content,             setContent]             = useState('');
  const [isAnonymous,         setIsAnonymous]         = useState(false);
  const [error,               setError]               = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!content.trim())        { setError('Post content cannot be empty.'); return; }
    if (!selectedCommunityId)   { setError('Please select a community.');    return; }

    // Build post object matching DB schema exactly
    // SQL: INSERT INTO posts (id, author_id, community_id, content, is_anonymous, is_flagged, created_at)
    const newPost = {
      id:           generateUUID(),
      author_id:    currentUser.id,
      community_id: selectedCommunityId,
      content:      content.trim(),
      is_anonymous: isAnonymous,
      is_flagged:   false,
      created_at:   new Date().toISOString(),
    };

    // Prepend to posts array (newest first) — never mutate state directly
    setPosts((prev) => [newPost, ...prev]);
    navigate('/');
  };

  return {
    // State
    communities,
    selectedCommunityId,
    content,
    isAnonymous,
    error,
    // Setters
    setSelectedCommunityId,
    setContent,
    setIsAnonymous,
    // Handler
    handleSubmit,
  };
}