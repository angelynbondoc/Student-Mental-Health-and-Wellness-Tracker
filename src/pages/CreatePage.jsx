// =============================================================================
// CreatePage.jsx — refactored
// Shared: PageShell, FormField, EmptyState, shared.css classes
// Own:    AnonToggle, useCreatePost (in components/createpage/)
// =============================================================================
import React from 'react';
import { PageShell, FormField } from '../components/ui';
import { useCreatePost, CommunitySelect, AnonToggle } from '../components/createpage';
import '../components/createpage/CreatePage.css';

export default function CreatePage() {
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
    <PageShell
      heading="Share Something"
      sub="What's on your mind today?"
      narrow
    >
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

        <button type="submit" className="btn-submit">
          Post to Community
        </button>

      </form>
    </PageShell>
  );
}