import './LoadingPage.css';

export default function LoadingPage() {
  return (
    <div className="lp-shell">

      {/* Top Bar Skeleton */}
      <div className="lp-topbar">
        <div className="lp-skel lp-logo" />
        <div className="lp-skel lp-search" />
        <div className="lp-skel lp-avatar" />
      </div>

      <div className="lp-body">

        {/* Sidebar Skeleton */}
        <aside className="lp-sidebar">
          <div className="lp-skel lp-sidebar-label" />
          {[1, 2, 3].map(i => (
            <div className="lp-sidebar-item" key={i}>
              <div className="lp-skel lp-sidebar-icon" />
              <div className="lp-skel lp-sidebar-text" />
            </div>
          ))}

          <div className="lp-skel lp-sidebar-label" style={{ marginTop: '1.5rem' }} />
          {[1, 2].map(i => (
            <div className="lp-sidebar-item" key={i + 10}>
              <div className="lp-skel lp-sidebar-icon" />
              <div className="lp-skel lp-sidebar-text" style={{ width: '55%' }} />
            </div>
          ))}
        </aside>

        {/* Feed Skeleton */}
        <main className="lp-feed">
          {[1, 2, 3].map(i => (
            <div className="lp-card" key={i}>
              {/* Card Header */}
              <div className="lp-card-header">
                <div className="lp-skel lp-card-avatar" />
                <div className="lp-card-meta">
                  <div className="lp-skel lp-card-name" />
                  <div className="lp-skel lp-card-time" />
                </div>
              </div>

              {/* Card Body Lines */}
              <div className="lp-card-body">
                <div className="lp-skel lp-card-line" />
                <div className="lp-skel lp-card-line" style={{ width: '85%' }} />
                <div className="lp-skel lp-card-line" style={{ width: '65%' }} />
              </div>

              {/* Card Actions */}
              <div className="lp-card-actions">
                <div className="lp-skel lp-card-action-btn" />
                <div className="lp-skel lp-card-action-btn" />
                <div className="lp-skel lp-card-action-btn" />
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Bottom Nav Skeleton (mobile) */}
      <div className="lp-bottomnav">
        {[1, 2, 3, 4].map(i => (
          <div className="lp-bottomnav-item" key={i}>
            <div className="lp-skel lp-bn-icon" />
            <div className="lp-skel lp-bn-label" />
          </div>
        ))}
      </div>
    </div>
  );
}