import React, { useState, useContext } from 'react';
import { PageShell, FormField } from '../components/ui';
import { useCreatePost, CommunitySelect, AnonToggle } from '../components/createpage';
import AppContext from '../AppContext';
import { supabase } from '../supabase';
import '../components/createpage/CreatePage.css';

export default function CreatePage() {
  const { currentUser, setCommunities } = useContext(AppContext);

  const [communityName, setCommunityName] = useState('');
  const [communityCategory, setCommunityCategory] = useState('shared_interest');
  const [communityError, setCommunityError] = useState('');
  const [communitySuccess, setCommunitySuccess] = useState('');

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCommunityError('');
    setCommunitySuccess('');

    if (!communityName.trim()) { setCommunityError('Community name is required.'); return; }

    const { data: newCommunity, error: insertError } = await supabase
      .from('communities')
      .insert({
        name: communityName.trim(),
        category: communityCategory,
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (insertError) { setCommunityError(insertError.message); return; }

    await supabase
      .from('community_members')
      .insert({ community_id: newCommunity.id, user_id: currentUser.id });

    setCommunities(prev => [...prev, newCommunity]);
    setCommunityName('');
    setCommunityCategory('shared_interest');
    setCommunitySuccess(`Community "${newCommunity.name}" created!`);
  };

  const {
    communities,
    selectedCommunityId,
    content,
    isAnonymous,
    error,
    setSelectedCommunityId,
    setContent,
    setIsAnonymous,
    handleSubmit,
  } = useCreatePost();

  return (
    <PageShell heading="Share Something" sub="What's on your mind today?" narrow>

      <form className="form-card" onSubmit={handleSubmit}>
        <CommunitySelect
          communities={communities}
          value={selectedCommunityId}
          onChange={setSelectedCommunityId}
        />
        <FormField
          label="Your Post"
          as="textarea"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, ask a question, or offer support..."
          rows={5}
        />
        <AnonToggle checked={isAnonymous} onChange={setIsAnonymous} />
        {error && <p className="notice--red">{error}</p>}
        <button type="submit" className="btn-submit">Post to Community</button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <PageShell heading="Create a Community" sub="Visible to all users after creation." narrow>
          <form className="form-card" onSubmit={handleCreateCommunity}>
            <FormField
              label="Community Name"
              required
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="e.g., BSCS, Mental Health, Study Group..."
            />
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                value={communityCategory}
                onChange={(e) => setCommunityCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="shared_interest">Shared Interest</option>
                <option value="program_discussion">Program Discussion</option>
              </select>
            </div>
            {communityError   && <p className="notice--red">{communityError}</p>}
            {communitySuccess && <p className="notice--green">{communitySuccess}</p>}
            <button type="submit" className="btn-submit">Create Community</button>
          </form>
        </PageShell>
      </div>

    </PageShell>
  );
}