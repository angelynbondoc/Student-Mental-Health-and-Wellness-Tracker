import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, BookHeart, Sprout, MessageCircle, Plus } from "lucide-react";
import AppContext from "../../AppContext";
import { PostCard } from "../../components/postcard";
import "./HomePage.css";

export default function HomePage() {
  const { posts, communities, searchQuery } = useContext(AppContext);
  const location = useLocation();
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const didScrollRef = useRef(false);

  const matchingCommunityIds = communities
    .filter(c => c?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(c => c.id);

  const GENERAL_ID = 'a1829718-2700-46fe-a10c-4a42f22607b6';
  const joinedIds = new Set(communities.map(c => c.id));

  const filteredPosts = posts
    .filter(post =>
      (post.community_id === GENERAL_ID || joinedIds.has(post.community_id)) &&
      (!selectedCommunityId || post.community_id === selectedCommunityId) &&
      (!searchQuery ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matchingCommunityIds.includes(post.community_id)
      )
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const activeCommunityName = communities.find((c) => c.id === selectedCommunityId)?.name;

  // ── Pre-select community from profile page navigation ──────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const communityId = params.get('community');
    if (communityId) setSelectedCommunityId(communityId);
  }, [location.search]);

  // ── Scroll-to-post from notification click ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('post');
    if (!postId || didScrollRef.current) return;

    const postExists = posts.some(p => p.id === postId);
    if (!postExists) return;

    setHighlightedPostId(postId);
    didScrollRef.current = true;

    setTimeout(() => {
      const el = document.getElementById(`post-${postId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);

    setTimeout(() => setHighlightedPostId(null), 3000);
  }, [location.search, posts]);

  return (
    <div className="page-shell">
      <div className="page-inner">
        <header className="wellness-welcome">
          <div>
            <p className="wellness-eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</p>
            <h1>A little connection goes a long way.</h1>
            <p>Check in with yourself, share what’s on your mind, and grow together.</p>
          </div>
          <span className="wellness-welcome-icon" aria-hidden="true"><Sprout size={48} strokeWidth={1.3} /></span>
        </header>
        <div className="wellness-shortcuts">
          <Link to="/journal" className="wellness-shortcut">
            <BookHeart size={24} strokeWidth={1.6} />
            <span><strong>How are you feeling?</strong><small>Take a moment to reflect</small></span>
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/habits" className="wellness-shortcut">
            <Sprout size={24} strokeWidth={1.6} />
            <span><strong>Small steps, every day</strong><small>Make time for your habits</small></span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="wellness-feed-intro"><div><p className="wellness-eyebrow">BETTER TOGETHER</p><h2>Your community space</h2></div><Link to="/create" className="wellness-post-link"><Plus size={17} /> Share a thought</Link></div>
        <div className="hp-filter">
          <div className="hp-filter-label-row">
            <p className="hp-filter-label">Browse by community:</p>
          </div>
          <div className="hp-chips-row">
            {communities.map((community) => {
              const isActive = selectedCommunityId === community.id;
              return (
                <button
                  key={community.id}
                  aria-pressed={isActive}
                  className={`chip${isActive ? " chip--active" : ""}`}
                  onClick={() => setSelectedCommunityId(isActive ? null : community.id)}
                >
                  {community.name}
                </button>
              );
            })}
            {selectedCommunityId && (
              <button className="chip chip--clear" onClick={() => setSelectedCommunityId(null)}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        <div className="hfeed-header">
          <h2 className="hfeed-title">
            <span>{selectedCommunityId ? `Posts in "${activeCommunityName}"` : "All Posts"}</span>
          </h2>
          <span className="hfeed-count">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="hfeed-empty">
            <span className="wellness-empty-icon"><MessageCircle size={28} strokeWidth={1.5} /></span>
            <p className="hfeed-empty__msg">{searchQuery ? "No matching conversations" : "Every conversation starts with someone"}</p>
            <p className="hfeed-empty__hint">{searchQuery ? "Try a different search or community." : "Share a thought, ask a question, or simply say hello."}</p>
            {!searchQuery && <Link to="/create" className="wellness-empty-link">Start a conversation <ArrowUpRight size={16} /></Link>}
          </div>
        ) : (
          <div className="hfeed-list">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`hfeed-post-wrapper${highlightedPostId === post.id ? ' hfeed-post-wrapper--highlight' : ''}`}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
