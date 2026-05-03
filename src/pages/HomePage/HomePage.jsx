import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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

  const activeCommunityName = communities.find(
    (c) => c.id === selectedCommunityId,
  )?.name;

  // ── Scroll-to-post from notification click ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('post');
    if (!postId || didScrollRef.current) return;

    // Wait for posts to be in the list
    const postExists = posts.some(p => p.id === postId);
    if (!postExists) return;

    setHighlightedPostId(postId);
    didScrollRef.current = true;

    // Small delay to let the DOM render
    setTimeout(() => {
      const el = document.getElementById(`post-${postId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // Remove highlight after 3 seconds
    setTimeout(() => setHighlightedPostId(null), 3000);
  }, [location.search, posts]);

  return (
    <div className="page-shell">
      <div className="page-inner">
        {/* ── Community filter bar ─────────────────────────────────────────── */}
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
                  className={`chip${isActive ? " chip--active" : ""}`}
                  onClick={() =>
                    setSelectedCommunityId(isActive ? null : community.id)
                  }
                >
                  {community.name}
                </button>
              );
            })}
            {selectedCommunityId && (
              <button
                className="chip chip--clear"
                onClick={() => setSelectedCommunityId(null)}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Feed header ──────────────────────────────────────────────────── */}
        <div className="hfeed-header">
          <h2 className="hfeed-title">
            <span>
              {selectedCommunityId
                ? `Posts in "${activeCommunityName}"`
                : "All Posts"}
            </span>
          </h2>
          <span className="hfeed-count">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Post list ────────────────────────────────────────────────────── */}
        {filteredPosts.length === 0 ? (
          <div className="hfeed-empty">
            <div className="hfeed-empty__icon">🌱</div>
            <p className="hfeed-empty__msg">No posts in this community yet.</p>
            <p className="hfeed-empty__hint">Be the first to post here!</p>
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