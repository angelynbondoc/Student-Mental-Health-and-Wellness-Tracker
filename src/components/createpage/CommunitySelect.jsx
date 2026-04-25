// =============================================================================
// CommunitySelect.jsx — custom dropdown, replaces native <select>
// =============================================================================
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CommunitySelect({ communities, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = communities.find((c) => c.id === value);

  return (
    <>
      <label className="field-label">Post to Community</label>
      <div className="cs-wrapper">
        <button
          type="button"
          className="cs-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{selected?.name ?? 'Select a community'}</span>
          <ChevronDown
            size={16}
            className={`cs-chevron${open ? ' cs-chevron--open' : ''}`}
          />
        </button>

        {open && (
          <div className="cs-dropdown">
            {communities.map((c) => (
              <div
                key={c.id}
                className={`cs-option${c.id === value ? ' cs-option--active' : ''}`}
                onClick={() => { onChange(c.id); setOpen(false); }}
              >
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}