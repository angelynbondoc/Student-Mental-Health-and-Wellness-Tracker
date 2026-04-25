// =============================================================================
// ResourcesPage.jsx — refactored
// Shared: PageShell, EmptyState, shared.css
// Own:    ResourcesPage.css (accordion cards, category blocks)
//
// SECI Combination: groups a flat array into a category map using reduce().
// =============================================================================
import React, { useState, useContext } from "react";
import AppContext from "../../AppContext";
import { PageShell, EmptyState } from "../../components/ui";
import "./ResourcesPage.css";

// Helper: emoji per category
const CATEGORY_EMOJI = {
  "Breathing Exercises": "🫁",
  Mindfulness: "🧘",
  "Crisis Support": "🆘",
};
const getCategoryEmoji = (cat) => CATEGORY_EMOJI[cat] ?? "📌";

export default function ResourcesPage() {
  const { resources } = useContext(AppContext);
  const [expandedId, setExpandedId] = useState(null);

  // GROUP resources by category using reduce()
  // SQL equivalent: SELECT * FROM resources ORDER BY category
  // JS groups: { 'Breathing': [r1, r2], 'Mindfulness': [r3] }
  const grouped = resources.reduce((acc, resource) => {
    const cat = resource.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(resource);
    return acc;
  }, {});

  const categoryEntries = Object.entries(grouped);

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <PageShell
      heading="💚 Resource Library"
      sub="Curated tools and techniques for your mental wellbeing."
    >
      {categoryEntries.length === 0 ? (
        <EmptyState message="No resources available yet." />
      ) : (
        categoryEntries.map(([category, items]) => (
          <div key={category} className="rp-category-block">
            <div className="rp-category-heading">
              <h3 className="rp-category-title">
                {getCategoryEmoji(category)} {category}
              </h3>
              <span className="rp-category-count">{items.length}</span>
            </div>

            {items.map((resource) => {
              const isOpen = expandedId === resource.id;
              return (
                <div key={resource.id} className="rp-card">
                  <button
                    className="rp-card__btn"
                    onClick={() => toggleExpand(resource.id)}
                  >
                    <span>{resource.title}</span>
                    <span
                      className={`rp-chevron${isOpen ? " rp-chevron--open" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <p className="rp-card__content">{resource.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </PageShell>
  );
}
