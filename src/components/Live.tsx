import { useEffect, useState } from 'react';

// Live announcer module: one function for every async/status message.
// Interface: announce(msg). Mount <LiveHost/> once near the root; screen
// readers hear toasts, validation errors, and completions via a polite region.
const subs = new Set<(m: string) => void>();

export function announce(msg: string) {
  subs.forEach((l) => l(msg));
}

export function LiveHost() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const fn = (m: string) => {
      setMsg('');
      requestAnimationFrame(() => setMsg(m));
    };
    subs.add(fn);
    return () => { subs.delete(fn); };
  }, []);
  return (
    <div aria-live="polite" role="status" className="sr-only">{msg}</div>
  );
}
