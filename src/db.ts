import { useSyncExternalStore } from 'react';
import * as seed from './data/sample';

// Central data layer: seed snapshots + browser-persisted overrides.
// Every list page reads through here so back-office edits show up everywhere.
// Swap `seedMap` sources for API responses later without touching pages.
export type Coll =
  | 'funds' | 'opportunities' | 'indications' | 'users' | 'accounts'
  | 'articles' | 'docs' | 'transfers' | 'notices' | 'datafiles';

const LS = 'tsg.db.v1';
const seedMap: Record<Coll, unknown[]> = {
  funds: seed.funds, opportunities: seed.opportunities, indications: seed.indications,
  users: seed.users, accounts: seed.accounts, articles: seed.articles, docs: seed.docs,
  transfers: seed.transfers, notices: seed.notices, datafiles: seed.dataFiles,
};

let cache: Record<string, { _id: string }[]> | null = null;
// Cached snapshots per collection: getSnapshot must return the SAME reference
// until the store changes, otherwise React re-renders in an infinite loop.
let snaps: Record<string, { _id: string }[]> = {};
const subs = new Set<() => void>();
function emit() { snaps = {}; subs.forEach((l) => l()); }
function subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; }

function raw(): Record<string, { _id: string }[]> {
  if (!cache) {
    cache = {};
    try { cache = JSON.parse(localStorage.getItem(LS) || '{}'); } catch { cache = {}; }
  }
  return cache!;
}
function persist() {
  try { localStorage.setItem(LS, JSON.stringify(cache)); } catch { /* */ }
}

export function all<T extends { _id: string }>(coll: Coll): T[] {
  const o = raw()[coll];
  return ((o ?? seedMap[coll]) as T[]).slice();
}
export function save<T extends { _id: string }>(coll: Coll, rows: T[]) {
  raw()[coll] = rows; persist(); emit();
}
export function upsert<T extends { _id: string }>(coll: Coll, row: T) {
  const rows = all<T>(coll);
  const i = rows.findIndex((r) => r._id === row._id);
  save(coll, i >= 0 ? rows.map((r) => (r._id === row._id ? row : r)) : [...rows, row]);
}
export function remove(coll: Coll, id: string) {
  save(coll, all(coll).filter((r) => r._id !== id));
}
export function resetDb() {
  try { localStorage.removeItem(LS); } catch { /* */ }
  cache = null; emit();
}
export function useColl<T extends { _id: string }>(coll: Coll): T[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      let s = snaps[coll] as T[] | undefined;
      if (!s) { s = all<T>(coll); snaps[coll] = s; }
      return s;
    },
    () => seedMap[coll] as T[],
  );
}
