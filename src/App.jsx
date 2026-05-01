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

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    async function resolveUser(session) {
      if (!session?.user) return null;
      const email = session.user.email ?? '';
      if (!email.endsWith('@neu.edu.ph')) {
        await supabase.auth.signOut();
        return null;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        display_name: profile?.display_name ?? email ?? 'User',
        role: profile?.role ?? 'student',
      };
    }

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = await resolveUser(session);
      setCurrentUser(user);
      setAuthReady(true);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }
      const user = await resolveUser(session);
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Batch 1 ────────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      const { data } = await supabase.from('communities').select('*');
      if (data) setCommunities(data);
    }
    fetchCommunities();
  }, []);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);

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
  const [moodJournal, setMoodJournal] = useState([]);

  // ── Batch 3 ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

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