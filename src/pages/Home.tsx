import { Link } from 'react-router-dom';
import { funds, opportunities, articles } from '../mocks/seed';
import { Card } from '../components/Shell';

export default function Home() {
  const live = funds.filter((f) => f.status === 'live');
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#0a2540] p-8 text-white">
        <h1 className="text-3xl font-extrabold">Private markets, reference build.</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Discover opportunities, evaluate with context (price, rounds, activity), then express interest and track — all mocked locally. All figures synthetic.</p>
        <div className="mt-4 flex gap-6 text-sm">
          <span><b>{opportunities.length}</b> opportunities (mock)</span>
          <span><b>{live.length}</b> live funds</span>
          <span><b>$18B+</b> illustrative volume</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link to="/opportunities" className="rounded bg-white px-4 py-2 text-sm font-bold text-[#0a2540]">Browse opportunities</Link>
          <Link to="/auth/login" className="rounded border border-white/40 px-4 py-2 text-sm">Login (mock)</Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {opportunities.slice(0, 6).map((o) => (
          <Card key={o._id}>
            <div className="font-bold"><Link to={`/opportunities/${o._id}`}>{o.name}</Link></div>
            <div className="text-xs text-slate-500">{o.sector} / {o.subSector} · {o.activity}</div>
            <div className="mt-1 text-sm">{o.tsgPrice ? `$${o.tsgPrice} (${o.priceChange1Y ?? '—'}% 1Y)` : 'Price not available'}</div>
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-2 font-bold">Insights (mock CMS)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {articles.filter((a) => a.status === 'published').map((a) => (
            <Card key={a._id}><Link to={`/insights/${a._id}`} className="font-bold">{a.title}</Link><div className="text-xs text-slate-500">{a.category}</div></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
