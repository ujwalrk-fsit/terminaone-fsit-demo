import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type Dir = 1 | -1;
export function useSort<T>(rows: T[], defKey: string, defDir: Dir, get: (r: T, k: string) => string | number): [T[], string, Dir, (k: string) => void] {
  const [key, setKey] = useState(defKey);
  const [dir, setDir] = useState<Dir>(defDir);
  const sorted = useMemo(() => {
    const arr = rows.slice();
    arr.sort((a, b) => {
      const va = get(a, key);
      const vb = get(b, key);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    return arr;
  }, [rows, key, dir, get]);
  const sort = (k: string) => {
    if (k === key) setDir((d) => (d === 1 ? -1 : 1));
    else { setKey(k); setDir(1); }
  };
  return [sorted, key, dir, sort];
}

export function SortTh({ label, k, sk, dir, onSort }: { label: React.ReactNode; k: string; sk: string; dir: Dir; onSort: (k: string) => void }) {
  const on = sk === k;
  return (
    <th aria-sort={on ? (dir === 1 ? 'ascending' : 'descending') : 'none'} style={{ padding: 0 }}>
      <button onClick={() => onSort(k)} title={`Sort by ${typeof label === 'string' ? label : k}`}
        style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit', font: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', width: '100%' }}>
        <span>{label}</span>
        <span style={{ opacity: on ? 1 : .35, fontSize: 9 }}>{on ? (dir === 1 ? '▲' : '▼') : '▲▼'}</span>
      </button>
    </th>
  );
}

export function TableTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          style={{ background: 'none', border: 0, cursor: 'pointer', padding: '4px 0', color: t === active ? 'var(--text-strong)' : 'var(--text-subtle)', fontWeight: t === active ? 700 : 400, borderBottom: t === active ? '2px solid var(--primary-600)' : '2px solid transparent' }}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const init = name.trim().charAt(0).toUpperCase() || '?';
  const hues = ['#2B0F4B', '#430A93', '#0E7490', '#147A33', '#9A6212'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (
    <span style={{ width: 26, height: 26, borderRadius: '50%', background: hues[h % hues.length], color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flex: 'none' }}>
      {init}
    </span>
  );
}

export function ExpandBtn({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-expanded={open} aria-label={label}
      style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}>
      <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
    </button>
  );
}

export function toCsv(name: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob([[header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
