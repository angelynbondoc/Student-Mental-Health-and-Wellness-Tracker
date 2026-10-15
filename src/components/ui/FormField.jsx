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
import React, { useId } from 'react';

export default function FormField({
  label,
  htmlFor,
  id: controlId,
  required = false,
  hint,                // optional helper text under the control
  error,               // optional error message; marks the control invalid
  as = 'input',        // 'input' | 'textarea' | 'select' — or pass children
  children,
  'aria-describedby': describedBy,
  ...inputProps        // value, onChange, placeholder, rows, etc.
}) {
  const autoId = useId();
  const id = htmlFor ?? controlId ?? autoId;
  const msgId = `${id}-msg`;
  const message = error || hint;

  // Accessibility + validation props for the built-in controls.
  // (Custom children must set these themselves.)
  const a11y = {
    id,
    required,
    'aria-invalid': error ? true : inputProps['aria-invalid'],
    'aria-describedby': [describedBy, message ? msgId : null].filter(Boolean).join(' ') || undefined,
  };

  const renderControl = () => {
    if (children) return children;
    if (as === 'textarea') {
      return <textarea className="field-textarea" {...inputProps} {...a11y} />;
    }
    if (as === 'select') {
      return <select className="field-select" {...inputProps} {...a11y} />;
    }
    return <input type="text" className="field-input" {...inputProps} {...a11y} />;
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
