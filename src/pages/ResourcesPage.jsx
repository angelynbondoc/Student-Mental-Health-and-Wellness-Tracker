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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-resources {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
    display: flex;              /* ← add these 3 lines */
    flex-direction: column;
    align-items: center;
  }
  .neu-resources-inner { max-width: 720px; 
    width: 100%; }
  .neu-res-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 22px; font-weight: 600;
    color: #1A1A1A; margin: 0 0 4px;
  }
  .neu-res-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #9E9E9E; margin: 0 0 32px;
  }
  .neu-res-empty {
    font-family: 'DM Sans', sans-serif;
    color: #9E9E9E; text-align: center; padding: 48px 0;
  }

  /* Category block */
  .neu-category-block { margin-bottom: 32px; }
  .neu-category-heading {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
    padding-left: 12px;
    border-left: 3px solid #F5C400; /* Warm Gold — accent per design rationale */
  }
  .neu-category-title {
    font-family: 'Poppins', sans-serif;
    font-size: 14px; font-weight: 600;
    color: #1A1A1A; margin: 0; flex: 1;
  }
  /* Count badge — primary green */
  .neu-category-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    background: #E8F5E9; color: #2E7D32;
    border-radius: 100px; padding: 2px 10px;
  }

  /* Resource card */
  .neu-resource-card {
    background: #FFFFFF;
    border-radius: 10px;
    margin-bottom: 8px;
    border: 1px solid #E8E8E8;
    overflow: hidden;
    transition: box-shadow 0.15s ease;
  }
  .neu-resource-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.07); }
  .neu-resource-title-btn {
    width: 100%; display: flex;
    justify-content: space-between; align-items: center;
    padding: 14px 18px; background: none; border: none;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #1A1A1A; text-align: left;
    transition: background 0.15s ease;
  }
  .neu-resource-title-btn:hover { background: #F2F2F2; }
  /* Chevron rotates when open */
  .neu-chevron {
    font-size: 15px; color: #9E9E9E;
    transition: transform 0.2s ease; flex-shrink: 0; margin-left: 8px;
  }
  .neu-chevron--open { transform: rotate(180deg); color: #2E7D32; }

  /* Expanded content */
  .neu-resource-content {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #374151;
    line-height: 1.7; padding: 0 18px 16px;
    border-top: 1px solid #F2F2F2; margin: 0;
  }

  @media (max-width: 768px) { .neu-resources { padding: 24px 20px; } }
  @media (max-width: 480px) { .neu-resources { padding: 18px 16px; } }
`;

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
    <>
      <style>{STYLES}</style>
      <div className="neu-resources">
        <div className="neu-resources-inner">
          <h2 className="neu-res-heading">💚 Resource Library</h2>
          <p className="neu-res-sub">Curated tools and techniques for your mental wellbeing.</p>

          {categoryEntries.length === 0 ? (
            <p className="neu-res-empty">No resources available yet.</p>
          ) : (
            categoryEntries.map(([category, items]) => (
              // Each category gets its own section block
              <div key={category} className="neu-category-block">
                <div className="neu-category-heading">
                  <h3 className="neu-category-title">
                    {getCategoryEmoji(category)} {category}
                  </h3>
                  <span className="neu-category-count">{items.length}</span>
                </div>

                {items.map((resource) => {
                  const isOpen = expandedId === resource.id;
                  return (
                    <div key={resource.id} className="neu-resource-card">
                      {/* Tappable header to expand/collapse */}
                      <button
                        className="neu-resource-title-btn"
                        onClick={() => toggleExpand(resource.id)}
                      >
                        <span>{resource.title}</span>
                        {/* Chevron rotates when open */}
                        <span className={`neu-chevron${isOpen ? ' neu-chevron--open' : ''}`}>
                          ▾
                        </span>
                      </button>

                      {/* Content only renders when card is expanded */}
                      {isOpen && (
                        <p className="neu-resource-content">{resource.content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
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

export default ResourcesPage;