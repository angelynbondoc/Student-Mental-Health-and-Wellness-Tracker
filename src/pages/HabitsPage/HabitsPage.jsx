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
import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../AppContext";
import { supabase } from "../../supabase";
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
  const { currentUser } = useContext(AppContext);
  const [myHabits, setMyHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      const [habitsRes, logsRes] = await Promise.all([
        supabase.from("habits").select("*"),
        supabase.from("habit_logs").select("*").eq("user_id", currentUser.id),
      ]);
      console.log("HABITS:", habitsRes.data, habitsRes.error);
      console.log("LOGS:", logsRes.data, logsRes.error);
      if (cancelled) return;
      if (habitsRes.data) setMyHabits(habitsRes.data);
      if (logsRes.data) setHabitLogs(logsRes.data);
      setLoading(false);
    }
    fetchData();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const isLoggedToday = (habitId) =>
    habitLogs.some(
      (log) => log.habit_id === habitId && log.completed_date === todayStr,
    );

  const handleToggleLog = async (habitId) => {
    if (isLoggedToday(habitId)) {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", currentUser.id)
        .eq("completed_date", todayStr);
      setHabitLogs((prev) =>
        prev.filter(
          (log) => !(log.habit_id === habitId && log.completed_date === todayStr),
        ),
      );
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, user_id: currentUser.id, completed_date: todayStr })
        .select()
        .single();
      if (data) setHabitLogs((prev) => [...prev, data]);
    }
  };

  const completionCount = (habitId) =>
    habitLogs.filter((log) => log.habit_id === habitId).length;

  


  return (
    <PageShell heading="My Habits" sub="Track your daily wellness rituals ">
      <div className="hp-list">
        {loading ? (
          <p style={{ textAlign: "center", padding: "24px", color: "var(--text)" }}>Loading…</p>
        ) : myHabits.length === 0 ? (
          <EmptyState message="No habits yet. Add one below!" />
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

    
      </PageShell>
  );
}
