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
import React, { useState, useContext, useRef, useEffect } from 'react';
import AppContext from '../../AppContext';
import { supabase } from '../../supabase';
import { PageShell, EmptyState } from '../../components/ui';
import './JournalPage.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const MOOD_EMOJIS  = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_LABELS  = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' };
const MOOD_COLORS  = {
  1: { bg: '#FFEBEE', accent: '#EF9A9A', text: '#C62828' },
  2: { bg: '#FFF3E0', accent: '#FFCC80', text: '#E65100' },
  3: { bg: '#F3E5F5', accent: '#CE93D8', text: '#6A1B9A' },
  4: { bg: '#E8F5E9', accent: '#A5D6A7', text: '#2E7D32' },
  5: { bg: '#E3F2FD', accent: '#90CAF9', text: '#1565C0' },
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
  { min: 0,   max: 10,  msg: "Start writing — even a few words help 💬" },
  { min: 10,  max: 30,  msg: "Good start! Keep going 🌱" },
  { min: 30,  max: 60,  msg: "You're opening up — that takes courage 💚" },
  { min: 60,  max: 100, msg: "Great reflection! You're doing amazing 🌟" },
  { min: 100, max: 999, msg: "Deep dive! This is powerful journaling 🏆" },
];

const STEPS = ['Mood', 'Context', 'Write'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function wordCount(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function getEncouragement(count) {
  return WORD_ENCOURAGEMENTS.find(e => count >= e.min && count < e.max)?.msg ?? '';
}

function formatDate(iso) {
  const utcString = iso.endsWith('Z') ? iso : iso + 'Z';
  return new Date(utcString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Mood Trend Chart ──────────────────────────────────────────────────────────
function MoodTrendChart({ entries }) {
  const last7 = entries.slice(0, 7).reverse();
  if (last7.length < 2) return null;

  const W = 280, H = 80, PAD = 16;
  const xStep = (W - PAD * 2) / (last7.length - 1);
  const yScale = (rating) => PAD + ((5 - rating) / 4) * (H - PAD * 2);

  const points = last7.map((e, i) => ({
    x: PAD + i * xStep,
    y: yScale(e.mood_rating),
    rating: e.mood_rating,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <div className="jp-trend-wrap">
      <p className="jp-trend-label">Your mood this week</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="jp-trend-svg">
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[1,2,3,4,5].map(r => (
          <line key={r} x1={PAD} y1={yScale(r)} x2={W - PAD} y2={yScale(r)}
            stroke="#E8E8E8" strokeWidth="1" strokeDasharray="3,3" />
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#moodGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#2E7D32" />
            <circle cx={p.x} cy={p.y} r="2.5" fill="white" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="#616161">
              {MOOD_EMOJIS[p.rating]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Entry Card ────────────────────────────────────────────────────────────────
function EntryCard({ entry, onDelete }) {
  const [expanded,   setExpanded]   = useState(false);
  const [confirming, setConfirming] = useState(false);
  const colors = MOOD_COLORS[entry.mood_rating];

  return (
    <div className="jp-entry-card" style={{ '--entry-accent': colors.accent, '--entry-bg': colors.bg }}>
      {/* Header — always visible */}
      <div className="jp-entry-header" onClick={() => setExpanded(v => !v)}>
        <div className="jp-entry-mood-dot" style={{ background: colors.accent }}>
          <span className="jp-entry-emoji">{MOOD_EMOJIS[entry.mood_rating]}</span>
        </div>
        <div className="jp-entry-meta-col">
          <span className="jp-entry-mood-label" style={{ color: colors.text }}>
            {MOOD_LABELS[entry.mood_rating]}
          </span>
          <span className="jp-entry-date">{formatDate(entry.created_at)}</span>
        </div>
        <span className="jp-entry-preview">
          {!expanded && entry.entry_text.slice(0, 60)}{!expanded && entry.entry_text.length > 60 && '…'}
        </span>
        <button className="jp-expand-btn" aria-label={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="jp-entry-body">
          <p className="jp-entry-text">{entry.entry_text}</p>
          <div className="jp-entry-extras">
            {entry.trigger_note    && <div className="jp-extra-chip"><span>⚡</span> {entry.trigger_note}</div>}
            {entry.gratitude_note  && <div className="jp-extra-chip"><span>🙏</span> {entry.gratitude_note}</div>}
            {entry.reflection_note && <div className="jp-extra-chip"><span>💡</span> {entry.reflection_note}</div>}
          </div>
          <div className="jp-entry-actions">
            {confirming ? (
              <div className="jp-confirm-row">
                <span className="jp-confirm-text">Delete this entry?</span>
                <button className="jp-action-btn jp-action-btn--danger" onClick={() => onDelete(entry.id)}>Yes, delete</button>
                <button className="jp-action-btn" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            ) : (
              <button className="jp-action-btn jp-action-btn--danger" onClick={() => setConfirming(true)}>
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
          <div className={`jp-step ${i < current ? 'jp-step--done' : ''} ${i === current ? 'jp-step--active' : ''}`}>
            <div className="jp-step-circle">{i < current ? '✓' : i + 1}</div>
            <span className="jp-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`jp-step-line${i < current ? ' jp-step-line--done' : ''}`} />
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
        .from('mood_journal')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (data) setMyEntries(data);
    }
    fetchEntries();
  }, [currentUser?.id]);

  const [step,           setStep]           = useState(0);
  const [moodRating,     setMoodRating]     = useState(3);
  const [triggerNote,    setTriggerNote]    = useState('');
  const [gratitudeNote,  setGratitudeNote]  = useState('');
  const [reflectionNote, setReflectionNote] = useState('');
  const [entryText,      setEntryText]      = useState('');
  const [submitted,      setSubmitted]      = useState(false);
  const [promptIdx,      setPromptIdx]      = useState(() => Math.floor(Math.random() * WRITING_PROMPTS.length));
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
      .from('mood_journal')
      .insert({
        user_id:         currentUser.id,
        mood_rating:     moodRating,
        trigger_note:    triggerNote.trim(),
        gratitude_note:  gratitudeNote.trim(),
        reflection_note: reflectionNote.trim(),
        entry_text:      entryText.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setMyEntries(prev => [data, ...prev]);
      setStep(0);
      setMoodRating(3);
      setTriggerNote('');
      setGratitudeNote('');
      setReflectionNote('');
      setEntryText('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('mood_journal')
      .delete()
      .eq('id', id);
    if (!error) setMyEntries(prev => prev.filter(e => e.id !== id));
  };

  const shufflePrompt = () =>
    setPromptIdx(i => (i + 1) % WRITING_PROMPTS.length);

  return (
    <PageShell heading=" Mood Journal" sub="Externalize your feelings — write it out." narrow>

      {/* ── Success toast ────────────────────────────────────────────────── */}
      {submitted && (
        <div className="jp-toast">
          Entry saved! Keep reflecting — you're doing great.
        </div>
      )}

      {/* ── Multi-step form card ─────────────────────────────────────────── */}
      <div
        className="jp-form-card"
        style={{ '--mood-bg': moodColors.bg, '--mood-accent': moodColors.accent, '--mood-text': moodColors.text }}
      >
        <StepIndicator current={step} />

        {/* ── Step 0: Mood picker ────────────────────────────────────────── */}
        {step === 0 && (
          <div className="jp-step-content jp-step-content--mood">
            <h3 className="jp-step-heading">How are you feeling right now?</h3>
            <div className="jp-mood-row">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  className={`jp-mood-btn${moodRating === rating ? ' jp-mood-btn--active' : ''}`}
                  onClick={() => setMoodRating(rating)}
                  style={moodRating === rating ? {
                    background: MOOD_COLORS[rating].bg,
                    borderColor: MOOD_COLORS[rating].accent,
                    boxShadow: `0 4px 16px ${MOOD_COLORS[rating].accent}66`,
                  } : {}}
                >
                  <span className="jp-mood-emoji">{MOOD_EMOJIS[rating]}</span>
                  <span className="jp-mood-label">{MOOD_LABELS[rating]}</span>
                </button>
              ))}
            </div>

            {/* Mood color bar */}
            <div className="jp-mood-bar" style={{ background: moodColors.accent }}>
              <span style={{ color: moodColors.text }}>
                {MOOD_EMOJIS[moodRating]} Feeling {MOOD_LABELS[moodRating].toLowerCase()} today
              </span>
            </div>

            <button className="jp-next-btn" onClick={() => setStep(1)}
              style={{ background: moodColors.text }}>
              Next: Add context →
            </button>
          </div>
        )}

        {/* ── Step 1: Context ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="jp-step-content">
            <h3 className="jp-step-heading">What's behind this feeling?
              <span className="jp-step-sub"> (all optional)</span>
            </h3>

            <div className="jp-context-fields">
              <div className="jp-context-field">
                <label className="jp-field-label">⚡ What triggered this mood?</label>
                <input
                  className="jp-input"
                  value={triggerNote}
                  onChange={e => setTriggerNote(e.target.value)}
                  placeholder="e.g., Stressful exam, argument with a friend…"
                />
              </div>
              <div className="jp-context-field">
                <label className="jp-field-label">🙏 What are you grateful for?</label>
                <input
                  className="jp-input"
                  value={gratitudeNote}
                  onChange={e => setGratitudeNote(e.target.value)}
                  placeholder="e.g., My supportive friends, a good meal…"
                />
              </div>
              <div className="jp-context-field">
                <label className="jp-field-label">💡 One thing you'd do differently?</label>
                <input
                  className="jp-input"
                  value={reflectionNote}
                  onChange={e => setReflectionNote(e.target.value)}
                  placeholder="e.g., Take a break earlier, ask for help sooner…"
                />
              </div>
            </div>

            <div className="jp-step-nav">
              <button className="jp-back-btn" onClick={() => setStep(0)}>← Back</button>
              <button className="jp-next-btn" onClick={() => setStep(2)}
                style={{ background: moodColors.text }}>
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
            <div className="jp-prompt-chip" onClick={shufflePrompt} title="Click for a new prompt">
              <span className="jp-prompt-icon">💬</span>
              <span className="jp-prompt-text">{WRITING_PROMPTS[promptIdx]}</span>
              <span className="jp-prompt-shuffle">↻</span>
            </div>

            <textarea
              ref={textareaRef}
              className="jp-textarea"
              rows={6}
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
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
                  background: wc >= 100 ? '#2E7D32' : moodColors.accent,
                }}
              />
            </div>

            <div className="jp-step-nav">
              <button className="jp-back-btn" onClick={() => setStep(1)}>← Back</button>
              <button
                className="jp-submit-btn"
                onClick={handleSubmit}
                disabled={!entryText.trim()}
                style={{ background: entryText.trim() ? moodColors.text : undefined }}
              >
                Save Entry ✓
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
          {myEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}

    </PageShell>
  );
}