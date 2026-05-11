import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../AppContext';
import { supabase } from '../../supabase';

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

    const { data, error: dbError } = await supabase
      .from('posts')
      .insert({
        author_id:    currentUser.id,
        community_id: selectedCommunityId,
        content:      content.trim(),
        is_anonymous: isAnonymous,
        is_flagged:   false,
      })
      .select()
      .single();

    if (dbError) { setError(dbError.message); return; }

    setPosts((prev) => [data, ...prev]);
    navigate('/home'); // ← was '/' which triggers redirect to /login
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