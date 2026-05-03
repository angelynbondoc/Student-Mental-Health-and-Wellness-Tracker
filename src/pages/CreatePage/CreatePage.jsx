import React, { useState, useContext, useRef, useEffect } from 'react';
import { useCreatePost } from '../../components/createpage';
import AppContext from '../../AppContext';
import { supabase } from '../../supabase';
import './CreatePage.css';

/* ── Custom dropdown — replaces the broken native CommunitySelect ── */
function CommunityDropdown({ communities, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = communities.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="comm-dropdown" ref={ref}>
      <button
        type="button"
        className={`comm-dropdown__trigger ${open ? 'comm-dropdown__trigger--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="comm-dropdown__value">
          {selected ? (
            <>
              <span className="comm-dropdown__emoji">{selected.emoji || '🌐'}</span>
              <span>{selected.name}</span>
            </>
          ) : (
            <span className="comm-dropdown__placeholder">Select a community</span>
          )}
        </span>
        <span className={`comm-dropdown__chevron ${open ? 'comm-dropdown__chevron--up' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <ul className="comm-dropdown__list" role="listbox">
          {communities.length === 0 && (
            <li className="comm-dropdown__empty">No communities yet</li>
          )}
          {communities.map((c) => (
            <li
              key={c.id}
              role="option"
              aria-selected={c.id === value}
              className={`comm-dropdown__item ${c.id === value ? 'comm-dropdown__item--active' : ''}`}
              onClick={() => { onChange(c.id); setOpen(false); }}
            >
              <span className="comm-dropdown__emoji">{c.emoji || '🌐'}</span>
              <span>{c.name}</span>
              {c.id === value && <span className="comm-dropdown__check">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMOJI_OPTIONS = [
  '🌐','💬','📚','🎯','🎮','🏃','🎵','🍳',
  '💡','🔬','✈️','💻','🎨','📰','⚙️',
];

const CATEGORY_OPTIONS = [
  { value: 'shared_interest', label: 'Shared Interest',  desc: 'Connect around hobbies and topics' },
  { value: 'program_discussion', label: 'Program Discussion', desc: 'Course and department conversations' },
];

const CHAR_LIMIT = 500;

function CharCounter({ current, limit }) {
  const remaining = limit - current;
  const isNear = remaining <= 80;
  const isOver = remaining < 0;
  return (
    <span
      className="char-counter"
      style={{
        color: isOver
          ? 'var(--color-danger)'
          : isNear
          ? 'var(--color-warning, #B45309)'
          : 'var(--color-text-secondary)',
      }}
    >
      {remaining < 0 ? `−${Math.abs(remaining)}` : remaining}
    </span>
  );
}

export default function CreatePage() {
  const { currentUser } = useContext(AppContext);

  /* Tab state */
  const [activeTab, setActiveTab] = useState('post');

  /* Community creation state */
  const [communityEmoji, setCommunityEmoji] = useState('🌐');
  const [communityName, setCommunityName] = useState('');
  const [communityCategory, setCommunityCategory] = useState('shared_interest');
  const [communityError, setCommunityError] = useState('');
  const [communitySuccess, setCommunitySuccess] = useState('');
  const [communityLoading, setCommunityLoading] = useState(false);

  /* Post creation hook */
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

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCommunityError('');
    setCommunitySuccess('');
    if (!communityName.trim()) {
      setCommunityError('Please enter a community name.');
      return;
    }
    setCommunityLoading(true);
    const { data: newCommunity, error: insertError } = await supabase
      .from('communities')
      .insert({
        name: communityName.trim(),
        category: communityCategory,
        emoji: communityEmoji,
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (insertError) {
      setCommunityError(insertError.message);
      setCommunityLoading(false);
      return;
    }

    await supabase
      .from('community_members')
      .insert({ community_id: newCommunity.id, user_id: currentUser.id });

    setCommunityName('');
    setCommunityCategory('shared_interest');
    setCommunitySuccess(`"${newCommunity.name}" submitted for review! A moderator will approve it shortly.`);
    setCommunityLoading(false);
  };

  return (
    <div className="create-page">
      {/* Page Header */}
      <div className="create-page__header">
        <h1 className="create-page__title">Create</h1>
        <p className="create-page__subtitle">Share with your NEU community</p>
      </div>

      {/* Tab Switcher */}
      <div className="create-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'post'}
          className={`create-tab ${activeTab === 'post' ? 'create-tab--active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <span>New Post</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'community'}
          className={`create-tab ${activeTab === 'community' ? 'create-tab--active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span>New Community</span>
        </button>
      </div>

      {/* ── POST TAB ── */}
      {activeTab === 'post' && (
        <div className="create-panel" role="tabpanel">
          <form className="create-form" onSubmit={handleSubmit}>

            {/* Community selector */}
            <div className="create-form__field">
              <label className="create-form__label">
                Posting to
                <span className="required-star">*</span>
              </label>
              <CommunityDropdown
                communities={communities}
                value={selectedCommunityId}
                onChange={setSelectedCommunityId}
              />
            </div>

            {/* Content textarea */}
            <div className="create-form__field">
              <div className="create-form__label-row">
                <label className="create-form__label">
                  Your post
                  <span className="required-star">*</span>
                </label>
                <CharCounter current={content.length} limit={CHAR_LIMIT} />
              </div>
              <textarea
                className="create-form__textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask a question, or offer support to your fellow students…"
                rows={6}
                maxLength={CHAR_LIMIT + 50}
                aria-label="Post content"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="create-form__field">
              <div className="anon-toggle">
                <div className="anon-toggle__info">
                  <span className="anon-toggle__title">Post anonymously</span>
                  <span className="anon-toggle__desc">Your name will be hidden from other students</span>
                </div>
                <label className="toggle-switch" aria-label="Toggle anonymous posting">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span className="toggle-switch__track" />
                </label>
              </div>
            </div>

            {error && (
              <div className="create-notice create-notice--error" role="alert">
                <span className="create-notice__icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="create-btn create-btn--primary"
              disabled={!content.trim() || !selectedCommunityId}
            >
              Post to Community
            </button>
          </form>
        </div>
      )}

      {/* ── COMMUNITY TAB ── */}
      {activeTab === 'community' && (
        <div className="create-panel" role="tabpanel">
          <div className="create-info-banner">
            <span>New communities go through a brief review before they appear publicly.</span>
          </div>

          <form className="create-form" onSubmit={handleCreateCommunity}>

            {/* Emoji picker */}
            <div className="create-form__field">
              <label className="create-form__label">Community icon</label>
              <div className="emoji-preview">
                <span className="emoji-preview__selected">{communityEmoji}</span>
                <span className="emoji-preview__label">Selected icon</span>
              </div>
              <div className="emoji-grid" role="group" aria-label="Choose an emoji icon">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    aria-label={`Select ${em}`}
                    aria-pressed={communityEmoji === em}
                    className={`emoji-btn ${communityEmoji === em ? 'emoji-btn--active' : ''}`}
                    onClick={() => setCommunityEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Community name */}
            <div className="create-form__field">
              <label className="create-form__label" htmlFor="community-name">
                Community name
                <span className="required-star">*</span>
              </label>
              <input
                id="community-name"
                className="create-form__input"
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="e.g. BSCS Study Group, Thesis Support, Campus Life…"
                maxLength={60}
              />
            </div>

            {/* Category selector - card style */}
            <div className="create-form__field">
              <label className="create-form__label">Category</label>
              <div className="category-cards">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={communityCategory === opt.value}
                    className={`category-card ${communityCategory === opt.value ? 'category-card--active' : ''}`}
                    onClick={() => setCommunityCategory(opt.value)}
                  >
                    <span className="category-card__label">{opt.label}</span>
                    <span className="category-card__desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {communityError && (
              <div className="create-notice create-notice--error" role="alert">
                {communityError}
              </div>
            )}
            {communitySuccess && (
              <div className="create-notice create-notice--success" role="status">
                {communitySuccess}
              </div>
            )}

            <button
              type="submit"
              className="create-btn create-btn--primary"
              disabled={communityLoading || !communityName.trim()}
            >
              {communityLoading ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}