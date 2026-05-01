import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { PageShell, EmptyState } from "../../components/ui";
import "./ResourcesPage.css";

const CATEGORY_EMOJI = {
  "Breathing Exercises": "🫁",
  Mindfulness: "🧘",
  "Crisis Support": "🆘",
};
const getCategoryEmoji = (cat) => CATEGORY_EMOJI[cat] ?? "📌";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("category", { ascending: true })
      if (data) setResources(data);
      if (error) console.error("Resources fetch error:", error);
      setLoading(false);
    }
    fetchResources();
  }, []);

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
      {loading ? (
        <p style={{ textAlign: "center", padding: "24px", color: "var(--text)" }}>
          Loading…
        </p>
      ) : categoryEntries.length === 0 ? (
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
                    <span className={`rp-chevron${isOpen ? " rp-chevron--open" : ""}`}>
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