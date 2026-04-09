// =============================================================================
// JournalPage.jsx — Feature 5: Mood Journal (SECI: Externalization)
//
// SECI CONNECTION: "Externalization" means converting tacit (internal, felt)
// knowledge into explicit, written form. This journal does exactly that —
// it guides students to put their unspoken feelings into structured text.
//
// FORM FIELDS map directly to the mood_journal DB schema:
//   mood_rating, trigger_note, gratitude_note, reflection_note, entry_text
// =============================================================================
import React, { useState, useContext } from 'react';
import AppContext from '../AppContext';
import { generateUUID } from '../mockData';

// Emoji map for mood ratings — makes the number scale more intuitive
const MOOD_EMOJIS = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' };

function JournalPage() {
  const { moodJournal, setMoodJournal, currentUser } = useContext(AppContext);

  // ── CONTROLLED FORM STATE ──────────────────────────────────────────────────
  // Each field maps 1-to-1 with a column in the mood_journal table.
  const [moodRating,      setMoodRating]      = useState(3);   // Default to neutral
  const [triggerNote,     setTriggerNote]     = useState('');
  const [gratitudeNote,   setGratitudeNote]   = useState('');
  const [reflectionNote,  setReflectionNote]  = useState('');
  const [entryText,       setEntryText]       = useState('');
  const [submitted,       setSubmitted]       = useState(false); // Success feedback flag

  // ── HANDLE SUBMIT ──────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    // Build the new journal entry matching the mood_journal schema exactly
    const newEntry = {
      id:               generateUUID(),          // schema: id UUID
      user_id:          currentUser.id,          // schema: user_id UUID (FK to profiles)
      mood_rating:      moodRating,              // schema: mood_rating Int (1-5)
      trigger_note:     triggerNote.trim(),      // schema: trigger_note Text
      gratitude_note:   gratitudeNote.trim(),    // schema: gratitude_note Text
      reflection_note:  reflectionNote.trim(),   // schema: reflection_note Text
      entry_text:       entryText.trim(),        // schema: entry_text Text
      created_at:       new Date().toISOString(),// schema: created_at Timestamp
    };

    // Prepend so the newest entry appears first in the list
    setMoodJournal((prev) => [newEntry, ...prev]);

    // Reset form to defaults
    setMoodRating(3);
    setTriggerNote('');
    setGratitudeNote('');
    setReflectionNote('');
    setEntryText('');

    // Show a brief success message
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  // ── FILTER: only show THIS user's journal entries ──────────────────────────
  // Equivalent SQL: SELECT * FROM mood_journal WHERE user_id = currentUser.id
  const myEntries = moodJournal
    .filter((entry) => entry.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

  return (
    <div>
      <h2 style={styles.pageTitle}>📓 Mood Journal</h2>
      <p style={styles.subtitle}>Externalize your feelings — write it out.</p>

      {/* ── JOURNAL FORM ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={styles.form}>

        {/* MOOD RATING — visual 1-5 selector */}
        <label style={styles.label}>How are you feeling today?</label>
        <div style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"                       // Prevent form submission on click
              onClick={() => setMoodRating(rating)}
              style={{
                ...styles.moodBtn,
                // Highlight the selected rating
                backgroundColor: moodRating === rating ? '#e8f4e8' : '#f5f5f5',
                border: moodRating === rating ? '2px solid #2c7a4b' : '2px solid transparent',
                transform: moodRating === rating ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: '22px' }}>{MOOD_EMOJIS[rating]}</span>
              <span style={{ fontSize: '10px', color: '#666' }}>{MOOD_LABELS[rating]}</span>
            </button>
          ))}
        </div>

        {/* TRIGGER NOTE */}
        <label style={styles.label}>What triggered this mood? (optional)</label>
        <input
          type="text"
          value={triggerNote}
          onChange={(e) => setTriggerNote(e.target.value)}
          placeholder="e.g., Stressful exam, argument with friend..."
          style={styles.input}
        />

        {/* GRATITUDE NOTE */}
        <label style={styles.label}>What are you grateful for today? (optional)</label>
        <input
          type="text"
          value={gratitudeNote}
          onChange={(e) => setGratitudeNote(e.target.value)}
          placeholder="e.g., My supportive friends, a good meal..."
          style={styles.input}
        />

        {/* REFLECTION NOTE */}
        <label style={styles.label}>One thing you'd do differently? (optional)</label>
        <input
          type="text"
          value={reflectionNote}
          onChange={(e) => setReflectionNote(e.target.value)}
          placeholder="e.g., Take a break earlier, ask for help sooner..."
          style={styles.input}
        />

        {/* MAIN ENTRY TEXT — required */}
        <label style={styles.label}>Your journal entry <span style={{ color: '#c0392b' }}>*</span></label>
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write freely about your day, your thoughts, how you're coping..."
          rows={4}
          style={styles.textarea}
          required
        />

        {submitted && (
          <div style={styles.successBanner}>
            ✅ Entry saved! Keep it up.
          </div>
        )}

        <button type="submit" style={styles.submitBtn}>
          Save Journal Entry
        </button>
      </form>

      {/* ── PAST ENTRIES LIST ─────────────────────────────────────────────── */}
      <div style={styles.pastEntriesSection}>
        <h3 style={styles.sectionTitle}>Past Entries ({myEntries.length})</h3>

        {myEntries.length === 0 ? (
          <p style={styles.emptyMsg}>No entries yet. Write your first one above!</p>
        ) : (
          myEntries.map((entry) => (
            <div key={entry.id} style={styles.entryCard}>
              {/* Header row: emoji + mood label + date */}
              <div style={styles.entryHeader}>
                <span style={styles.entryMoodEmoji}>{MOOD_EMOJIS[entry.mood_rating]}</span>
                <span style={styles.entryMoodLabel}>{MOOD_LABELS[entry.mood_rating]}</span>
                <span style={styles.entryDate}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>

              {/* Main entry text — always shown */}
              <p style={styles.entryText}>{entry.entry_text}</p>

              {/* Optional fields — only render if the user filled them in */}
              {entry.trigger_note && (
                <div style={styles.entryMeta}>
                  <span style={styles.metaLabel}>⚡ Trigger:</span> {entry.trigger_note}
                </div>
              )}
              {entry.gratitude_note && (
                <div style={styles.entryMeta}>
                  <span style={styles.metaLabel}>🙏 Gratitude:</span> {entry.gratitude_note}
                </div>
              )}
              {entry.reflection_note && (
                <div style={styles.entryMeta}>
                  <span style={styles.metaLabel}>💡 Reflection:</span> {entry.reflection_note}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: '18px', fontWeight: 'bold', color: '#2c7a4b', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#888', marginBottom: '16px' },
  form: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #eee' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#444', display: 'block', marginBottom: '6px', marginTop: '10px' },
  moodRow: { display: 'flex', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' },
  moodBtn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 4px', borderRadius: '10px', cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '13px', outline: 'none',
    resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box',
  },
  successBanner: {
    backgroundColor: '#e8f4e8', color: '#2c7a4b', borderRadius: '8px',
    padding: '10px', fontSize: '13px', textAlign: 'center', marginTop: '8px',
  },
  submitBtn: {
    width: '100%', padding: '12px', backgroundColor: '#2c7a4b', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '14px',
  },
  pastEntriesSection: { marginTop: '8px' },
  sectionTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '10px' },
  emptyMsg: { color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '20px 0' },
  entryCard: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '12px',
    marginBottom: '10px', border: '1px solid #eee',
  },
  entryHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  entryMoodEmoji: { fontSize: '20px' },
  entryMoodLabel: { fontSize: '13px', fontWeight: 'bold', color: '#333', flex: 1 },
  entryDate: { fontSize: '11px', color: '#aaa' },
  entryText: { fontSize: '13px', color: '#555', lineHeight: '1.5', marginBottom: '6px' },
  entryMeta: { fontSize: '12px', color: '#666', marginTop: '4px' },
  metaLabel: { fontWeight: 'bold', color: '#444' },
};

export default JournalPage;