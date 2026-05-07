import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppContext from "./AppContext";
import { MobileLayout } from "./components/layout";
import HomePage from "./pages/HomePage/HomePage";
import CreatePage from "./pages/CreatePage/CreatePage";
import JournalPage from "./pages/JournalPage/JournalPage";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage";
import HabitsPage from "./pages/HabitsPage/HabitsPage";
import CommunitiesPage from "./pages/CommunitiesPage/CommunitiesPage";
import NotificationsPage from './pages/NotificationsPage/NotificationsPage'
import LoginPage from "./pages/LoginPage/LoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage/ProfilePage";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import UserProfilePage from "./pages/ProfilePage/UserProfilePage/UserProfilePage";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import AuthCallback from "./pages/AuthCallback";
import { supabase } from "./supabase";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    async function resolveUser(session) {
      if (!session?.user) return null;
      const email = session.user.email ?? "";
      if (!email.endsWith("@neu.edu.ph")) {
        await supabase.auth.signOut();
        return null;
      }
      return {
        id: session.user.id,
        display_name: email,
        role: "student",
      };
    }

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = await resolveUser(session);
        setCurrentUser(user);
      } catch (err) {
        console.error("init error:", err);
        setCurrentUser(null);
      } finally {
        setAuthReady(true);
      }
    }
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("auth event:", event);
      console.log("auth session:", session);
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setProfileReady(false);
        setAuthReady(true);
        return;
      }

      const user = await resolveUser(session);
      console.log("resolved user:", user);

      setCurrentUser((prev) => {
        if (prev?.id === user?.id) return prev; // same user, preserve profile data
        return user; // different user, let profile fetch re-run
      });

      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Batch 1 ────────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    if (!currentUser) return; // wait for auth
    async function fetchCommunities() {
      const [{ data: memberships }, { data: general }] = await Promise.all([
        supabase
          .from("community_members")
          .select("community_id, communities(*)")
          .eq("user_id", currentUser.id)
          .eq("communities.status", "approved"),
        supabase
          .from("communities")
          .select("*")
          .eq("is_general", true)
          .single(),
      ]);

      const joined = (memberships ?? []).map((row) => row.communities).filter(Boolean);
      const generalAlreadyIn = joined.some(c => c.is_general);
      const all = generalAlreadyIn ? joined : [general, ...joined].filter(Boolean);
      setCommunities(all);
    }
    fetchCommunities();
  }, [currentUser]); // re-run when user is available

  useEffect(() => {
    if (!currentUser?.id) return;
    async function fetchProfiles() {
      const { data } = await supabase.from("profiles").select(`
          id, display_name, bio, photo_url, role, created_at,
          program:program_id (
            name,
            college:college_id ( name )
          )
        `);
      if (data) setProfiles(data);
    }
    fetchProfiles();
  }, [currentUser?.id]);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchProfile() {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          `
          role, display_name, privacy_acknowledged, photo_url, bio,
          program:program_id (
            name,
            college:college_id ( name )
          )
        `,
        )
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("profile fetch error:", error);
        setProfileReady(true); // still unblock even on error
        return;
      }

      setCurrentUser((prev) => ({
        ...prev,
        role: profile?.role ?? "student",
        display_name: profile?.display_name ?? prev.display_name,
        privacy_acknowledged: profile?.privacy_acknowledged ?? false,
        photo_url: profile?.photo_url ?? null,
        bio: profile?.bio ?? "",
        program: profile?.program ?? null,
      }));
      setProfileReady(true); // ← unblock the route guard
    }

    fetchProfile();
  }, [currentUser?.id]);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("posts_view")
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

useEffect(() => {
  if (!currentUser) return;

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  }

  fetchNotifications();

  const channel = supabase
    .channel('notifications-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`,
      },
      () => fetchNotifications()
    )
    .subscribe((status) => console.log('realtime status:', status));

  return () => supabase.removeChannel(channel);
}, [currentUser?.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const contextValue = {
    currentUser,
    setCurrentUser,
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
    searchQuery,
    setSearchQuery,
    moodJournal,
    setMoodJournal,
    notifications,
    setNotifications,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminDashboard />
              </AdminRouteGuard>
            }
          />
          <Route
            element={
              !authReady ? (
                <div>Loading...</div>
              ) : !currentUser ? (
                <Navigate to="/login" replace />
              ) : !profileReady ? (
                <div>Loading...</div>
              ) : currentUser.role === "admin" ||
                currentUser.role === "superadmin" ? (
                <Navigate to="/admin" replace />
              ) : !currentUser.privacy_acknowledged ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <MobileLayout />
              )
            }
          >
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
