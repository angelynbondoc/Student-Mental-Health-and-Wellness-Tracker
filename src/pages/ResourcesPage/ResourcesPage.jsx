import React, { useState, useEffect, useContext } from "react";
import { Plus, X, Check } from "lucide-react";
import { supabase } from "../../supabase";
import AppContext from "../../AppContext";
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
  const { currentUser } = useContext(AppContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submission State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "", year: "", key_idea: "", findings: "", citation: "", url: ""
  });

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

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.key_idea) return;
    
    setSubmitting(true);
    const { error } = await supabase.from("resources").insert({
      ...formData,
      status: "pending",
      submitted_by: currentUser.id
    });

    setSubmitting(false);
    
    if (!error) {
      setShowModal(false);
      setFormData({ title: "", year: "", key_idea: "", findings: "", citation: "", url: "" });
      setToast("Resource submitted for admin review!");
      setTimeout(() => setToast(null), 4000);
    } else {
      console.error("Submit error:", error);
      setToast("Failed to submit resource.");
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <PageShell
      heading="Resource Library"
      sub="Academic research and readings for your wellbeing."
    >
      <div className="ra-actions-row">
        <button className="ra-submit-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Submit a Resource
        </button>
      </div>

      {toast && (
        <div className="ra-toast">
          <Check size={16} /> {toast}
        </div>
      )}

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

      {/* Submission Modal */}
      {showModal && (
        <div className="ra-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ra-modal" onClick={e => e.stopPropagation()}>
            <div className="ra-modal-header">
              <h2>Submit Resource</h2>
              <button className="ra-close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="ra-modal-sub">Submitted resources must be reviewed by an admin before becoming public.</p>
            
            <form onSubmit={handleSubmit} className="ra-form">
              <div className="ra-form-group">
                <label>Title *</label>
                <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Article or book title" />
              </div>
              <div className="ra-form-group">
                <label>Year</label>
                <input name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g. 2024" />
              </div>
              <div className="ra-form-group">
                <label>Key Idea *</label>
                <textarea required name="key_idea" value={formData.key_idea} onChange={handleInputChange} placeholder="Brief summary of the main concept" rows={2} />
              </div>
              <div className="ra-form-group">
                <label>Findings / Content</label>
                <textarea name="findings" value={formData.findings} onChange={handleInputChange} placeholder="Detailed findings or abstract" rows={3} />
              </div>
              <div className="ra-form-group">
                <label>Citation</label>
                <input name="citation" value={formData.citation} onChange={handleInputChange} placeholder="APA/MLA citation format" />
              </div>
              <div className="ra-form-group">
                <label>URL Link</label>
                <input name="url" type="url" value={formData.url} onChange={handleInputChange} placeholder="https://..." />
              </div>

              <div className="ra-modal-footer">
                <button type="button" className="ra-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ra-save-btn" disabled={submitting || !formData.title || !formData.key_idea}>
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}