import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ChevronDown,
  Quote,
  Calendar,
  Library,
  FileText,
  Plus,
  X,
  Check,
  Link,
  Lightbulb,
  AlignLeft,
} from "lucide-react";
import { supabase } from "../../supabase";
import AppContext from "../../AppContext";
import { PageShell, EmptyState } from "../../components/ui";
import "./ResourcesPage.css";

/* ─── Add Resource Modal ─────────────────────────────────────────────────── */
function AddResourceModal({ onClose, onSubmitted }) {
  const { currentUser } = useContext(AppContext);
  const [form, setForm] = useState({
    year: "",
    key_idea: "",
    title: "",
    findings: "",
    citation: "",
    url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.key_idea.trim()) { setError("Key idea is required."); return; }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from("resources").insert({
      key_idea:    form.key_idea.trim(),
      title:       form.title.trim() || null,
      year:        form.year ? parseInt(form.year, 10) : null,
      findings:    form.findings.trim() || null,
      citation:    form.citation.trim() || null,
      url:         form.url.trim() || null,
      status:      "pending",
      submitted_by: currentUser?.id ?? null,
    });
    setSubmitting(false);
    if (err) { setError("Failed to submit. Please try again."); return; }
    onSubmitted();
  };

  return (
    <div className="arm-overlay" onClick={onClose}>
      <div className="arm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="arm-header">
          <div className="arm-header-icon" aria-hidden="true">
            <BookOpen size={18} strokeWidth={2} />
          </div>
          <div>
            <h2 className="arm-title">Suggest a Resource</h2>
            <p className="arm-subtitle">Submitted articles are reviewed before publishing.</p>
          </div>
          <button className="arm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Preview strip */}
        <div className="arm-preview">
          <span className="arm-preview-label">Preview</span>
          <div className="arm-preview-card">
            <div className="arm-preview-index">01</div>
            <div className="arm-preview-meta">
              <div className="arm-preview-topline">
                <Calendar size={11} strokeWidth={2.2} />
                <span>{form.year || "Year"}</span>
                <span className="arm-preview-dot">·</span>
                <FileText size={11} strokeWidth={2.2} />
                <span>Research article</span>
              </div>
              <p className="arm-preview-key-idea">{form.key_idea || "Key idea will appear here"}</p>
              {form.title && <p className="arm-preview-title">{form.title}</p>}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="arm-fields">

          {/* Year + Key Idea side by side */}
          <div className="arm-row">
            <div className="arm-field arm-field--sm">
              <label className="arm-label">
                <Calendar size={13} strokeWidth={2.2} />
                Year
              </label>
              <input
                className="arm-input"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="e.g. 2023"
                value={form.year}
                onChange={set("year")}
              />
            </div>
            <div className="arm-field arm-field--grow">
              <label className="arm-label">
                <Lightbulb size={13} strokeWidth={2.2} />
                Key Idea <span className="arm-required">*</span>
              </label>
              <input
                className="arm-input"
                type="text"
                placeholder="The main takeaway or headline"
                value={form.key_idea}
                onChange={set("key_idea")}
                maxLength={120}
              />
            </div>
          </div>

          {/* Title */}
          <div className="arm-field">
            <label className="arm-label">
              <FileText size={13} strokeWidth={2.2} />
              Article Title
            </label>
            <input
              className="arm-input"
              type="text"
              placeholder="Full title of the paper or article"
              value={form.title}
              onChange={set("title")}
              maxLength={200}
            />
          </div>

          {/* Findings */}
          <div className="arm-field">
            <label className="arm-label">
              <AlignLeft size={13} strokeWidth={2.2} />
              Key Findings
            </label>
            <textarea
              className="arm-textarea"
              rows={3}
              placeholder="Summarise the main findings or conclusions…"
              value={form.findings}
              onChange={set("findings")}
              maxLength={600}
            />
            <span className="arm-char">{form.findings.length}/600</span>
          </div>

          {/* Citation */}
          <div className="arm-field">
            <label className="arm-label">
              <Quote size={13} strokeWidth={2.2} />
              Citation
            </label>
            <input
              className="arm-input"
              type="text"
              placeholder="APA or MLA citation"
              value={form.citation}
              onChange={set("citation")}
              maxLength={300}
            />
          </div>

          {/* URL */}
          <div className="arm-field">
            <label className="arm-label">
              <Link size={13} strokeWidth={2.2} />
              Article URL
            </label>
            <input
              className="arm-input"
              type="url"
              placeholder="https://doi.org/…"
              value={form.url}
              onChange={set("url")}
            />
          </div>

          {error && <p className="arm-error">{error}</p>}
        </div>

        {/* Footer actions */}
        <div className="arm-footer">
          <button className="arm-btn arm-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="arm-btn arm-btn--primary"
            onClick={handleSubmit}
            disabled={submitting || !form.key_idea.trim()}
          >
            {submitting ? (
              <>
                <span className="arm-spinner" aria-hidden="true" /> Submitting…
              </>
            ) : (
              <>
                <Check size={14} /> Submit for review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success toast ──────────────────────────────────────────────────────── */
function SuccessToast({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="arm-toast" role="status">
      <Check size={15} strokeWidth={2.5} />
      Resource submitted for review — thank you!
    </div>
  );
}

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
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const handleSubmitted = () => {
    setShowModal(false);
    setShowToast(true);
  };

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

        {/* ── Toolbar: search + add button ────────────────────────── */}
        {!loading && (
          <div className="ra-toolbar">
            {articles.length > 0 && (
              <div className="ra-search-wrap">
                <Search size={15} strokeWidth={2} className="ra-search-icon" aria-hidden="true" />
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
            <button
              type="button"
              className="ra-add-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} strokeWidth={2.5} />
              Suggest a resource
            </button>
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

      {/* ── Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <AddResourceModal
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────── */}
      {showToast && <SuccessToast onDone={() => setShowToast(false)} />}
    </PageShell>
  );
}