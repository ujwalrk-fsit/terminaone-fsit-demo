import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'tsg.theme';
let current: Theme =
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function getTheme(): Theme { return current; }

export function setTheme(t: Theme) {
  current = t;
  try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = t;
  emit();
}

export function toggleTheme() { setTheme(current === 'light' ? 'dark' : 'light'); }

function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
}
