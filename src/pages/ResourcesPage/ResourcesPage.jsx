import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ChevronDown,
  Quote,
  Calendar,
  Library,
  FileText,
} from "lucide-react";
import { supabase } from "../../supabase";
import { PageShell, EmptyState } from "../../components/ui";
import "./ResourcesPage.css";

/* ─── Article accordion ──────────────────────────────────────────────────── */
function ArticleAccordion({ article, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article
      className={`ra-card ${isOpen ? "is-open" : ""}`}
      style={{ "--ra-stagger": `${index * 50}ms` }}
    >
      <span className="ra-card__rail" aria-hidden="true" />

      <button
        type="button"
        className="ra-card__header"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className="ra-card__index" aria-hidden="true">
          <span className="ra-card__index-num">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="ra-card__meta">
          <div className="ra-card__topline">
            <span className="ra-card__year">
              <Calendar size={11} strokeWidth={2.2} aria-hidden="true" />
              {article.year ?? "Undated"}
            </span>
            <span className="ra-card__divider" aria-hidden="true">·</span>
            <span className="ra-card__type">
              <FileText size={11} strokeWidth={2.2} aria-hidden="true" />
              Research article
            </span>
          </div>

          <h3 className="ra-card__key-idea">
            {article.key_idea ?? article.content}
          </h3>

          {article.title && (
            <p className="ra-card__title">{article.title}</p>
          )}
        </div>

        <span className={`ra-chevron ${isOpen ? "is-open" : ""}`} aria-hidden="true">
          <ChevronDown size={18} strokeWidth={2} />
        </span>
      </button>

      <div className={`ra-card__body-wrap ${isOpen ? "is-open" : ""}`}>
        <div className="ra-card__body">
          {article.findings && (
            <div className="ra-card__section">
              <span className="ra-card__section-label">Key findings</span>
              <p className="ra-card__findings">{article.findings}</p>
            </div>
          )}

          {article.citation && (
            <div className="ra-card__citation">
              <Quote size={14} strokeWidth={2} aria-hidden="true" className="ra-card__citation-icon" />
              <p>{article.citation}</p>
            </div>
          )}

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ra-read-btn"
            >
              <span>Read full article</span>
              <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="ra-list" aria-busy="true" aria-label="Loading articles">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ra-skeleton" style={{ "--ra-stagger": `${i * 80}ms` }}>
          <div className="ra-skeleton__index" />
          <div className="ra-skeleton__content">
            <div className="ra-skeleton__line ra-skeleton__line--xs" />
            <div className="ra-skeleton__line ra-skeleton__line--lg" />
            <div className="ra-skeleton__line ra-skeleton__line--md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page export ────────────────────────────────────────────────────────── */
export default function ResourcesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    async function fetchResources() {
      const { data, error } = await supabase
        .from("resources")
        .select("id, title, year, key_idea, findings, citation, url, content")
        .eq("status", "approved")
        .order("year", { ascending: false });
      if (data) setArticles(data);
      if (error) console.error("Resources fetch error:", error);
      setLoading(false);
    }
    fetchResources();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.key_idea?.toLowerCase().includes(q) ||
        a.findings?.toLowerCase().includes(q) ||
        a.citation?.toLowerCase().includes(q) ||
        String(a.year ?? "").includes(q)
    );
  }, [articles, search]);

  const yearRange = useMemo(() => {
    if (articles.length === 0) return null;
    const years = articles.map((a) => a.year).filter(Boolean).sort();
    if (years.length === 0) return null;
    return years[0] === years[years.length - 1]
      ? `${years[0]}`
      : `${years[0]}–${years[years.length - 1]}`;
  }, [articles]);

  return (
    <PageShell
      heading="Resource Library"
      sub="Academic research and readings for your wellbeing."
      wide
    >
      <div className="ra-root">
        {/* ── Hero strip ──────────────────────────────────────────── */}
        <header className="ra-hero">
          <div className="ra-hero__icon" aria-hidden="true">
            <Library size={22} strokeWidth={2} />
          </div>
          <div className="ra-hero__text">
            <p className="ra-hero__eyebrow">Curated for students</p>
            <h2 className="ra-hero__title">
              A quiet space to read, reflect, and learn.
            </h2>
            <p className="ra-hero__sub">
              Peer-reviewed research and trusted readings selected by NEU's
              wellness team — short summaries, key findings, and direct links.
            </p>
          </div>

          {!loading && articles.length > 0 && (
            <div className="ra-hero__stats">
              <div className="ra-stat">
                <span className="ra-stat__num">{articles.length}</span>
                <span className="ra-stat__label">
                  {articles.length === 1 ? "article" : "articles"}
                </span>
              </div>
              {yearRange && (
                <div className="ra-stat">
                  <span className="ra-stat__num">{yearRange}</span>
                  <span className="ra-stat__label">years</span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Search bar ──────────────────────────────────────────── */}
        {!loading && articles.length > 0 && (
          <div className="ra-search-wrap">
            <Search
              size={15}
              strokeWidth={2}
              className="ra-search-icon"
              aria-hidden="true"
            />
            <input
              type="text"
              className="ra-search"
              placeholder="Search by title, year, finding, or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search resources"
            />
            {search && (
              <button
                type="button"
                className="ra-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── Results header ──────────────────────────────────────── */}
        {!loading && search && (
          <p className="ra-results-meta" aria-live="polite">
            {filtered.length === 0
              ? "No articles match your search."
              : `Showing ${filtered.length} of ${articles.length} articles`}
          </p>
        )}

        {/* ── Body ────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 && !search ? (
          <div className="ra-empty">
            <div className="ra-empty__icon" aria-hidden="true">
              <BookOpen size={28} strokeWidth={1.6} />
            </div>
            <h3 className="ra-empty__heading">The library is being curated</h3>
            <p className="ra-empty__body">
              New research articles will appear here soon. Check back later.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ra-empty">
            <div className="ra-empty__icon" aria-hidden="true">
              <Search size={28} strokeWidth={1.6} />
            </div>
            <h3 className="ra-empty__heading">No matches found</h3>
            <p className="ra-empty__body">
              Try a different keyword or year, or clear your search.
            </p>
          </div>
        ) : (
          <div className="ra-list">
            {filtered.map((article, i) => (
              <ArticleAccordion key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}