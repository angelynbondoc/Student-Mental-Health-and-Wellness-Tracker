// =============================================================================
// CreatePage.jsx — Form to create a new post and push it to global state.
// =============================================================================
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../AppContext';
import { generateUUID } from '../mockData';

function CreatePage() {
  const { communities, setPosts, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Controlled inputs — React owns the form values at all times
  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id ?? '');
  const [content,     setContent]     = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Post content cannot be empty.'); return; }
    if (!selectedCommunityId) { setError('Please select a community.'); return; }

    // Build post object matching DB schema exactly
    const newPost = {
      id:           generateUUID(),
      author_id:    currentUser.id,
      community_id: selectedCommunityId,
      content:      content.trim(),
      is_anonymous: isAnonymous,
      is_flagged:   false,
      created_at:   new Date().toISOString(),
    };

    // Prepend to posts array (newest first).
    // NEVER mutate state directly — always return a new array.
    setPosts((prev) => [newPost, ...prev]);
    navigate('/'); // Redirect to feed to see the new post
  };

  return (
    <div style={{ padding: '8px 4px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c7a4b', marginBottom: '4px' }}>
        Share Something
      </h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>What's on your mind today?</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={lbl}>Post to Community</label>
        <select value={selectedCommunityId} onChange={(e) => setSelectedCommunityId(e.target.value)} style={sel}>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label style={lbl}>Your Post</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, ask a question, or offer support..."
          rows={5}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', fontFamily: 'sans-serif', outline: 'none' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#444', cursor: 'pointer' }}>
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Post anonymously
        </label>

        {isAnonymous && (
          <p style={{ fontSize: '12px', color: '#7c3aed', backgroundColor: '#f5f0ff', padding: '8px', borderRadius: '6px', margin: 0 }}>
            🔒 Your name will be hidden. Only "Anonymous Student" will be shown.
          </p>
        )}

        {error && (
          <p style={{ color: '#c0392b', fontSize: '13px', backgroundColor: '#fdf0ee', padding: '8px', borderRadius: '6px' }}>
            {error}
          </p>
        )}

        <button type="submit" style={{ padding: '12px', backgroundColor: '#2c7a4b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
          Post to Community
        </button>
      </form>
    </div>
  );
}

const lbl = { fontSize: '13px', fontWeight: 'bold', color: '#444' };
const sel = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#fff' };

export default CreatePage;