import { useEffect, useRef, useState } from 'react';

// Confirm module: one function for every destructive decision in the app.
// Interface: confirm({title, body?, confirmLabel?, danger?}) => Promise<boolean>.
// Callers learn one function; the modal, focus trap-lite, and Escape handling
// live here (locality). Mount <ConfirmHost/> once, near the root.
interface Req {
  title: string; body?: string; confirmLabel?: string; danger?: boolean;
  resolve: (v: boolean) => void;
}

let current: Req | null = null;
const subs = new Set<() => void>();
function emit() { subs.forEach((l) => l()); }

export function confirm(opts: Omit<Req, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    current = { ...opts, resolve };
    emit();
  });
}

function settle(v: boolean) {
  current?.resolve(v);
  current = null;
  emit();
}

export function ConfirmHost() {
  const [, setTick] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    subs.add(fn);
    return () => { subs.delete(fn); };
  }, []);
  useEffect(() => {
    if (!current) return;
    btnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') settle(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  if (!current) return null;
  const r = current;
  return (
    <div role="alertdialog" aria-modal="true" aria-label={r.title}
      onClick={() => settle(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(16,26,48,.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 15 }}>{r.title}</div>
        {r.body && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{r.body}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => settle(false)}>Cancel</button>
          <button ref={btnRef} className="btn btn-primary" onClick={() => settle(true)}
            style={r.danger ? { background: 'var(--danger)' } : undefined}>
            {r.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
