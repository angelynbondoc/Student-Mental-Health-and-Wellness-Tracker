// =============================================================================
// ResourcesPage.jsx — Feature 6: Resource Library (SECI: Combination)
//
// SECI CONNECTION: "Combination" means taking existing explicit knowledge
// (articles, techniques, guides) and COMBINING/reorganizing it into new,
// structured knowledge. This page groups resources by category, turning a
// flat list into an organized knowledge library.
//
// KEY TECHNIQUE: Array.reduce() to group a flat array into a category map.
// =============================================================================
import React, { useState, useContext } from 'react';
import AppContext from '../AppContext';

function ResourcesPage() {
  const { resources } = useContext(AppContext);

  // Track which resource card is expanded (accordion behavior)
  // null means none are open; a resource id means that one is open.
  const [expandedId, setExpandedId] = useState(null);

  // ===========================================================================
  // GROUP RESOURCES BY CATEGORY using Array.reduce()
  //
  // WHY reduce()? We start with a flat array like:
  //   [ {category: 'Breathing', ...}, {category: 'Mindfulness', ...}, {category: 'Breathing', ...} ]
  //
  // And we want an object (a "map") like:
  //   {
  //     'Breathing Exercises': [ resource1, resource2 ],
  //     'Mindfulness':         [ resource3, resource4 ],
  //     'Crisis Support':      [ resource5 ]
  //   }
  //
  // HOW reduce() works:
  //   - It loops through every item in the array.
  //   - `acc` (accumulator) is the object being built up. Starts as {}.
  //   - `resource` is the current item in the loop.
  //   - For each resource, we check: does acc already have a key for this category?
  //     - YES → push this resource into the existing array
  //     - NO  → create a new array with this resource as the first item
  //   - We return the updated acc so the next iteration can build on it.
  // ===========================================================================
  const grouped = resources.reduce((acc, resource) => {
    const cat = resource.category;

    if (!acc[cat]) {
      // This category hasn't been seen yet — create a new bucket for it
      acc[cat] = [];
    }
    // Add this resource into its category bucket
    acc[cat].push(resource);

    return acc; // Always return the accumulator for the next iteration
  }, {}); // {} is the initial value of the accumulator

  // Object.entries() converts { 'Breathing': [...], 'Mindfulness': [...] }
  // into [ ['Breathing', [...]], ['Mindfulness', [...]] ]
  // so we can .map() over it in JSX.
  const categoryEntries = Object.entries(grouped);

  const toggleExpand = (id) => {
    // If the clicked card is already open, close it (set to null).
    // Otherwise, open the clicked card (and implicitly close any other).
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>💚 Resource Library</h2>
      <p style={styles.subtitle}>
        Curated tools and techniques for your mental wellbeing.
      </p>

      {categoryEntries.length === 0 ? (
        <p style={styles.emptyMsg}>No resources available yet.</p>
      ) : (
        categoryEntries.map(([category, items]) => (
          // Each category gets its own section block
          <div key={category} style={styles.categoryBlock}>
            <h3 style={styles.categoryTitle}>
              {getCategoryEmoji(category)} {category}
              <span style={styles.categoryCount}>{items.length}</span>
            </h3>

            {items.map((resource) => {
              const isOpen = expandedId === resource.id;
              return (
                <div key={resource.id} style={styles.resourceCard}>
                  {/* Tappable header to expand/collapse */}
                  <button
                    onClick={() => toggleExpand(resource.id)}
                    style={styles.resourceTitle}
                  >
                    <span>{resource.title}</span>
                    {/* Chevron rotates when open */}
                    <span style={{
                      ...styles.chevron,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>
                      ▾
                    </span>
                  </button>

                  {/* Content only renders when card is expanded */}
                  {isOpen && (
                    <p style={styles.resourceContent}>{resource.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

// Helper: pick an emoji per category to make the UI friendlier
function getCategoryEmoji(category) {
  const map = {
    'Breathing Exercises': '🫁',
    'Mindfulness':         '🧘',
    'Crisis Support':      '🆘',
  };
  return map[category] ?? '📌';
}

const styles = {
  pageTitle: { fontSize: '18px', fontWeight: 'bold', color: '#2c7a4b', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#888', marginBottom: '16px' },
  emptyMsg: { color: '#aaa', textAlign: 'center', padding: '40px 0' },
  categoryBlock: { marginBottom: '20px' },
  categoryTitle: {
    fontSize: '14px', fontWeight: 'bold', color: '#444',
    marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
  },
  categoryCount: {
    marginLeft: 'auto', fontSize: '11px', backgroundColor: '#e8f4e8',
    color: '#2c7a4b', borderRadius: '10px', padding: '2px 8px',
  },
  resourceCard: {
    backgroundColor: '#fff', borderRadius: '10px', marginBottom: '8px',
    border: '1px solid #eee', overflow: 'hidden',
  },
  resourceTitle: {
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 14px', background: 'none',
    border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
    color: '#333', textAlign: 'left',
  },
  chevron: { fontSize: '16px', color: '#aaa', transition: 'transform 0.2s ease' },
  resourceContent: {
    fontSize: '13px', color: '#555', lineHeight: '1.6',
    padding: '0 14px 12px', borderTop: '1px solid #f0f0f0', marginTop: '0',
  },
};

export default ResourcesPage;