import { useState, useEffect } from "react";
import JournalEntryCard from "../components/JournalEntryCard";
import { MOCK_JOURNAL_ENTRIES } from "../mockData";

// SECI — INTERNALIZATION: Users reflect on their own past entries.
function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntries(MOCK_JOURNAL_ENTRIES);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <p>⏳ Loading your journal...</p>;

  return (
    <div>
      <h2>📓 My Mood Journal</h2>
      <p style={{ color: "#888", fontSize: "13px" }}>
        Your private space for reflection and growth.
      </p>
      {entries.length === 0 ? (
        <p>No journal entries yet.</p>
      ) : (
        entries.map((entry) => <JournalEntryCard key={entry.id} entry={entry} />)
      )}
    </div>
  );
}

export default JournalPage;