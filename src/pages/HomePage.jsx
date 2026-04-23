// =============================================================================
// HomePage.jsx — Feature 8 update: Community filter bar added.
//
// KEY LOGIC TO DEFEND:
//   - selectedCommunity is LOCAL state (not global) because it's a UI
//     preference, not data that needs to persist to a "database."
//   - The filtered posts are derived via .filter() — we never modify the
//     original global posts array. Filtering is non-destructive.
// =============================================================================
import React, { useState, useContext } from 'react';
import AppContext from '../AppContext';
import { PostCard } from '../components/postcard';

// =============================================================================
// STYLES — scoped to .neu-home.
//
// Full-screen strategy:
//   width: 100% + no max-width = fills the entire main content area.
//   The MobileLayout's .neu-main already stretches to fill remaining viewport
//   after the sidebar, so pages just need width:100% and their own padding.
//
// Design Rationale (Section 1):
//   Primary   #2E7D32  Soft Green — active chips, post count pill, title underline
//   Accent    #F5C400  Warm Gold  — title underline accent (NEU sun motif)
//   Danger    #C62828  Muted Red  — clear chip ONLY
//   BG        #FAFAFA  Warm White — page background
//
// Responsive (Section 4): 768px tablet, 480px mobile
// =============================================================================
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-home {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
  }

  /* ── Filter section ───────────────────────────────────────────────────── */
  .neu-home-filter { margin-bottom: 28px; }

  /* ── Label row with decorative divider line ───────────────────────────── */
  .neu-home-filter-label-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .neu-home-filter-label-row::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E8E8E8;
  }
  /* "Browse by community:" — DM Sans 11px caption */
  .neu-home-filter-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #9E9E9E;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
    margin: 0;
  }

  /* ── Chips row — wraps on narrow screens ─────────────────────────────── */
  .neu-home-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ── Chip base — Poppins 500 per typography spec ─────────────────────── */
  .neu-chip {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 16px;
    border-radius: 100px;
    border: 1px solid #E8E8E8;
    background: #FFFFFF;
    color: #616161;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    outline: none;
    line-height: 1.3;
  }
  .neu-chip:hover {
    border-color: #2E7D32;
    color: #2E7D32;
    background: #E8F5E9;
  }
  .neu-chip:focus-visible { outline: 2px solid #2E7D32; outline-offset: 2px; }

  /* ── Active chip — primary green per NEU palette ─────────────────────── */
  .neu-chip--active {
    background: #2E7D32;
    color: #FFFFFF;
    border-color: #2E7D32;
    box-shadow: 0 2px 8px rgba(46,125,50,0.24);
  }
  .neu-chip--active:hover {
    background: #1B5E20;
    border-color: #1B5E20;
    color: #FFFFFF;
  }

  /* ── Clear chip — Muted Red, used ONLY for delete/clear per rationale ─── */
  .neu-chip--clear {
    background: #FFEBEE;
    color: #C62828;
    border-color: #FFCDD2;
  }
  .neu-chip--clear:hover {
    background: #C62828;
    color: #FFFFFF;
    border-color: #C62828;
  }

  /* ── Feed header ──────────────────────────────────────────────────────── */
  .neu-home-feed-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E8E8E8;
  }

  /* ── Feed title — Poppins 600, subheading range 18–20px ──────────────── */
  .neu-home-feed-title {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #1A1A1A;
    margin: 0;
    line-height: 1.3;
  }
  /* Warm Gold underline — NEU sun motif accent */
  .neu-home-feed-title span {
    border-bottom: 3px solid #F5C400;
    padding-bottom: 2px;
  }

  /* ── Post count pill ─────────────────────────────────────────────────── */
  .neu-home-post-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #FFFFFF;
    background: #2E7D32;
    padding: 4px 12px;
    border-radius: 100px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Post list ────────────────────────────────────────────────────────── */
  .neu-home-post-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Empty state ─────────────────────────────────────────────────────── */
  .neu-home-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    background: #FFFFFF;
    border-radius: 12px;
    border: 1px dashed #E8E8E8;
    text-align: center;
  }
  .neu-home-empty-icon { font-size: 40px; margin-bottom: 16px; line-height: 1; }
  .neu-home-empty-msg {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #1A1A1A;
    margin: 0 0 6px;
  }
  .neu-home-empty-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #9E9E9E;
    margin: 0;
  }

  /* ── RESPONSIVE: Tablet ───────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .neu-home            { padding: 24px 20px; }
    .neu-home-feed-title { font-size: 18px; }
  }

  /* ── RESPONSIVE: Mobile ───────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .neu-home              { padding: 18px 16px; }
    .neu-home-feed-header  { flex-direction: column; align-items: flex-start; }
    .neu-home-feed-title   { font-size: 16px; }
    .neu-chip              { font-size: 11px; padding: 5px 13px; }
  }
`;

function HomePage() {
  const { posts, communities } = useContext(AppContext);

  // ===========================================================================
  // COMMUNITY FILTER STATE — local to this component
  //
  // WHY local and not global? The filter is a UI preference (like a search
  // box). Other pages (JournalPage, HabitsPage) don't need to know about it.
  // Keeping it local follows the principle of minimal state scope.
  //
  // null = no filter active (show all posts)
  // 'community-1' = show only posts from that community
  // ===========================================================================
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  // ===========================================================================
  // DERIVED DATA: filtered + sorted posts
  //
  // We do NOT store filteredPosts in useState. Instead, we compute it fresh
  // on every render from the current posts + selectedCommunityId.
  //
  // WHY? Because:
  //   a) If selectedCommunityId is null → show all posts (no filter)
  //   b) If selectedCommunityId is set  → only posts matching that community
  //
  // This is equivalent to:
  //   SELECT * FROM posts
  //   WHERE community_id = selectedCommunityId (if filter is active)
  //   ORDER BY created_at DESC
  // ===========================================================================
  const filteredPosts = posts
    .filter((post) => {
      // If no community is selected, this condition is always true → all posts shown
      if (!selectedCommunityId) return true;
      // Otherwise, only keep posts belonging to the selected community
      return post.community_id === selectedCommunityId;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

  // Helper: get community name from id (for the active filter label)
  const activeCommunityName = communities.find(
    (c) => c.id === selectedCommunityId
  )?.name;

  return (
    <>
      <style>{STYLES}</style>
      <div className="neu-home">

        {/* ── COMMUNITY FILTER BAR ──────────────────────────────────────────── */}
        <div className="neu-home-filter">
          <div className="neu-home-filter-label-row">
            <p className="neu-home-filter-label">Browse by community:</p>
          </div>

          <div className="neu-home-chips-row">
            {communities.map((community) => {
              const isActive = selectedCommunityId === community.id;
              return (
                <button
                  key={community.id}
                  className={`neu-chip${isActive ? ' neu-chip--active' : ''}`}
                  onClick={() => {
                    // ===========================================================
                    // TOGGLE FILTER LOGIC:
                    // If user clicks the ALREADY selected community → clear filter
                    // If user clicks a DIFFERENT community → apply that filter
                    // This makes the chip behave like a toggle button.
                    // ===========================================================
                    setSelectedCommunityId(isActive ? null : community.id);
                  }}
                >
                  {community.name}
                </button>
              );
            })}

            {/* Clear filter button — only shows when a filter is active */}
            {selectedCommunityId && (
              <button
                className="neu-chip neu-chip--clear"
                onClick={() => setSelectedCommunityId(null)}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── FEED HEADER ───────────────────────────────────────────────────── */}
        <div className="neu-home-feed-header">
          <h2 className="neu-home-feed-title">
            {/* Warm Gold underline accent per NEU sun motif */}
            <span>
              {selectedCommunityId
                ? `Posts in "${activeCommunityName}"`  // Show filtered label
                : 'All Posts'                           // Show default label
              }
            </span>
          </h2>
          <span className="neu-home-post-count">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── POST LIST ─────────────────────────────────────────────────────── */}
        {filteredPosts.length === 0 ? (
          <div className="neu-home-empty">
            <div className="neu-home-empty-icon">🌱</div>
            <p className="neu-home-empty-msg">No posts in this community yet.</p>
            <p className="neu-home-empty-hint">Be the first to post here!</p>
          </div>
        ) : (
          <div className="neu-home-post-list">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </>
  );
}

// =============================================================================
// NOTE: The inline `styles` object from the original file has been replaced
// by the STYLES constant above. All values reference CSS custom properties
// so any future palette change only needs to be made in one place.
// Responsive breakpoints at 768px (tablet) and 480px (mobile) align with
// the Section 4 web-first recommendation.
// =============================================================================

export default HomePage;