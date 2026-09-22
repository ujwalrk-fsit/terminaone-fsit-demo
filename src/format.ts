// Formatting module: single seam for every user-visible number/date.
// Interface: pure functions in, display strings out. No locale state inside —
// en-US stays the default adapter until i18n lands, then only this file changes.
function trim(n: number, digits = 1): string {
  const s = n.toFixed(digits);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `$${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString('en-US')}`;
}

export function fmtCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `$${trim(n / 1_000_000, n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function fmtNum(n: number, digits = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtPct(n: number, digits = 0): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
}

export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
