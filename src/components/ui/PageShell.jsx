// =============================================================================
// PageShell.jsx
// Reusable page wrapper.
//
// Usage:
//   <PageShell heading="..." sub="...">           // default width
//   <PageShell heading="..." sub="..." narrow>    // narrower than default
//   <PageShell heading="..." sub="..." wide>      // full-bleed wide
// =============================================================================
import React from 'react';

export default function PageShell({
  heading,
  sub,
  narrow = false,
  wide = false,
  children,
}) {
  const variant = wide
    ? ' page-inner--wide'
    : narrow
    ? ' page-inner--narrow'
    : '';

  return (
    <div className="page-shell">
      <div className={`page-inner${variant}`}>
        {heading && <h2 className="page-heading">{heading}</h2>}
        {sub && <p className="page-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}