// =============================================================================
// CommunitiesPage.jsx
// Shows all communities with joined ones at the top.
// Users can join or leave directly from the cards.
// =============================================================================
import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../AppContext";
import { PageShell, EmptyState } from "../../components/ui";
import { supabase } from "../../supabase";
import "./CommunitiesPage.css";

const COMMUNITY_EMOJI = {
  "Programming & Dev":        "💻",
  "Design & Animation":       "🎨",
  "Gaming & Esports":         "🎮",
  "Media & Content Creation": "📰",
  "Finance & Investing":      "📈",
  "Startups & Side Hustles":  "🚀",
  "Politics & Current Events":"🌍",
  "Science & Research":       "🔬",
  "Music & Performing Arts":  "🎵",
  "Sports & Fitness":         "🏃",
  "Mental Health & Wellness": "🧠",
  "Travel & Culture":         "✈️",
  "Books & Learning":         "📖",
  "Food & Lifestyle":         "🍳",
  "Engineering & Making":     "⚙️",
};

export default function CommunitiesPage() {
  const { currentUser, communities, setCommunities } = useContext(AppContext);

  const [allCommunities, setAllCommunities] = useState([]);
  const [joinedIds, setJoinedIds]           = useState(new Set());
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState(null); // community id being acted on

  // Fetch all communities + which ones the user has joined
  useEffect(() => {
    if (!currentUser) return;
    async function fetchAll() {
      const [{ data: all, error: allErr }, { data: memberships, error: memErr }] = await Promise.all([
        supabase.from("communities").select("id, name, category, emoji").order("name"),
        supabase.from("community_members").select("community_id").eq("user_id", currentUser.id),
        ]);
        console.log("all communities:", all, allErr);
        console.log("memberships:", memberships, memErr);
      setAllCommunities(all ?? []);
      setJoinedIds(new Set((memberships ?? []).map(m => m.community_id)));
      setLoading(false);
    }
    fetchAll();
  }, [currentUser?.id]);

  const joined  = allCommunities.filter(c => joinedIds.has(c.id));
  const others  = allCommunities.filter(c => !joinedIds.has(c.id));

  async function handleJoin(community) {
    setActionLoading(community.id);
    const { error } = await supabase
      .from("community_members")
      .insert({ user_id: currentUser.id, community_id: community.id });

    if (!error) {
      setJoinedIds(prev => new Set([...prev, community.id]));
      // keep app-level communities in sync
      setCommunities(prev =>
        prev.find(c => c.id === community.id) ? prev : [...prev, community]
      );
    } else {
      console.error("join error:", error);
    }
    setActionLoading(null);
  }

  async function handleLeave(community) {
    setActionLoading(community.id);
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("community_id", community.id);

    if (!error) {
      setJoinedIds(prev => { const s = new Set(prev); s.delete(community.id); return s; });
      setCommunities(prev => prev.filter(c => c.id !== community.id));
    } else {
      console.error("leave error:", error);
    }
    setActionLoading(null);
  }

  function CommunityCard({ community }) {
    const isJoined  = joinedIds.has(community.id);
    const isBusy    = actionLoading === community.id;
    const emoji = community.emoji ?? COMMUNITY_EMOJI[community.name] ?? "🌐";

    return (
      <div className={`cp-card ${isJoined ? "cp-card--joined" : ""}`}>
        <div className="cp-card-emoji">{emoji}</div>
        <div className="cp-card-body">
          <div className="cp-card-top">
            <h3 className="cp-card-name">{community.name}</h3>
            {isJoined && <span className="cp-joined-badge">Joined</span>}
          </div>
        </div>
        <button
          className={`cp-action-btn ${isJoined ? "cp-action-btn--leave" : "cp-action-btn--join"}`}
          onClick={() => isJoined ? handleLeave(community) : handleJoin(community)}
          disabled={isBusy}
        >
          {isBusy ? "…" : isJoined ? "Leave" : "Join"}
        </button>
      </div>
    );
  }

  return (
    <PageShell
      heading="🌐 Communities"
      sub="Join communities that match your interests."
    >
      {loading ? (
        <p className="cp-loading">Loading communities…</p>
      ) : (
        <>
          {/* ── Joined ── */}
          {joined.length > 0 && (
            <div className="cp-section">
              <div className="cp-section-label">✅ Communities you've joined</div>
              <div className="cp-grid">
                {joined.map(c => <CommunityCard key={c.id} community={c} />)}
              </div>
            </div>
          )}

          {/* ── All others ── */}
          {others.length > 0 && (
            <div className="cp-section">
              <div className="cp-section-label">🌐 All communities</div>
              <div className="cp-grid">
                {others.map(c => <CommunityCard key={c.id} community={c} />)}
              </div>
            </div>
          )}

          {allCommunities.length === 0 && (
            <EmptyState message="No communities available yet." />
          )}
        </>
      )}
    </PageShell>
  );
}