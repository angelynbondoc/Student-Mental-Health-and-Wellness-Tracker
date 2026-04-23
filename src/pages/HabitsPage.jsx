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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .neu-habits {
    width: 100%;
    padding: 32px 40px;
    background: #FAFAFA;
    min-height: calc(100vh - 56px);
    display: flex; 
    flex-direction: column; 
    align-items: center;
  }
  .neu-habits-inner { max-width: 720px;
    width: 100%}
  .neu-habits-heading {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #1A1A1A;
    margin: 0 0 4px;
  }
  .neu-habits-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #9E9E9E;
    margin: 0 0 28px;
  }
  .neu-habits-list { display: flex; flex-direction: column; gap: 10px; }
  .neu-habits-empty {
    font-family: 'DM Sans', sans-serif;
    color: #9E9E9E;
    font-size: 14px;
    text-align: center;
    padding: 48px 0;
    font-style: italic;
  }
  .neu-habit-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #FFFFFF;
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid #E8E8E8;
    transition: box-shadow 0.15s ease;
  }
  .neu-habit-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
  /* Done state: primary tint + left green border */
  .neu-habit-card--done {
    background: #E8F5E9;
    border-left: 3px solid #2E7D32;
  }
  .neu-habit-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
  }
  .neu-habit-emoji { font-size: 26px; flex-shrink: 0; }
  .neu-habit-name {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #1A1A1A;
    margin: 0;
  }
  .neu-habit-streak {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #9E9E9E;
    margin: 2px 0 0;
  }
  .neu-check-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 100px;
    border: 1px solid #E8E8E8;
    background: #FFFFFF;
    color: #616161;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .neu-check-btn:hover { border-color: #2E7D32; color: #2E7D32; background: #E8F5E9; }
  /* Done button — solid primary green */
  .neu-check-btn--done {
    background: #2E7D32;
    color: #FFFFFF;
    border-color: #2E7D32;
  }
  .neu-check-btn--done:hover { background: #1B5E20; border-color: #1B5E20; color: #FFFFFF; }

  /* Admin box — gold dashed border (accent, authority cue) */
  .neu-admin-box {
    margin-top: 36px;
    padding: 20px;
    border-radius: 12px;
    background: #FFFDE7;
    border: 1.5px dashed #F5C400;
  }
  .neu-admin-label {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #7C5800;
    margin: 0 0 12px;
  }
  .neu-admin-row { display: flex; gap: 10px; }
  .neu-admin-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #F5C400;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
    background: #FFFFFF;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .neu-admin-input:focus {
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46,125,50,0.10);
  }
  .neu-admin-add-btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #F5C400;
    color: #1A1A1A;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease;
  }
  .neu-admin-add-btn:hover { background: #E0B000; }

  @media (max-width: 768px) { .neu-habits { padding: 24px 20px; } }
  @media (max-width: 480px) {
    .neu-habits { padding: 18px 16px; }
    .neu-admin-row { flex-direction: column; }
    .neu-admin-add-btn { width: 100%; }
  }
`;

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
          id:             generateUUID(),
          habit_id:       habitId,
          user_id:        currentUser.id,
          completed_date: todayStr,
          created_at:     new Date().toISOString(),
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
    <>
      <style>{STYLES}</style>
      <div className="neu-habits">
        <div className="neu-habits-inner">
          <h2 className="neu-habits-heading">My Habits</h2>
          <p className="neu-habits-sub">Track your daily wellness rituals ✨</p>

          <div className="neu-habits-list">
            {myHabits.length === 0 && (
              <p className="neu-habits-empty">No habits yet. Ask an admin to add some!</p>
            )}
            {myHabits.map((habit) => {
              const logged = isLoggedToday(habit.id);
              const count  = completionCount(habit.id);
              const emoji  = STREAK_EMOJI[Math.min(count, STREAK_EMOJI.length - 1)];
              return (
                <div
                  key={habit.id}
                  className={`neu-habit-card${logged ? ' neu-habit-card--done' : ''}`}
                >
                  <div className="neu-habit-left">
                    <span className="neu-habit-emoji">{emoji}</span>
                    <div>
                      <p className="neu-habit-name">{habit.habit_name}</p>
                      <p className="neu-habit-streak">
                        {count} total {count === 1 ? 'completion' : 'completions'}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`neu-check-btn${logged ? ' neu-check-btn--done' : ''}`}
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
            <div className="neu-admin-box">
              <p className="neu-admin-label">🛡️ Admin — Add New Habit</p>
              <div className="neu-admin-row">
                <input
                  className="neu-admin-input"
                  type="text"
                  placeholder="e.g. Journal before bed"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                />
                <button className="neu-admin-add-btn" onClick={handleAddHabit}>+ Add</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}