// =============================================================================
// JournalPage.jsx — refactored
// Shared: PageShell, FormField, EmptyState, shared.css
// Own:    JournalPage.css (mood selector, entry cards)
//
// SECI: Externalization — converts tacit (felt) knowledge into explicit text.
// Each field maps 1-to-1 with a column in the mood_journal DB table.
// =============================================================================
import React, { useState, useContext } from 'react';
import AppContext from '../../AppContext';
import { generateUUID } from '../../mockData';
import { PageShell, FormField, EmptyState } from '../../components/ui';
import './JournalPage.css';

const MOOD_EMOJIS = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' };

export default function JournalPage() {
  const { moodJournal, setMoodJournal, currentUser } = useContext(AppContext);

  // Each state maps 1-to-1 with a column in mood_journal
  const [moodRating,     setMoodRating]     = useState(3);
  const [triggerNote,    setTriggerNote]    = useState('');
  const [gratitudeNote,  setGratitudeNote]  = useState('');
  const [reflectionNote, setReflectionNote] = useState('');
  const [entryText,      setEntryText]      = useState('');
  const [submitted,      setSubmitted]      = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    // INSERT INTO mood_journal (id, user_id, mood_rating, trigger_note, ...)
    const newEntry = {
      id:              generateUUID(),
      user_id:         currentUser.id,
      mood_rating:     moodRating,
      trigger_note:    triggerNote.trim(),
      gratitude_note:  gratitudeNote.trim(),
      reflection_note: reflectionNote.trim(),
      entry_text:      entryText.trim(),
      created_at:      new Date().toISOString(),
    };

    setMoodJournal((prev) => [newEntry, ...prev]);
    setMoodRating(3);
    setTriggerNote('');
    setGratitudeNote('');
    setReflectionNote('');
    setEntryText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  // SELECT * FROM mood_journal WHERE user_id = currentUser.id ORDER BY created_at DESC
  const myEntries = moodJournal
    .filter((e) => e.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <PageShell heading="📓 Mood Journal" sub="Externalize your feelings — write it out." narrow>

      {/* ── Journal form ──────────────────────────────────────────────────── */}
      <form className="form-card" style={{ marginBottom: 36 }} onSubmit={handleSubmit}>

        {/* Mood rating — visual 1-5 selector */}
        <label className="field-label">How are you feeling today?</label>
        <div className="jp-mood-row">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={`jp-mood-btn${moodRating === rating ? ' jp-mood-btn--active' : ''}`}
              onClick={() => setMoodRating(rating)}
            >
              <span className="jp-mood-emoji">{MOOD_EMOJIS[rating]}</span>
              <span className="jp-mood-label">{MOOD_LABELS[rating]}</span>
            </button>
          ))}
        </div>

        <FormField
          label="What triggered this mood? (optional)"
          value={triggerNote}
          onChange={(e) => setTriggerNote(e.target.value)}
          placeholder="e.g., Stressful exam, argument with friend..."
        />

        <FormField
          label="What are you grateful for today? (optional)"
          value={gratitudeNote}
          onChange={(e) => setGratitudeNote(e.target.value)}
          placeholder="e.g., My supportive friends, a good meal..."
        />

        <FormField
          label="One thing you'd do differently? (optional)"
          value={reflectionNote}
          onChange={(e) => setReflectionNote(e.target.value)}
          placeholder="e.g., Take a break earlier, ask for help sooner..."
        />

        <FormField
          label="Your journal entry"
          as="textarea"
          required
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write freely about your day, your thoughts, how you're coping..."
          rows={4}
        />

        {submitted && <div className="notice--green">✅ Entry saved! Keep it up.</div>}

        <button type="submit" className="btn-submit">Save Journal Entry</button>
      </form>

      {/* ── Past entries ──────────────────────────────────────────────────── */}
      <h3 className="jp-past-heading">Past Entries ({myEntries.length})</h3>

      {myEntries.length === 0 ? (
        <EmptyState message="No entries yet. Write your first one above!" />
      ) : (
        myEntries.map((entry) => (
          <div key={entry.id} className="content-card" style={{ marginBottom: 12 }}>
            <div className="jp-entry-header">
              <span className="jp-entry-emoji">{MOOD_EMOJIS[entry.mood_rating]}</span>
              <span className="jp-entry-mood">{MOOD_LABELS[entry.mood_rating]}</span>
              <span className="jp-entry-date">
                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="jp-entry-text">{entry.entry_text}</p>
            {entry.trigger_note    && <p className="jp-entry-meta"><span className="jp-meta-label">⚡ Trigger:</span> {entry.trigger_note}</p>}
            {entry.gratitude_note  && <p className="jp-entry-meta"><span className="jp-meta-label">🙏 Gratitude:</span> {entry.gratitude_note}</p>}
            {entry.reflection_note && <p className="jp-entry-meta"><span className="jp-meta-label">💡 Reflection:</span> {entry.reflection_note}</p>}
          </div>
        ))
      )}

    </PageShell>
  );
}