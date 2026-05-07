// =============================================================================
// FormField.jsx
// Reusable label + input/select/textarea — used by CreatePage and JournalPage.
//
// Replaces the repeated .neu-flabel + .neu-fselect / .neu-ftextarea / .neu-jinput
// pattern copy-pasted across both form pages.
//
// Usage:
//   <FormField label="Post to Community" htmlFor="community-select" required>
//     <select id="community-select" className="field-select" .../>
//   </FormField>
//
//   <FormField label="Your Entry" as="textarea" required
//     value={text} onChange={setText} placeholder="Write here..." rows={4} />
// =============================================================================
import React from 'react';

export default function FormField({
  label,
  htmlFor,
  required = false,
  as = 'input',        // 'input' | 'textarea' | 'select' — or pass children
  children,
  ...inputProps        // value, onChange, placeholder, rows, etc.
}) {
  const id = htmlFor ?? label?.toLowerCase().replace(/\s+/g, '-');

  const renderControl = () => {
    if (children) return children;
    if (as === 'textarea') {
      return <textarea id={id} className="field-textarea" {...inputProps} />;
    }
    if (as === 'select') {
      return <select id={id} className="field-select" {...inputProps} />;
    }
    return <input id={id} type="text" className="field-input" {...inputProps} />;
  };

  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {renderControl()}
    </>
  );
}