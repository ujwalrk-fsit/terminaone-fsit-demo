import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useColl } from '../db';
import type { FundOffering, Opportunity } from '../types';

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const opportunities = useColl<Opportunity>('opportunities');
  const funds = useColl<FundOffering>('funds');
  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return { opps: [], fnds: [] };
    return {
      opps: opportunities.filter((o) => o.name.toLowerCase().includes(s) || o.subSector.toLowerCase().includes(s)).slice(0, 5),
      fnds: funds.filter((f) => f.fundName.toLowerCase().includes(s)).slice(0, 4),
    };
  }, [q, opportunities, funds]);
  const count = res.opps.length + res.fnds.length;
  return (
    <div className="menu" style={{ position: 'relative' }}>
      <div className="t-search-wrap">
        <Search size={15} />
        <input className="t-search" placeholder="Search for companies" aria-label="Search"
          value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }} />
      </div>
      {open && q.trim().length >= 2 && (
        <div className="menu-panel" role="menu" style={{ minWidth: 300 }}>
          {count === 0 && <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)' }}>No matches for “{q}”.</div>}
          {res.opps.map((o) => (
            <Link key={o._id} to={`/opportunities/${o._id}`} className="menu-item" onClick={() => setOpen(false)}>
              <span><b>{o.name}</b><small>{o.sector} / {o.subSector}{o.tsgPrice ? ` · $${o.tsgPrice.toFixed(2)}` : ''}</small></span>
            </Link>
          ))}
          {res.fnds.map((f) => (
            <Link key={f._id} to={`/indications/new?fund=${f._id}`} className="menu-item" onClick={() => setOpen(false)}>
              <span><b>{f.fundName}</b><small>Fund · {f.status} · min ${f.minimumInvestment.toLocaleString()}</small></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
