import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppContext from "./AppContext";
import { MobileLayout } from "./components/layout";
import HomePage from "./pages/HomePage/HomePage";
import CreatePage from "./pages/CreatePage";
import JournalPage from "./pages/JournalPage/JournalPage";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage";
import HabitsPage from "./pages/HabitsPage/HabitsPage";
import InboxPage from "./pages/InboxPage/InboxPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage/ProfilePage";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import UserProfilePage from "./pages/ProfilePage/UserProfilePage/UserProfilePage";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import { supabase } from "./supabase";
import {
  INITIAL_PROFILES,
  INITIAL_COMMUNITIES,
  INITIAL_COMMENTS,
  INITIAL_REACTIONS,
  INITIAL_MOOD_JOURNAL,
  INITIAL_RESOURCES,
  INITIAL_HABITS,
  INITIAL_HABIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DIRECT_MESSAGES,
} from "./mockData";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user
        ? { id: session.user.id, display_name: session.user.email, role: "student" }
        : null
      );
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user
        ? { id: session.user.id, display_name: session.user.email, role: "student" }
        : null
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Batch 1 ────────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    }
    fetchPosts();
  }, []);

  // ── Batch 2 ────────────────────────────────────────────────────────────────
  const [moodJournal, setMoodJournal] = useState(INITIAL_MOOD_JOURNAL);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [habitLogs, setHabitLogs] = useState(INITIAL_HABIT_LOGS);

  // ── Batch 3 ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [directMessages, setDirectMessages] = useState(INITIAL_DIRECT_MESSAGES);

  const contextValue = {
    currentUser,
    profiles,
    setProfiles,
    communities,
    setCommunities,
    posts,
    setPosts,
    comments,
    setComments,
    reactions,
    setReactions,
    moodJournal,
    setMoodJournal,
    resources,
    setResources,
    habits,
    setHabits,
    habitLogs,
    setHabitLogs,
    notifications,
    setNotifications,
    directMessages,
    setDirectMessages,
  };


  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminDashboard />
              </AdminRouteGuard>
            }
          />
          <Route element={
            !authReady ? null : currentUser ? <MobileLayout /> : <Navigate to="/login" replace />
          }>
            <Route path="/home" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;