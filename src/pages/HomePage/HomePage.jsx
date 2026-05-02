// =============================================================================
// HomePage.jsx — refactored
// Shared: PageShell, shared.css (page-shell, chip classes)
// Own:    HomePage.css (filter bar, feed header, chips)
//
// KEY LOGIC: selectedCommunity is LOCAL state — UI preference only, not DB data.
// filteredPosts is derived (not stored) — equivalent to SELECT ... WHERE community_id=?
// =============================================================================
import React, { useState, useContext } from "react";
import AppContext from "../../AppContext";
import { PostCard } from "../../components/postcard";
import "./HomePage.css";

export default function HomePage() {
  const { posts, communities, searchQuery } = useContext(AppContext);

  // Local UI state — other pages don't need this, so it stays local
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  // Derived: SELECT * FROM posts WHERE community_id=? ORDER BY created_at DESC
  const matchingCommunityIds = communities
    .filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(c => c.id);

  const filteredPosts = posts
    .filter(post =>
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
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
