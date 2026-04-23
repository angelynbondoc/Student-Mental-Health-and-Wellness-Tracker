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
import React, { useState, useContext } from "react";
import AppContext from "../AppContext";
import { generateUUID } from "../mockData";

// Emoji map for mood ratings — makes the number scale more intuitive
const MOOD_EMOJIS = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
const MOOD_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Great",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-journal {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
     display: flex;              /* ← add these 3 lines */
  flex-direction: column;
  align-items: center;
  }
  .neu-journal-inner { max-width: 680px;
  width: 100%; }
  .neu-journal-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 22px; font-weight: 600;
    color: #2E7D32; margin: 0 0 4px;
  }
  .neu-journal-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #9E9E9E; margin: 0 0 24px;
  }
  .neu-journal-form {
    background: #FFFFFF;
    border-radius: 14px;
    padding: 28px;
    border: 1px solid #E8E8E8;
    margin-bottom: 36px;
  }
  .neu-jlabel {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500;
    color: #9E9E9E; letter-spacing: 0.06em;
    text-transform: uppercase; display: block;
    margin: 18px 0 8px;
  }
  .neu-jlabel:first-of-type { margin-top: 0; }
  .neu-jlabel .req { color: #C62828; }

  /* Mood selector */
  .neu-mood-row { display: flex; gap: 8px; }
  .neu-mood-btn {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 5px;
    padding: 10px 4px; border-radius: 10px;
    border: 1.5px solid transparent;
    background: #F2F2F2;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .neu-mood-btn:hover { background: #E8F5E9; border-color: #2E7D32; }
  /* Active mood: green tint + gold border accent */
  .neu-mood-btn--active {
    background: #E8F5E9;
    border-color: #F5C400;
    box-shadow: 0 2px 8px rgba(46,125,50,0.16);
    transform: scale(1.06);
  }
  .neu-mood-emoji { font-size: 22px; line-height: 1; }
  .neu-mood-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; color: #9E9E9E; text-align: center;
  }
  .neu-mood-btn--active .neu-mood-label { color: #2E7D32; font-weight: 600; }

  /* Text inputs */
  .neu-jinput, .neu-jtextarea {
    width: 100%; padding: 11px 14px;
    border-radius: 8px; border: 1px solid #E8E8E8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #1A1A1A;
    background: #F2F2F2; outline: none;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .neu-jinput:focus, .neu-jtextarea:focus {
    border-color: #2E7D32; background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(46,125,50,0.10);
  }
  .neu-jtextarea { resize: vertical; min-height: 110px; line-height: 1.6; }

  /* Success banner */
  .neu-success-banner {
    background: #E8F5E9; border-left: 3px solid #2E7D32;
    color: #2E7D32; border-radius: 8px;
    padding: 10px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; margin-top: 14px;
  }
  /* Submit button */
  .neu-jsubmit {
    width: 100%; padding: 13px;
    background: #2E7D32; color: #FFFFFF;
    border: none; border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 20px;
    transition: background 0.15s ease, transform 0.12s ease;
  }
  .neu-jsubmit:hover { background: #1B5E20; transform: translateY(-1px); }
  .neu-jsubmit:active { transform: translateY(0); }

  /* Past entries */
  .neu-past-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 16px; font-weight: 600;
    color: #1A1A1A; margin: 0 0 16px;
  }
  .neu-past-empty {
    font-family: 'DM Sans', sans-serif;
    color: #9E9E9E; font-size: 13px;
    text-align: center; padding: 24px 0; font-style: italic;
  }
  .neu-entry-card {
    background: #FFFFFF; border-radius: 12px;
    padding: 16px 18px; margin-bottom: 12px;
    border: 1px solid #E8E8E8;
    transition: box-shadow 0.15s ease;
  }
  .neu-entry-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.06); }
  .neu-entry-header {
    display: flex; align-items: center;
    gap: 8px; margin-bottom: 10px;
  }
  .neu-entry-emoji { font-size: 20px; }
  .neu-entry-mood  {
    font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #1A1A1A; flex: 1;
  }
  .neu-entry-date  {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: #9E9E9E;
  }
  .neu-entry-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #374151;
    line-height: 1.65; margin: 0 0 8px;
  }
  .neu-entry-meta {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: #9E9E9E; margin: 4px 0 0;
  }
  .neu-meta-label { font-weight: 600; color: #616161; }

  @media (max-width: 768px) { .neu-journal { padding: 24px 20px; } .neu-mood-row { gap: 6px; } }
  @media (max-width: 480px) { .neu-journal { padding: 18px 16px; } .neu-journal-form { padding: 20px 16px; } .neu-mood-emoji { font-size: 20px; } .neu-mood-label { font-size: 9px; } }
`;

function JournalPage() {
  const { moodJournal, setMoodJournal, currentUser } = useContext(AppContext);

  // ── CONTROLLED FORM STATE ──────────────────────────────────────────────────
  // Each field maps 1-to-1 with a column in the mood_journal table.
  const [moodRating, setMoodRating] = useState(3); // Default to neutral
  const [triggerNote, setTriggerNote] = useState("");
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [reflectionNote, setReflectionNote] = useState("");
  const [entryText, setEntryText] = useState("");
  const [submitted, setSubmitted] = useState(false); // Success feedback flag

  // ── HANDLE SUBMIT ──────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    // Build the new journal entry matching the mood_journal schema exactly
    const newEntry = {
      id: generateUUID(), // schema: id UUID
      user_id: currentUser.id, // schema: user_id UUID (FK to profiles)
      mood_rating: moodRating, // schema: mood_rating Int (1-5)
      trigger_note: triggerNote.trim(), // schema: trigger_note Text
      gratitude_note: gratitudeNote.trim(), // schema: gratitude_note Text
      reflection_note: reflectionNote.trim(), // schema: reflection_note Text
      entry_text: entryText.trim(), // schema: entry_text Text
      created_at: new Date().toISOString(), // schema: created_at Timestamp
    };

    // Prepend so the newest entry appears first in the list
    setMoodJournal((prev) => [newEntry, ...prev]);

    // Reset form to defaults
    setMoodRating(3);
    setTriggerNote("");
    setGratitudeNote("");
    setReflectionNote("");
    setEntryText("");

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
    <>
      <style>{STYLES}</style>
      <div className="neu-journal">
        <div className="neu-journal-inner">
          <h2 className="neu-journal-heading">📓 Mood Journal</h2>
          <p className="neu-journal-sub">
            Externalize your feelings — write it out.
          </p>

          {/* ── JOURNAL FORM ──────────────────────────────────────────────────── */}
          <form className="neu-journal-form" onSubmit={handleSubmit}>
            {/* MOOD RATING — visual 1-5 selector */}
            <label className="neu-jlabel">How are you feeling today?</label>
            <div className="neu-mood-row">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button" // Prevent form submission on click
                  onClick={() => setMoodRating(rating)}
                  className={`neu-mood-btn${moodRating === rating ? " neu-mood-btn--active" : ""}`}
                >
                  <span className="neu-mood-emoji">{MOOD_EMOJIS[rating]}</span>
                  <span className="neu-mood-label">{MOOD_LABELS[rating]}</span>
                </button>
              ))}
            </div>

            {/* TRIGGER NOTE */}
            <label className="neu-jlabel">
              What triggered this mood? (optional)
            </label>
            <input
              type="text"
              className="neu-jinput"
              value={triggerNote}
              onChange={(e) => setTriggerNote(e.target.value)}
              placeholder="e.g., Stressful exam, argument with friend..."
            />

            {/* GRATITUDE NOTE */}
            <label className="neu-jlabel">
              What are you grateful for today? (optional)
            </label>
            <input
              type="text"
              className="neu-jinput"
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="e.g., My supportive friends, a good meal..."
            />

            {/* REFLECTION NOTE */}
            <label className="neu-jlabel">
              One thing you'd do differently? (optional)
            </label>
            <input
              type="text"
              className="neu-jinput"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              placeholder="e.g., Take a break earlier, ask for help sooner..."
            />

            {/* MAIN ENTRY TEXT — required */}
            <label className="neu-jlabel">
              Your journal entry <span className="req">*</span>
            </label>
            <textarea
              className="neu-jtextarea"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write freely about your day, your thoughts, how you're coping..."
              rows={4}
              required
            />

            {submitted && (
              <div className="neu-success-banner">
                ✅ Entry saved! Keep it up.
              </div>
            )}

            <button type="submit" className="neu-jsubmit">
              Save Journal Entry
            </button>
          </form>

          {/* ── PAST ENTRIES LIST ─────────────────────────────────────────────── */}
          <h3 className="neu-past-heading">
            Past Entries ({myEntries.length})
          </h3>

          {myEntries.length === 0 ? (
            <p className="neu-past-empty">
              No entries yet. Write your first one above!
            </p>
          ) : (
            myEntries.map((entry) => (
              <div key={entry.id} className="neu-entry-card">
                {/* Header row: emoji + mood label + date */}
                <div className="neu-entry-header">
                  <span className="neu-entry-emoji">
                    {MOOD_EMOJIS[entry.mood_rating]}
                  </span>
                  <span className="neu-entry-mood">
                    {MOOD_LABELS[entry.mood_rating]}
                  </span>
                  <span className="neu-entry-date">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Main entry text — always shown */}
                <p className="neu-entry-text">{entry.entry_text}</p>

                {/* Optional fields — only render if the user filled them in */}
                {entry.trigger_note && (
                  <p className="neu-entry-meta">
                    <span className="neu-meta-label">⚡ Trigger:</span>{" "}
                    {entry.trigger_note}
                  </p>
                )}
                {entry.gratitude_note && (
                  <p className="neu-entry-meta">
                    <span className="neu-meta-label">🙏 Gratitude:</span>{" "}
                    {entry.gratitude_note}
                  </p>
                )}
                {entry.reflection_note && (
                  <p className="neu-entry-meta">
                    <span className="neu-meta-label">💡 Reflection:</span>{" "}
                    {entry.reflection_note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default JournalPage;
