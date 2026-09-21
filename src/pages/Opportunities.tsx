import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useColl } from '../db';
import { useQueryState } from '../url';
import type { FundOffering, Opportunity } from '../types';
import { OppCard } from '../components/OppCard';
import { Empty } from '../components/Shell';

export default function Opportunities() {
  const [q, setQ] = useQueryState('q');
  const [sector, setSector] = useQueryState('sector');
  const opportunities = useColl<Opportunity>('opportunities');
  const funds = useColl<FundOffering>('funds');
  const sectors = useMemo(() => [...new Set(opportunities.map((o) => o.sector))], [opportunities]);
  const list = opportunities.filter((o) =>
    (!sector || o.sector === sector) &&
    (!q || o.name.toLowerCase().includes(q.toLowerCase()) || o.subSector.toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head">
        <h2>Marketplace: Opportunities</h2>
        <span className="pill pill-neutral">{list.length} tracked</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or sub-sector" className="t-search" aria-label="Search opportunities" />
        </div>
        <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ height: 40, padding: '0 12px' }} aria-label="Filter by sector">
          <option value="">All sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty text="No opportunities match filters (edge case)." /> : (
        <div className="grid-posts">
          {list.map((o) => <OppCard key={o._id} opp={o} fund={funds.find((f) => f._id === o.fundId)} />)}
        </div>
      )}
      <div className="risk-note"><b>Risk disclosure:</b> private-market interests are illiquid and may lose value. Figures shown are illustrative. Not investment advice.</div>
    </div>
  );
}
