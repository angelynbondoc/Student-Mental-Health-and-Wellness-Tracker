// =============================================================================
// JournalPage.jsx — enhanced interactive version
//
// New interactions:
//   - Multi-step guided form (Step 1: Mood → Step 2: Context → Step 3: Write)
//   - Animated mood selector with color-shifting background
//   - Word count live tracker with encouragement messages
//   - Expandable past entries with delete confirmation
//   - Mood trend mini-chart (last 7 entries)
//   - Character prompt suggestions to help students start writing
//   - Smooth step transitions
// =============================================================================
import React, { useState, useContext, useRef, useEffect } from "react";
import AppContext from "../../AppContext";
import { supabase } from "../../supabase";
import { PageShell, EmptyState } from "../../components/ui";
import "./JournalPage.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const MOOD_EMOJIS = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
const MOOD_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Great",
};
const MOOD_COLORS = {
  1: { bg: "#FFEBEE", accent: "#EF9A9A", text: "#C62828" },
  2: { bg: "#FFF3E0", accent: "#FFCC80", text: "#E65100" },
  3: { bg: "#F3E5F5", accent: "#CE93D8", text: "#6A1B9A" },
  4: { bg: "#E8F5E9", accent: "#A5D6A7", text: "#2E7D32" },
  5: { bg: "#E3F2FD", accent: "#90CAF9", text: "#1565C0" },
};

const WRITING_PROMPTS = [
  "What was the most meaningful moment today?",
  "What's one thing you're proud of yourself for?",
  "If today had a color, what would it be and why?",
  "What's something you've been avoiding thinking about?",
  "Who made you feel supported recently?",
  "What would you tell your past self from a week ago?",
  "What small joy did you notice today?",
  "What's weighing on your mind right now?",
];

const WORD_ENCOURAGEMENTS = [
  { min: 0, max: 10, msg: "Start writing — even a few words help 💬" },
  { min: 10, max: 30, msg: "Good start! Keep going 🌱" },
  { min: 30, max: 60, msg: "You're opening up — that takes courage 💚" },
  { min: 60, max: 100, msg: "Great reflection! You're doing amazing 🌟" },
  { min: 100, max: 999, msg: "Deep dive! This is powerful journaling 🏆" },
];

const STEPS = ["Mood", "Context", "Write"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function wordCount(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function getEncouragement(count) {
  return (
    WORD_ENCOURAGEMENTS.find((e) => count >= e.min && count < e.max)?.msg ?? ""
  );
}

function formatDate(iso) {
  const utcString = iso.endsWith("Z") ? iso : iso + "Z";
  return new Date(utcString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MoodTrendChart({ entries }) {
  const [range, setRange] = useState(7);
  const filtered = range === 'all' ? entries : entries.slice(0, range);
  if (filtered.length < 2) return null;

  // Stats
  const ratings = filtered.map(e => e.mood_rating);
  const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

  // Most common
  const counts = ratings.reduce((acc, r) => ({ ...acc, [r]: (acc[r] || 0) + 1 }), {});
  const mostCommon = Number(
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  );

  // Change: newest entry vs oldest entry in range (entries is desc-sorted)
  const newest = filtered[0].mood_rating;
  const oldest = filtered[filtered.length - 1].mood_rating;
  const change = newest - oldest;

  const trendLabel  = change > 0 ? 'Trending upward' : change < 0 ? 'Trending downward' : 'Holding steady';
  const trendIsBad  = change < 0;
  const trendIsGood = change > 0;

  const fmtDate = (iso) => {
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="jp-trend-card">
      {/* Header */}
      <div className="jp-trend-header">
        <div className="jp-trend-title-row">
          <div>
            <h2 className="jp-trend-title">Mood overview</h2>
            <p className="jp-trend-meta">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · last {range === 'all' ? 'all time' : `${range} days`}
            </p>
          </div>
        </div>
        <div className="jp-trend-toggle">
          {[
            { label: 'Week',  val: 7 },
            { label: 'Month', val: 30 },
            { label: 'All',   val: 'all' },
          ].map(opt => (
            <button
              key={opt.label}
              className={`jp-toggle-btn${range === opt.val ? ' jp-toggle-btn--active' : ''}`}
              onClick={() => setRange(opt.val)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="jp-trend-stats">
        <div className="jp-stat-tile">
          <p className="jp-stat-label">Average</p>
          <p className="jp-stat-value">
            {avg}<span className="jp-stat-unit"> / 5</span>
          </p>
        </div>
        <div className="jp-stat-tile">
          <p className="jp-stat-label">Most common</p>
          <div className="jp-stat-mood">
            <span className="jp-stat-emoji">{MOOD_EMOJIS[mostCommon]}</span>
            <span className="jp-stat-mood-label">{MOOD_LABELS[mostCommon]}</span>
          </div>
        </div>
        <div className="jp-stat-tile">
          <p className="jp-stat-label">Entries</p>
          <p className="jp-stat-value">
            {filtered.length}<span className="jp-stat-unit"> {filtered.length === 1 ? 'day' : 'days'}</span>
          </p>
        </div>
        <div className={`jp-stat-tile${trendIsBad ? ' jp-stat-tile--danger' : ''}${trendIsGood ? ' jp-stat-tile--success' : ''}`}>
          <p className="jp-stat-label">Change</p>
          <p className="jp-stat-value jp-stat-change">
            <span className="jp-stat-arrow">
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
            </span>
            {Math.abs(change)}
          </p>
        </div>
      </div>

      {/* Entry bars */}
      <p className="jp-trend-section-label">Recent entries</p>
      <div className="jp-bar-list">
        {filtered.map(entry => {
          const colors = MOOD_COLORS[entry.mood_rating];
          const widthPct = (entry.mood_rating / 5) * 100;
          return (
            <div key={entry.id} className="jp-bar-row">
              <span className="jp-bar-date">{fmtDate(entry.created_at)}</span>
              <div className="jp-bar-track">
                <div
                  className="jp-bar-fill"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${colors.bg} 0%, ${colors.accent} 80%)`,
                  }}
                >
                  <div className="jp-bar-label">
                    <span className="jp-bar-emoji">{MOOD_EMOJIS[entry.mood_rating]}</span>
                    <span className="jp-bar-mood-text" style={{ color: colors.text }}>
                      {MOOD_LABELS[entry.mood_rating]}
                    </span>
                  </div>
                </div>
              </div>
              <span className="jp-bar-rating">{entry.mood_rating} / 5</span>
            </div>
          );
        })}
      </div>

      {/* Scale legend */}
      <div className="jp-scale-legend">
        <span>😢</span><span>😕</span><span>😐</span><span>🙂</span><span>😄</span>
      </div>

      {/* Insight — only if there's a meaningful pattern */}
      {trendIsBad && (
        <div className="jp-insight-box">
          <div className="jp-insight-icon-wrap">💡</div>
          <div>
            <p className="jp-insight-title">Notice the pattern</p>
            <p className="jp-insight-body">
              Your mood has dipped recently. Adding context to today's entry might help — what's been on your mind?
            </p>
          </div>
        </div>
      )}
      {trendIsGood && (
        <div className="jp-insight-box jp-insight-box--positive">
          <div className="jp-insight-icon-wrap">🌱</div>
          <div>
            <p className="jp-insight-title">Things are looking up</p>
            <p className="jp-insight-body">
              Your mood is trending upward. What's been working well for you?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Entry Card ────────────────────────────────────────────────────────────────
function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const colors = MOOD_COLORS[entry.mood_rating];

  return (
    <div
      className="jp-entry-card"
      style={{ "--entry-accent": colors.accent, "--entry-bg": colors.bg }}
    >
      {/* Header — always visible */}
      <div className="jp-entry-header" onClick={() => setExpanded((v) => !v)}>
        <div
          className="jp-entry-mood-dot"
          style={{ background: colors.accent }}
        >
          <span className="jp-entry-emoji">
            {MOOD_EMOJIS[entry.mood_rating]}
          </span>
        </div>
        <div className="jp-entry-meta-col">
          <span className="jp-entry-mood-label" style={{ color: colors.text }}>
            {MOOD_LABELS[entry.mood_rating]}
          </span>
          <span className="jp-entry-date">{formatDate(entry.created_at)}</span>
        </div>
        <span className="jp-entry-preview">
          {!expanded && entry.entry_text.slice(0, 60)}
          {!expanded && entry.entry_text.length > 60 && "…"}
        </span>
        <button
          className="jp-expand-btn"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="jp-entry-body">
          <p className="jp-entry-text">{entry.entry_text}</p>
          <div className="jp-entry-extras">
            {entry.trigger_note && (
              <div className="jp-extra-chip">
                <span>⚡</span> {entry.trigger_note}
              </div>
            )}
            {entry.gratitude_note && (
              <div className="jp-extra-chip">
                <span>🙏</span> {entry.gratitude_note}
              </div>
            )}
            {entry.reflection_note && (
              <div className="jp-extra-chip">
                <span>💡</span> {entry.reflection_note}
              </div>
            )}
          </div>
          <div className="jp-entry-actions">
            {confirming ? (
              <div className="jp-confirm-row">
                <span className="jp-confirm-text">Delete this entry?</span>
                <button
                  className="jp-action-btn jp-action-btn--danger"
                  onClick={() => onDelete(entry.id)}
                >
                  Yes, delete
                </button>
                <button
                  className="jp-action-btn"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="jp-action-btn jp-action-btn--danger"
                onClick={() => setConfirming(true)}
              >
                🗑 Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="jp-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div
            className={`jp-step ${i < current ? "jp-step--done" : ""} ${i === current ? "jp-step--active" : ""}`}
          >
            <div className="jp-step-circle">{i < current ? "✓" : i + 1}</div>
            <span className="jp-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`jp-step-line${i < current ? " jp-step-line--done" : ""}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const { currentUser } = useContext(AppContext);
  const [myEntries, setMyEntries] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchEntries() {
      const { data } = await supabase
        .from("mood_journal")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (data) setMyEntries(data);
    }
    fetchEntries();
  }, [currentUser?.id]);

  const [step, setStep] = useState(0);
  const [moodRating, setMoodRating] = useState(3);
  const [triggerNote, setTriggerNote] = useState("");
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [reflectionNote, setReflectionNote] = useState("");
  const [entryText, setEntryText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [promptIdx, setPromptIdx] = useState(() =>
    Math.floor(Math.random() * WRITING_PROMPTS.length),
  );
  const textareaRef = useRef(null);

  const moodColors = MOOD_COLORS[moodRating];
  const wc = wordCount(entryText);
  const encouragement = getEncouragement(wc);

  // Focus textarea when entering step 2
  useEffect(() => {
    if (step === 2) textareaRef.current?.focus();
  }, [step]);

  const handleSubmit = async () => {
    if (!entryText.trim() || !currentUser) return;
    const { data, error } = await supabase
      .from("mood_journal")
      .insert({
        user_id: currentUser.id,
        mood_rating: moodRating,
        trigger_note: triggerNote.trim(),
        gratitude_note: gratitudeNote.trim(),
        reflection_note: reflectionNote.trim(),
        entry_text: entryText.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setMyEntries((prev) => [data, ...prev]);
      setStep(0);
      setMoodRating(3);
      setTriggerNote("");
      setGratitudeNote("");
      setReflectionNote("");
      setEntryText("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("mood_journal").delete().eq("id", id);
    if (!error) setMyEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const shufflePrompt = () =>
    setPromptIdx((i) => (i + 1) % WRITING_PROMPTS.length);

  return (
    <PageShell
      heading=" Mood Journal"
      sub="Externalize your feelings — write it out."
      narrow
    >
      {/* ── Success toast ────────────────────────────────────────────────── */}
      {submitted && (
        <div className="jp-toast">
          Entry saved! Keep reflecting — you're doing great.
        </div>
      )}

      {/* ── Multi-step form card ─────────────────────────────────────────── */}
      <div
        className="jp-form-card"
        style={{
          "--mood-bg": moodColors.bg,
          "--mood-accent": moodColors.accent,
          "--mood-text": moodColors.text,
        }}
      >
        <StepIndicator current={step} />

        {/* ── Step 0: Mood picker ────────────────────────────────────────── */}
        {/* ── Step 0: Mood picker ────────────────────────────────────────── */}
        {step === 0 && (
          <div className="jp-step-content jp-step-content--mood">
            <h3 className="jp-step-heading">How are you feeling right now?</h3>
            <div className="jp-mood-row">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`jp-mood-btn${moodRating === rating ? " jp-mood-btn--active" : ""}`}
                  onClick={() => setMoodRating(rating)}
                  style={
                    moodRating === rating
                      ? {
                          background: MOOD_COLORS[rating].bg,
                          borderColor: MOOD_COLORS[rating].accent,
                          boxShadow: `0 4px 16px ${MOOD_COLORS[rating].accent}66`,
                        }
                      : {}
                  }
                >
                  <span className="jp-mood-emoji">{MOOD_EMOJIS[rating]}</span>
                  <span className="jp-mood-label">{MOOD_LABELS[rating]}</span>
                </button>
              ))}
            </div>

            {/* Mood color bar */}
            <div
              className="jp-mood-bar"
              style={{ background: moodColors.accent }}
            >
              <span style={{ color: moodColors.text }}>
                {MOOD_EMOJIS[moodRating]} Feeling{" "}
                {MOOD_LABELS[moodRating].toLowerCase()} today
              </span>
            </div>

            {/* Compact CTA row — not a full-width slab */}
            <div className="jp-step-nav jp-step-nav--end">
              <button
                className="jp-next-btn"
                onClick={() => setStep(1)}
                style={{ background: moodColors.text }}
              >
                Next: Add context →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Context ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="jp-step-content">
            <h3 className="jp-step-heading">
              What's behind this feeling?
              <span className="jp-step-sub"> (all optional)</span>
            </h3>

            <div className="jp-context-fields">
              <div className="jp-context-field">
                <label className="jp-field-label">
                  What triggered this mood?
                </label>
                <input
                  className="jp-input"
                  value={triggerNote}
                  onChange={(e) => setTriggerNote(e.target.value)}
                  placeholder="e.g., Stressful exam, argument with a friend…"
                />
              </div>
              <div className="jp-context-field">
                <label className="jp-field-label">
                  What are you grateful for?
                </label>
                <input
                  className="jp-input"
                  value={gratitudeNote}
                  onChange={(e) => setGratitudeNote(e.target.value)}
                  placeholder="e.g., My supportive friends, a good meal…"
                />
              </div>
              <div className="jp-context-field">
                <label className="jp-field-label">
                  One thing you'd do differently?
                </label>
                <input
                  className="jp-input"
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  placeholder="e.g., Take a break earlier, ask for help sooner…"
                />
              </div>
            </div>

            <div className="jp-step-nav">
              <button className="jp-back-btn" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button
                className="jp-next-btn"
                onClick={() => setStep(2)}
                style={{ background: moodColors.text }}
              >
                Next: Write →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Write ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="jp-step-content">
            <h3 className="jp-step-heading">Write your entry</h3>

            {/* Prompt suggestion */}
            <div
              className="jp-prompt-chip"
              onClick={shufflePrompt}
              title="Click for a new prompt"
            >
              <span className="jp-prompt-text">
                {WRITING_PROMPTS[promptIdx]}
              </span>
              <span className="jp-prompt-shuffle">↻</span>
            </div>

            <textarea
              ref={textareaRef}
              className="jp-textarea"
              rows={6}
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write freely about your day, your thoughts, how you're coping…"
            />

            {/* Live word count + encouragement */}
            <div className="jp-wordcount-row">
              <span className="jp-wordcount">{wc} words</span>
              <span className="jp-encouragement">{encouragement}</span>
            </div>

            {/* Word count progress bar */}
            <div className="jp-wc-bar-bg">
              <div
                className="jp-wc-bar-fill"
                style={{
                  width: `${Math.min((wc / 100) * 100, 100)}%`,
                  background: wc >= 100 ? "#2E7D32" : moodColors.accent,
                }}
              />
            </div>

            <div className="jp-step-nav">
              <button className="jp-back-btn" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="jp-submit-btn"
                onClick={handleSubmit}
                disabled={!entryText.trim()}
                style={{
                  background: entryText.trim() ? moodColors.text : undefined,
                }}
              >
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Mood trend chart ─────────────────────────────────────────────── */}
      {myEntries.length >= 2 && <MoodTrendChart entries={myEntries} />}

      {/* ── Past entries ─────────────────────────────────────────────────── */}
      <div className="jp-past-header">
        <h3 className="jp-past-heading">Past Entries</h3>
        <span className="jp-past-count">{myEntries.length}</span>
      </div>

      {myEntries.length === 0 ? (
        <EmptyState message="No entries yet. Write your first one above!" />
      ) : (
        <div className="jp-entries-list">
          {myEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
