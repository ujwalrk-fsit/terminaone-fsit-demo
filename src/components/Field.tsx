import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';

// Field module: one wrapper for every labelled form control.
// Interface: <Field label required? hint? error?>control</Field>. The wrapper
// owns id association, required marking, hints, and error text — callers just
// pass a label and a control. Locality: label/error conventions change here once.
export function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string;
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}) {
  const id = useId();
  const desc = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const control = cloneElement(children, {
    id,
    ...(error ? { 'aria-invalid': true as const, 'aria-describedby': desc } : desc ? { 'aria-describedby': desc } : {}),
  });
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 4 }}>
        {label}{required && <span aria-hidden="true" style={{ color: 'var(--danger)' }}> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {control}
      {hint && !error && <div id={`${id}-hint`} style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{hint}</div>}
      {error && <div id={`${id}-err`} role="alert" style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function focusFirstError(root?: ParentNode) {
  const el = (root ?? document).querySelector('[aria-invalid="true"]') as HTMLElement | null;
  el?.focus();
}

export function FieldNote({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{children}</div>;
}
