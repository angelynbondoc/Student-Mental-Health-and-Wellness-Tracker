// src/pages/AdminPage/ModeratorView/ModeratorView.jsx
// "See-through mirror" — shows all posts including anonymous ones
// with the author's real name and photo visible only to admins.

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Search, AlertTriangle, Shield, Users, Filter } from 'lucide-react';
import { supabase } from '../../../supabase';
import { containsCrisisKeywords, getMatchedKeyword } from '../../../utils/crisisKeywords';
import './ModeratorView.css';

/* ── Highlight a matched crisis keyword inside post text ── */
function HighlightedText({ text }) {
  const keyword = getMatchedKeyword(text);
  if (!keyword) return <p className="mv-post-body">{text}</p>;

  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <p className="mv-post-body">
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="mv-keyword-highlight">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

/* ── Single post card ── */
function ModPostCard({ post }) {
  const isAnon    = post.is_anonymous;
  const isFlagged = post.is_flagged || containsCrisisKeywords(post.content ?? '');
  const author    = post.author;
  const displayName = author?.display_name ?? 'Unknown User';
  const initial   = displayName[0]?.toUpperCase() ?? '?';

  const avatarColors = ['#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#AD1457'];
  const colorIndex   = displayName.charCodeAt(0) % avatarColors.length;

  const communityName = post.community?.name ?? 'Unknown Community';

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

  return (
    <div className={`mv-card ${isFlagged ? 'mv-card--flagged' : isAnon ? 'mv-card--anon' : ''}`}>
      {isFlagged && (
        <div className="mv-crisis-badge">
          <AlertTriangle size={11} /> Crisis Content Detected
        </div>
      )}

      <div className="mv-card-header">
        <div className="mv-avatar" style={{ background: avatarColors[colorIndex] }}>
          {author?.photo_url
            ? <img src={author.photo_url} alt={displayName} />
            : initial
          }
        </div>

        <div className="mv-author-info">
          <div className="mv-author-name">
            {displayName}
            {isAnon && (
              <span className="mv-anon-reveal">
                <Eye size={10} /> Posted as Anonymous
              </span>
            )}
          </div>
          <div className="mv-post-meta">
            <span className="mv-community-tag">{communityName}</span>
            <span>·</span>
            <span>{fmtDate(post.created_at)}</span>
            {post.is_flagged && (
              <>
                <span>·</span>
                <span style={{ color: '#C62828', fontWeight: 600, fontSize: 11 }}>⚑ Flagged</span>
              </>
            )}
          </div>
        </div>
      </div>

      <HighlightedText text={post.content ?? ''} />
    </div>
  );
}

/* ── Skeleton loader ── */
function ModSkeleton() {
  return (
    <div className="mv-loading">
      {[1, 2, 3].map(i => (
        <div key={i} className="mv-skel-card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="mv-skel" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="mv-skel" style={{ height: 13, width: '35%' }} />
              <div className="mv-skel" style={{ height: 11, width: '22%' }} />
            </div>
          </div>
          <div className="mv-skel" style={{ height: 13, width: '100%' }} />
          <div className="mv-skel" style={{ height: 13, width: '80%' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function ModeratorView() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | anonymous | crisis | flagged

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      // Query posts table directly (not posts_view) to get real author info
      // regardless of is_anonymous flag
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, is_anonymous, is_flagged, created_at, community_id,
          author:profiles!author_id (
            id, display_name, photo_url
          ),
          community:communities (
            id, name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);
        
      if (error) {
        console.error('ModeratorView fetch error:', error);
        setLoading(false);
        return;
      }

      setPosts(data ?? []);
      setLoading(false);
    }

    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    let result = posts;

    // Apply filter tab
    if (filter === 'anonymous') {
      result = result.filter(p => p.is_anonymous);
    } else if (filter === 'crisis') {
      result = result.filter(p => p.is_flagged || containsCrisisKeywords(p.content ?? ''));
    } else if (filter === 'flagged') {
      result = result.filter(p => p.is_flagged);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.author?.display_name?.toLowerCase().includes(q) ||
        p.community?.name?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, filter, search]);

  const stats = useMemo(() => ({
    total:   posts.length,
    anon:    posts.filter(p => p.is_anonymous).length,
    crisis:  posts.filter(p => p.is_flagged || containsCrisisKeywords(p.content ?? '')).length,
  }), [posts]);

  const FILTERS = [
    { key: 'all',       label: 'All Posts' },
    { key: 'anonymous', label: `Anonymous (${stats.anon})` },
    { key: 'crisis',    label: `Crisis (${stats.crisis})` },
    { key: 'flagged',   label: 'Flagged' },
  ];

  return (
    <div className="mv-root">
      {/* Header */}
      <div className="mv-header">
        <div className="mv-header__icon">
          <Shield size={20} strokeWidth={2} />
        </div>
        <div>
          <h2 className="mv-header__title">Moderator View</h2>
          <p className="mv-header__sub">
            See-through mirror of the homepage — all posts with real identities revealed.
            Anonymous posts show the author's true name and photo only visible to admins.
          </p>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mv-stats">
          <span className="mv-stat-chip mv-stat-chip--total">
            <Users size={12} /> {stats.total} total posts
          </span>
          <span className="mv-stat-chip mv-stat-chip--anon">
            <Eye size={12} /> {stats.anon} anonymous
          </span>
          {stats.crisis > 0 && (
            <span className="mv-stat-chip mv-stat-chip--crisis">
              <AlertTriangle size={12} /> {stats.crisis} crisis flagged
            </span>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="mv-toolbar">
        <div className="mv-search-wrap">
          <Search size={14} className="mv-search-icon" />
          <input
            className="mv-search"
            type="text"
            placeholder="Search posts, real names, communities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`mv-filter-btn${filter === f.key ? ' mv-filter-btn--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.key === 'crisis' && <AlertTriangle size={13} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <ModSkeleton />
      ) : filtered.length === 0 ? (
        <div className="mv-empty">
          <div className="mv-empty-icon">🔍</div>
          <p>No posts match your current filter.</p>
        </div>
      ) : (
        <div className="mv-feed">
          {filtered.map(post => (
            <ModPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}