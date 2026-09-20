import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { opportunities } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';

export default function Opportunities() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const sectors = useMemo(() => [...new Set(opportunities.map((o) => o.sector))], []);
  const list = opportunities.filter((o) =>
    (!sector || o.sector === sector) &&
    (!q || o.name.toLowerCase().includes(q.toLowerCase()) || o.subSector.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Marketplace — Opportunities</h1>
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or sub-sector" className="rounded border p-2 text-sm" />
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded border p-2 text-sm">
          <option value="">All sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty text="No opportunities match filters (edge case)." /> : (
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((o) => (
            <Card key={o._id}>
              <Link to={`/opportunities/${o._id}`} className="font-bold">{o.name}</Link>
              <div className="text-xs text-slate-500">{o.sector} / {o.subSector}</div>
              <div className="mt-1 text-sm">{o.tsgPrice ? <>TSG Price <b>${o.tsgPrice}</b> · {o.priceChange1Y}% 1Y</> : 'Price not available'}</div>
              <div className="text-xs">Last round: {o.lastRound ? `${o.lastRound.round} · $${(o.lastRound.valuation / 1e9).toFixed(1)}B` : '—'} · Activity: {o.activity}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
