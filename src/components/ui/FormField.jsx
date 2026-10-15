// =============================================================================
// FormField.jsx
// Reusable label + input/select/textarea with optional hint/error — used by CreatePage and JournalPage.
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
import React, { useId } from 'react';

export default function FormField({
  label,
  htmlFor,
  required = false,
  hint,                // optional helper text under the control
  error,               // optional error message; marks the control invalid
  as = 'input',        // 'input' | 'textarea' | 'select' — or pass children
  children,
  ...inputProps        // value, onChange, placeholder, rows, etc.
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const msgId = `${id}-msg`;
  const message = error || hint;

  // Accessibility + validation props for the built-in controls.
  // (Custom children must set these themselves.)
  const a11y = {
    id,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': message ? msgId : undefined,
  };

  const renderControl = () => {
    if (children) return children;
    if (as === 'textarea') {
      return <textarea className="field-textarea" {...a11y} {...inputProps} />;
    }
    if (as === 'select') {
      return <select className="field-select" {...a11y} {...inputProps} />;
    }
    return <input type="text" className="field-input" {...a11y} {...inputProps} />;
  };

  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {renderControl()}
      {message && (
        <p id={msgId} className={error ? 'field-error' : 'field-hint'} role={error ? 'alert' : undefined}>
          {message}
        </p>
      )}
    </>
  );
}