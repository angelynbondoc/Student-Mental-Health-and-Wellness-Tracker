// =============================================================================
// neuStyles.js — Shared CSS string imported by every page component.
//
// WHY a shared constant?
//   Each page injects a <style> block scoped to its own root class (.neu-*).
//   The font @import and CSS custom properties are the same everywhere, so we
//   centralise them here to avoid duplication and keep a single source of truth
//   for the NEU design tokens.
//
// Usage:
//   import { BASE_STYLES } from '../neuStyles';
//   const PAGE_STYLES = BASE_STYLES + ` .neu-mypage { ... } `;
// =============================================================================

export const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

  /* ── NEU design tokens ────────────────────────────────────────────────── */
  :root {
    --clr-primary:        #2E7D32;
    --clr-primary-dark:   #1B5E20;
    --clr-primary-tint:   #E8F5E9;
    --clr-accent:         #F5C400;
    --clr-accent-tint:    #FFFDE7;
    --clr-danger:         #C62828;
    --clr-danger-tint:    #FFEBEE;
    --clr-bg:             #FAFAFA;
    --clr-surface:        #FFFFFF;
    --clr-muted:          #F2F2F2;
    --clr-text:           #1A1A1A;
    --clr-text-secondary: #616161;
    --clr-border:         #E8E8E8;
    --font-heading:       'Poppins', sans-serif;
    --font-body:          'DM Sans', sans-serif;
  }
`;

// =============================================================================
// PAGE_WRAPPER — full-width page container used by every page.
//
// Design Decision:
//   Pages use max-width: none + width: 100% so they always fill the main
//   content area (which itself fills the remaining viewport after the sidebar).
//   Padding is the only constraint — never a fixed max-width that would leave
//   black space.
// =============================================================================
export const PAGE_WRAPPER_STYLES = `
  .neu-page-wrap {
    width: 100%;
    padding: 32px 40px;
    background: var(--clr-bg);
    min-height: calc(100vh - 56px);
  }
  @media (max-width: 768px) {
    .neu-page-wrap { padding: 24px 20px; }
  }
  @media (max-width: 480px) {
    .neu-page-wrap { padding: 18px 16px; }
  }
`;