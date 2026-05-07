// =============================================================================
// PageShell.jsx
// Reusable page wrapper — every page uses the same outer shell:
//   centered column, max-width inner, heading + subheading.
//
// Replaces the repeated .neu-X / .neu-X-inner / .neu-X-heading / .neu-X-sub
// pattern that was copy-pasted into all 6 pages.
//
// Usage:
//   <PageShell heading="My Page" sub="A short description" narrow>
//     {children}
//   </PageShell>
// =============================================================================
import React from 'react';

export default function PageShell({ heading, sub, narrow = false, children }) {
  return (
    <div className="page-shell">
      <div className={`page-inner${narrow ? ' page-inner--narrow' : ''}`}>
        {heading && (
          <h2 className={`page-heading${sub ? '' : ''}`}>{heading}</h2>
        )}
        {sub && <p className="page-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}