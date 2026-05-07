import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { PageShell, EmptyState } from "../../components/ui";
import "./ResourcesPage.css";

function ArticleAccordion({ article }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`ra-card ${isOpen ? "ra-card--open" : ""}`}>
      <button
        className="ra-card__header"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className="ra-card__meta">
          <span className="ra-card__year">{article.year ?? "—"}</span>
          <p className="ra-card__key-idea">{article.key_idea ?? article.content}</p>
          <p className="ra-card__title">{article.title}</p>
        </div>
        <span className={`ra-chevron ${isOpen ? "ra-chevron--open" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div className="ra-card__body">
          {article.findings && (
            <p className="ra-card__findings">{article.findings}</p>
          )}
          {article.citation && (
            <p className="ra-card__citation">{article.citation}</p>
          )}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ra-read-btn"
            >
              Read article ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from("resources")
        .select("id, title, year, key_idea, findings, citation, url, content")
        .order("year", { ascending: false });
      if (data) setArticles(data);
      if (error) console.error("Resources fetch error:", error);
      setLoading(false);
    }
    fetchResources();
  }, []);

  return (
    <PageShell
      heading="Resource Library"
      sub="Academic research and readings for your wellbeing."
    >
      {loading ? (
        <p style={{ textAlign: "center", padding: "24px", color: "var(--text)" }}>
          Loading…
        </p>
      ) : articles.length === 0 ? (
        <EmptyState message="No articles available yet." />
      ) : (
        <div className="ra-list">
          {articles.map((article) => (
            <ArticleAccordion key={article.id} article={article} />
          ))}
        </div>
      )}
    </PageShell>
  );
}