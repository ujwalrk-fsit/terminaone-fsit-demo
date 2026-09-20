import { dataFiles, dataActivity, users, funds } from './data/sample';
import type { DataFile, DataFolder, RoleGroup } from './types';

export const FOLDERS: DataFolder[] = [
  'Offering Memorandum', 'Subscription Documents', 'Financials & Valuations',
  'Legal & Compliance', 'Tax Documents', 'Reports & Updates',
];

export function latest(f: DataFile) { return f.versions[f.versions.length - 1]; }

export function fmtSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function canView(f: DataFile, role: RoleGroup | undefined) {
  if (!role) return false;
  if (role === 'admin') return true;
  if (f.access.length === 0) return true;
  return f.access.includes(role);
}

export function fundName(id: string) { return funds.find((f) => f._id === id)?.fundName ?? id; }

export function actorName(id: string) {
  const u = users.find((x) => x._id === id);
  return u ? `${u.firstName} ${u.lastName}` : id;
}

export function roomFiles(fundId: string, extra: DataFile[] = []) {
  return [...extra.filter((f) => f.fundId === fundId), ...dataFiles.filter((f) => f.fundId === fundId)];
}

export function roomActivity(fundId: string, extra: { fundId: string }[] = []) {
  void extra;
  return dataActivity.filter((a) => a.fundId === fundId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function lastUpdated(fundId: string, extra: DataFile[] = []) {
  const all = roomFiles(fundId, extra);
  return all.map((f) => f.updatedAt).sort().reverse()[0] ?? '—';
}
