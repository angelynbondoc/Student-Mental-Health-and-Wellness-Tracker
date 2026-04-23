// =============================================================================
// HabitsPage.jsx — refactored
// Shared: PageShell, EmptyState, shared.css (content-card, btn-pill, field-input)
// Own:    HabitsPage.css (habit-specific layout), habit toggle logic
//
// ORAL DEFENSE: Admin form is NOT rendered for students — mirrors DB RLS.
// =============================================================================
import React, { useContext, useState } from "react";
import AppContext from "../../AppContext";
import { generateUUID } from "../../Mockdata";
import { PageShell, EmptyState } from "../../components/ui";
import "./HabitsPage.css";

const STREAK_EMOJI = ["🌱", "🔥", "⚡", "🏆"];

export default function HabitsPage() {
  const { currentUser, habits, setHabits, habitLogs, setHabitLogs } =
    useContext(AppContext);
  const [newHabitName, setNewHabitName] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const myHabits = habits.filter((h) => h.user_id === currentUser.id);

  const isLoggedToday = (habitId) =>
    habitLogs.some(
      (log) => log.habit_id === habitId && log.completed_date === todayStr,
    );

  const handleToggleLog = (habitId) => {
    if (isLoggedToday(habitId)) {
      // DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?
      setHabitLogs((prev) =>
        prev.filter(
          (log) =>
            !(log.habit_id === habitId && log.completed_date === todayStr),
        ),
      );
    } else {
      // INSERT INTO habit_logs (id, habit_id, user_id, completed_date, created_at)
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

  // ORAL DEFENSE: role check on client mirrors DB RLS policy.
  const handleAddHabit = () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    // INSERT INTO habits (id, user_id, habit_name, created_at)
    setHabits((prev) => [
      ...prev,
      {
        id: generateUUID(),
        user_id: currentUser.id,
        habit_name: trimmed,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewHabitName("");
  };

  const completionCount = (habitId) =>
    habitLogs.filter((log) => log.habit_id === habitId).length;

  return (
    <PageShell heading="My Habits" sub="Track your daily wellness rituals ✨">
      <div className="hp-list">
        {myHabits.length === 0 ? (
          <EmptyState message="No habits yet. Ask an admin to add some!" />
        ) : (
          myHabits.map((habit) => {
            const logged = isLoggedToday(habit.id);
            const count = completionCount(habit.id);
            const emoji =
              STREAK_EMOJI[Math.min(count, STREAK_EMOJI.length - 1)];
            return (
              <div
                key={habit.id}
                className={`content-card hp-card${logged ? " content-card--active" : ""}`}
              >
                <div className="hp-left">
                  <span className="hp-emoji">{emoji}</span>
                  <div>
                    <p className="hp-name">{habit.habit_name}</p>
                    <p className="hp-streak">
                      {count} total {count === 1 ? "completion" : "completions"}
                    </p>
                  </div>
                </div>
                <button
                  className={`btn-pill${logged ? " btn-pill--active" : ""}`}
                  onClick={() => handleToggleLog(habit.id)}
                >
                  {logged ? "✓ Done" : "Mark Done"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ADMIN-ONLY FORM — not mounted for students at all */}
      {currentUser.role === "admin" && (
        <div className="hp-admin-box">
          <p className="hp-admin-label">🛡️ Admin — Add New Habit</p>
          <div className="hp-admin-row">
            <input
              className="field-input"
              type="text"
              placeholder="e.g. Journal before bed"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            />
            <button className="hp-admin-btn" onClick={handleAddHabit}>
              + Add
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
