// =============================================================================
// HabitsPage.jsx — enhanced with habit-specific tracking panels
//
// Habit-specific features:
//   "Drink 8 glasses of water"  → Water tracker (8 glass icons, blue/gray)
//   "Morning Meditation"        → Breathing animation with inhale/hold/exhale cycle
//   "30-min walk or exercise"   → Countdown timer with start/pause/reset
//
// All other habits retain the original Mark Done card UI.
// =============================================================================
import React, {
  useState,useContext
} from "react";
import AppContext from "../../AppContext";
import { generateUUID } from "../../Mockdata";
import { PageShell, EmptyState } from "../../components/ui";
import "./HabitsPage.css";
import { WalkTimer } from "./habits/WalkTimer";
import { WaterTracker } from "./habits/WaterTracker";
import {MeditationPanel} from "./habits/MorningMeditation";

const STREAK_EMOJI = ["🌱", "🔥", "⚡", "🏆"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function habitType(name = "") {
  const n = name.toLowerCase();
  if (n.includes("water") || n.includes("glass")) return "water";
  if (n.includes("meditat") || n.includes("meditation")) return "meditation";
  if (n.includes("walk") || n.includes("exercise") || n.includes("run"))
    return "walk";
  return "default";
}



// ── Default Habit Card ────────────────────────────────────────────────────────
function DefaultHabitCard({ habit, logged, onToggleLog, completionCount }) {
  const emoji =
    STREAK_EMOJI[Math.min(completionCount, STREAK_EMOJI.length - 1)];
  return (
    <div
      className={`content-card hp-card${logged ? " content-card--active" : ""}`}
    >
      <div className="hp-left">
        <span className="hp-emoji">{emoji}</span>
        <div>
          <p className="hp-name">{habit.habit_name}</p>
          <p className="hp-streak">
            {completionCount} total{" "}
            {completionCount === 1 ? "completion" : "completions"}
          </p>
        </div>
      </div>
      <button
        className={`btn-pill${logged ? " btn-pill--active" : ""}`}
        onClick={() => onToggleLog(habit.id)}
      >
        {logged ? "✓ Done" : "Mark Done"}
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      setHabitLogs((prev) =>
        prev.filter(
          (log) =>
            !(log.habit_id === habitId && log.completed_date === todayStr),
        ),
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

  const completionCount = (habitId) =>
    habitLogs.filter((log) => log.habit_id === habitId).length;

  const handleAddHabit = () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
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

  return (
    <PageShell heading="My Habits" sub="Track your daily wellness rituals ✨">
      <div className="hp-list">
        {myHabits.length === 0 ? (
          <EmptyState message="No habits yet. Ask an admin to add some!" />
        ) : (
          myHabits.map((habit) => {
            const type = habitType(habit.habit_name);
            const logged = isLoggedToday(habit.id);
            const count = completionCount(habit.id);

            if (type === "water")
              return (
                <WaterTracker
                  key={habit.id}
                  habitId={habit.id}
                  logged={logged}
                  onToggleLog={handleToggleLog}
                />
              );
            if (type === "meditation")
              return (
                <MeditationPanel
                  key={habit.id}
                  habitId={habit.id}
                  logged={logged}
                  onToggleLog={handleToggleLog}
                  completionCount={count}
                />
              );
            if (type === "walk")
              return (
                <WalkTimer
                  key={habit.id}
                  habitId={habit.id}
                  logged={logged}
                  onToggleLog={handleToggleLog}
                  completionCount={count}
                />
              );
            return (
              <DefaultHabitCard
                key={habit.id}
                habit={habit}
                logged={logged}
                onToggleLog={handleToggleLog}
                completionCount={count}
              />
            );
          })
        )}
      </div>

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
