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
import PostCard from '../components/PostCard';

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
    <div>
      {/* ── COMMUNITY FILTER BAR ──────────────────────────────────────────── */}
      <div style={styles.filterSection}>
        <p style={styles.filterLabel}>Browse by community:</p>

        <div style={styles.filterChipsRow}>
          {communities.map((community) => {
            const isActive = selectedCommunityId === community.id;
            return (
              <button
                key={community.id}
                onClick={() => {
                  // ===========================================================
                  // TOGGLE FILTER LOGIC:
                  // If user clicks the ALREADY selected community → clear filter
                  // If user clicks a DIFFERENT community → apply that filter
                  // This makes the chip behave like a toggle button.
                  // ===========================================================
                  setSelectedCommunityId(
                    isActive ? null : community.id
                  );
                }}
                style={{
                  ...styles.filterChip,
                  // Visual feedback: active chip looks "pressed"
                  backgroundColor: isActive ? '#2c7a4b' : '#f0f0f0',
                  color:           isActive ? '#fff'    : '#555',
                  border:          isActive ? '1px solid #2c7a4b' : '1px solid #ddd',
                }}
              >
                {community.name}
              </button>
            );
          })}

          {/* Clear filter button — only shows when a filter is active */}
          {selectedCommunityId && (
            <button
              onClick={() => setSelectedCommunityId(null)}
              style={styles.clearBtn}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── FEED HEADER ───────────────────────────────────────────────────── */}
      <div style={styles.feedHeader}>
        <h2 style={styles.feedTitle}>
          {selectedCommunityId
            ? `Posts in "${activeCommunityName}"`  // Show filtered label
            : 'All Posts'                           // Show default label
          }
        </h2>
        <span style={styles.postCount}>{filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── POST LIST ─────────────────────────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyMsg}>No posts in this community yet.</p>
          <p style={styles.emptyHint}>Be the first to post here!</p>
        </div>
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

const styles = {
  filterSection: { marginBottom: '14px' },
  filterLabel: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  filterChipsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  filterChip: {
    padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
    cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease',
  },
  clearBtn: {
    padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
    cursor: 'pointer', backgroundColor: '#fdecea', color: '#c0392b',
    border: '1px solid #f5c6c0',
  },
  feedHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '10px',
  },
  feedTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
  postCount: { fontSize: '12px', color: '#aaa' },
  emptyState: { textAlign: 'center', paddingTop: '40px' },
  emptyMsg: { fontSize: '14px', color: '#888' },
  emptyHint: { fontSize: '12px', color: '#bbb', marginTop: '4px' },
};

export default HomePage;