// =============================================================================
// App.jsx — Single source of truth. Holds ALL global state.
// Batch 3 adds: notifications, directMessages + InboxPage route
// FIX: Restored missing /create route and CreatePage import
// =============================================================================
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppContext from './AppContext';
import MobileLayout from './components/MobileLayout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';       // ← RESTORED
import JournalPage from './pages/JournalPage';
import ResourcesPage from './pages/ResourcesPage';
import HabitsPage from './pages/HabitsPage';
import InboxPage from './pages/InboxPage';

import {
  INITIAL_PROFILES,
  INITIAL_COMMUNITIES,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_REACTIONS,
  INITIAL_MOOD_JOURNAL,
  INITIAL_RESOURCES,
  INITIAL_HABITS,
  INITIAL_HABIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DIRECT_MESSAGES,
} from './Mockdata';

const CURRENT_USER = {
  id: 'user-1',
  display_name: 'Test Student',
  role: 'student', // change to 'admin' to reveal admin UI
};

function App() {
  // ── Batch 1 ────────────────────────────────────────────────────────────────
  const [profiles,    setProfiles]    = useState(INITIAL_PROFILES);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [posts,       setPosts]       = useState(INITIAL_POSTS);
  const [comments,    setComments]    = useState(INITIAL_COMMENTS);
  const [reactions,   setReactions]   = useState(INITIAL_REACTIONS);

  // ── Batch 2 ────────────────────────────────────────────────────────────────
  const [moodJournal, setMoodJournal] = useState(INITIAL_MOOD_JOURNAL);
  const [resources,   setResources]   = useState(INITIAL_RESOURCES);
  const [habits,      setHabits]      = useState(INITIAL_HABITS);
  const [habitLogs,   setHabitLogs]   = useState(INITIAL_HABIT_LOGS);

  // ── Batch 3 ────────────────────────────────────────────────────────────────
  const [notifications,  setNotifications]  = useState(INITIAL_NOTIFICATIONS);
  const [directMessages, setDirectMessages] = useState(INITIAL_DIRECT_MESSAGES);

  const contextValue = {
    currentUser: CURRENT_USER,
    profiles,    setProfiles,
    communities, setCommunities,
    posts,       setPosts,
    comments,    setComments,
    reactions,   setReactions,
    moodJournal, setMoodJournal,
    resources,   setResources,
    habits,      setHabits,
    habitLogs,   setHabitLogs,
    notifications,  setNotifications,
    directMessages, setDirectMessages,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MobileLayout />}>
            <Route index             element={<HomePage />} />
            <Route path="create"     element={<CreatePage />} />   {/* ← RESTORED */}
            <Route path="journal"    element={<JournalPage />} />
            <Route path="resources"  element={<ResourcesPage />} />
            <Route path="habits"     element={<HabitsPage />} />
            <Route path="inbox"      element={<InboxPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;