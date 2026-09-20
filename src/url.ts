import { useCallback, useSyncExternalStore } from 'react';

// URL query-state module: one hook keeps filter/tab/page state deep-linkable.
// Interface: useQueryState(key, initial) behaves like useState, but persists to
// ?key=value via history.replace (no nav, no reload). Empty values are removed.
function read(key: string, initial: string): string {
  if (typeof window === 'undefined') return initial;
  return new URLSearchParams(window.location.search).get(key) ?? initial;
}

const subs = new Set<() => void>();
function emit() { subs.forEach((l) => l()); }
function subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; }
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit);
}

export function useQueryState(key: string, initial = ''): [string, (v: string) => void] {
  const get = useCallback(() => read(key, initial), [key, initial]);
  const value = useSyncExternalStore(subscribe, get, () => initial);
  const set = useCallback((v: string) => {
    const url = new URL(window.location.href);
    if (v) url.searchParams.set(key, v);
    else url.searchParams.delete(key);
    window.history.replaceState(null, '', url.toString());
    emit();
  }, [key]);
  return [value, set];
}
