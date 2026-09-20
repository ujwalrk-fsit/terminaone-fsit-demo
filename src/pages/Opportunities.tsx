import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { opportunities, funds } from '../mocks/seed';
import { OppCard } from '../components/OppCard';
import { Empty } from '../components/Shell';

export default function Opportunities() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const sectors = useMemo(() => [...new Set(opportunities.map((o) => o.sector))], []);
  const list = opportunities.filter((o) =>
    (!sector || o.sector === sector) &&
    (!q || o.name.toLowerCase().includes(q.toLowerCase()) || o.subSector.toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head">
        <h2>Marketplace — Opportunities</h2>
        <span className="pill pill-neutral">{list.length} tracked</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#fff" style={{ position: 'absolute', left: 12, top: 12 }} />
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
      <div className="risk-note"><b>Risk disclosure:</b> private-market interests are illiquid and may lose value. Figures here are synthetic mock data for design reference — not investment advice.</div>
    </div>
  );
}
