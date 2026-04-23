// =============================================================================
// CreatePage.jsx — Form to create a new post and push it to global state.
// =============================================================================
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../AppContext';
import { generateUUID } from '../mockData';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-create {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
     display: flex;              /* ← add these 3 lines */
  flex-direction: column;
  align-items: center;
  }
  .neu-create-inner {
    max-width: 680px;
     width: 100%;/* constrain form width for readability — not the whole page */
  }
  .neu-create-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #2E7D32;
    margin: 0 0 4px;
  }
  .neu-create-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #9E9E9E;
    margin: 0 0 24px;
  }
  .neu-create-form {
    background: #FFFFFF;
    border-radius: 14px;
    padding: 28px;
    border: 1px solid #E8E8E8;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .neu-flabel {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #9E9E9E;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: block;
    margin: 18px 0 7px;
  }
  .neu-flabel:first-of-type { margin-top: 0; }
  .neu-flabel .req { color: #C62828; }
  .neu-fselect, .neu-ftextarea {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1px solid #E8E8E8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
    background: #F2F2F2;
    outline: none;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .neu-fselect:focus, .neu-ftextarea:focus {
    border-color: #2E7D32;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(46,125,50,0.10);
  }
  .neu-ftextarea { resize: vertical; min-height: 130px; line-height: 1.6; }
  .neu-anon-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 0 4px;
    cursor: pointer;
  }
  .neu-anon-row input[type="checkbox"] {
    width: 16px; height: 16px; accent-color: #2E7D32; cursor: pointer;
  }
  .neu-anon-row-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
  }
  /* Gold tint — warm, positive tone for anonymous notice */
  .neu-anon-notice {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #7C5800;
    background: #FFFDE7;
    border-left: 3px solid #F5C400;
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 4px;
  }
  /* Muted Red — validation error only */
  .neu-create-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #C62828;
    background: #FFEBEE;
    border-left: 3px solid #C62828;
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 4px;
  }
  .neu-create-submit {
    width: 100%;
    padding: 13px;
    background: #2E7D32;
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 20px;
    transition: background 0.15s ease, transform 0.12s ease;
  }
  .neu-create-submit:hover { background: #1B5E20; transform: translateY(-1px); }
  .neu-create-submit:active { transform: translateY(0); }

  @media (max-width: 768px) { .neu-create { padding: 24px 20px; } }
  @media (max-width: 480px) { .neu-create { padding: 18px 16px; } .neu-create-form { padding: 20px 16px; } }
`;

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
    <>
      <style>{STYLES}</style>
      <div className="neu-create">
        <div className="neu-create-inner">
          <h2 className="neu-create-heading">Share Something</h2>
          <p className="neu-create-sub">What's on your mind today?</p>

          <form className="neu-create-form" onSubmit={handleSubmit}>
            <label className="neu-flabel" htmlFor="community-select">Post to Community</label>
            <select
              id="community-select"
              className="neu-fselect"
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="neu-flabel" htmlFor="post-content">
              Your Post <span className="req">*</span>
            </label>
            <textarea
              id="post-content"
              className="neu-ftextarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or offer support..."
              rows={5}
            />

            <label className="neu-anon-row">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span className="neu-anon-row-label">Post anonymously</span>
            </label>

            {isAnonymous && (
              <p className="neu-anon-notice">
                🔒 Your name will be hidden. Only "Anonymous" will be shown.
              </p>
            )}

            {error && <p className="neu-create-error">{error}</p>}

            <button type="submit" className="neu-create-submit">
              Post to Community
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePage;