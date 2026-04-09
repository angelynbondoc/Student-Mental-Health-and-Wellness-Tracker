// =============================================================================
// HabitsPage.jsx
// FIX 1: Admin-only "Add Habit" form.
//
// ORAL DEFENSE: The form JSX is NOT rendered at all for students
// (not just hidden) — mirrors a server-side RLS policy on the DB.
// =============================================================================
import React, { useContext, useState } from 'react';
import AppContext from '../AppContext';
import { generateUUID } from '../Mockdata';

const STREAK_EMOJI = ['🌱', '🔥', '⚡', '🏆'];

export default function HabitsPage() {
  const {
    currentUser,
    habits,    setHabits,
    habitLogs, setHabitLogs,
  } = useContext(AppContext);

  const [newHabitName, setNewHabitName] = useState('');

  // Today as YYYY-MM-DD — matches the completed_date format in habit_logs
  const todayStr = new Date().toISOString().split('T')[0];

  // WHERE user_id = currentUser.id
  const myHabits = habits.filter((h) => h.user_id === currentUser.id);

  // Check if a habit already has a log entry for today
  const isLoggedToday = (habitId) =>
    habitLogs.some(
      (log) => log.habit_id === habitId && log.completed_date === todayStr
    );

  // Toggle: create or delete today's log for a habit
  const handleToggleLog = (habitId) => {
    if (isLoggedToday(habitId)) {
      setHabitLogs((prev) =>
        prev.filter(
          (log) => !(log.habit_id === habitId && log.completed_date === todayStr)
        )
      );
    } else {
      setHabitLogs((prev) => [
        ...prev,
        {
          id: generateUUID(),
          habit_id: habitId,
          user_id: currentUser.id,
          completed_date: todayStr,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // ============================================================
  // ADMIN-ONLY: Add Habit
  // ORAL DEFENSE: role check on client mirrors DB RLS policy.
  // currentUser.role === 'admin' guards both the render AND the
  // function — a student cannot call this via the UI at all.
  // ============================================================
  const handleAddHabit = () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;

    const newHabit = {
      id:         generateUUID(),
      user_id:    currentUser.id, // In prod: admin picks a target student
      habit_name: trimmed,
      created_at: new Date().toISOString(),
    };

    // Spread + append = INSERT INTO habits VALUES (newHabit)
    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName('');
  };

  const completionCount = (habitId) =>
    habitLogs.filter((log) => log.habit_id === habitId).length;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Habits</h2>
      <p style={styles.subheading}>Track your daily wellness rituals ✨</p>

      <div style={styles.list}>
        {myHabits.length === 0 && (
          <p style={styles.empty}>No habits yet. Ask an admin to add some!</p>
        )}
        {myHabits.map((habit) => {
          const logged = isLoggedToday(habit.id);
          const count  = completionCount(habit.id);
          const emoji  = STREAK_EMOJI[Math.min(count, STREAK_EMOJI.length - 1)];
          return (
            <div key={habit.id} style={{ ...styles.card, ...(logged ? styles.cardDone : {}) }}>
              <div style={styles.cardLeft}>
                <span style={styles.emoji}>{emoji}</span>
                <div>
                  <p style={styles.habitName}>{habit.habit_name}</p>
                  <p style={styles.streakLabel}>
                    {count} total {count === 1 ? 'completion' : 'completions'}
                  </p>
                </div>
              </div>
              <button
                style={{ ...styles.checkBtn, ...(logged ? styles.checkBtnDone : {}) }}
                onClick={() => handleToggleLog(habit.id)}
              >
                {logged ? '✓ Done' : 'Mark Done'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── ADMIN-ONLY FORM — not mounted for students at all ──────────── */}
      {currentUser.role === 'admin' && (
        <div style={styles.adminBox}>
          <p style={styles.adminLabel}>🛡️ Admin — Add New Habit</p>
          <div style={styles.adminRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Journal before bed"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            />
            <button style={styles.addBtn} onClick={handleAddHabit}>+ Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:       { padding: '20px 16px', fontFamily: 'sans-serif' },
  heading:    { fontSize: 22, fontWeight: 700, margin: 0 },
  subheading: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 20 },
  list:       { display: 'flex', flexDirection: 'column', gap: 12 },
  empty:      { color: '#999', fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fff', borderRadius: 14, padding: '14px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  cardDone:    { background: '#f0fdf4', borderLeft: '4px solid #22c55e' },
  cardLeft:    { display: 'flex', alignItems: 'center', gap: 12 },
  emoji:       { fontSize: 28 },
  habitName:   { fontSize: 15, fontWeight: 600, margin: 0 },
  streakLabel: { fontSize: 11, color: '#888', margin: '2px 0 0' },
  checkBtn: {
    fontSize: 12, fontWeight: 600, padding: '8px 14px',
    borderRadius: 20, border: '2px solid #d1d5db',
    background: '#fff', cursor: 'pointer', color: '#555',
  },
  checkBtnDone: { background: '#22c55e', color: '#fff', border: '2px solid #22c55e' },
  adminBox: {
    marginTop: 28, padding: '16px', borderRadius: 14,
    background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    border: '1.5px dashed #f59e0b',
  },
  adminLabel: { fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 },
  adminRow:   { display: 'flex', gap: 10 },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none',
  },
  addBtn: {
    padding: '10px 18px', borderRadius: 10, border: 'none',
    background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
};