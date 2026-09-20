import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { opportunities, funds, indications } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';
import { toggle, type RootState } from '../store';

export default function OpportunityDetail() {
  const { id } = useParams();
  const o = opportunities.find((x) => x._id === id);
  const dispatch = useDispatch();
  const watch = useSelector((s: RootState) => s.watch);
  if (!o) return <Empty text="Opportunity not found (edge case)." />;
  const fund = funds.find((f) => f._id === o.fundId);
  const book = indications.filter((i) => i.opportunityId === o._id || i.fundId === o.fundId);
  const bids = book.length;
  const chart = o.quarterlyData.map((d) => ({ name: `${d.year} ${d.quarter}`, v: d.value }));
  const similar = opportunities.filter((x) => x._id !== o._id && x.sector === o.sector).slice(0, 3);
  const inWatch = watch.ids.includes(o._id);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold">{o.name}</h1>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs">{o.sector} / {o.subSector}</span>
        <span className="rounded bg-emerald-100 px-2 py-1 text-xs">{o.activity} activity</span>
        <button onClick={() => dispatch(toggle(o._id))} className="ml-auto rounded border px-2 py-1 text-sm">{inWatch ? '★ Watching' : '☆ Watch'}</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm text-slate-500">TSG Price (derived, mock)</div>
          <div className="text-2xl font-extrabold">{o.tsgPrice ? `$${o.tsgPrice}` : 'Not available'}</div>
          <div className="text-xs">1Y: {o.priceChange1Y ?? '—'}% · QoQ: {o.latestQoQ ?? '—'}% · Bids: {bids}</div>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}><XAxis dataKey="name" hide /><YAxis hide /><Tooltip /><Line type="monotone" dataKey="v" stroke="#0b3b8f" dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="font-bold">Funding & details</div>
          <div className="mt-1 text-sm">Last round: {o.lastRound ? `${o.lastRound.round} · ${o.lastRound.date} · $${(o.lastRound.valuation / 1e9).toFixed(1)}B · $${o.lastRound.pps}/share` : '—'}</div>
          <p className="mt-2 text-sm">{o.description}</p>
          {fund && <div className="mt-2 text-sm">Linked fund: <Link to={`/indications/new?fund=${fund._id}`} className="underline">{fund.fundName}</Link> ({fund.status}, min ${fund.minimumInvestment.toLocaleString()})</div>}
          <div className="mt-3 flex gap-2">
            <Link to={fund ? `/indications/new?fund=${fund._id}&opp=${o._id}` : '/indications/new'} className="rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white">Express interest</Link>
          </div>
        </Card>
      </div>
      <Card>
        <div className="font-bold">Order book (mock indications)</div>
        {book.length === 0 ? <div className="text-sm text-slate-500">No bids yet — be the first (edge case).</div> :
          <table className="mt-2 w-full text-sm"><thead><tr className="text-left text-slate-500"><th>ID</th><th>Units</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{book.map((b) => <tr key={b._id} className="border-t"><td className="font-mono">{b._id}</td><td>{b.numberOfUnits}</td><td>${b.investmentAmount.toLocaleString()}</td><td>{b.status}</td></tr>)}</tbody></table>}
      </Card>
      <Card>
        <div className="font-bold">FAQs / transfer notes (mock)</div>
        <ul className="list-disc pl-5 text-sm"><li>Transfers subject to fund approval (mock).</li><li>Bank transfer only; no cards in this build.</li><li>Lock-up and eligibility per offering memo.</li></ul>
      </Card>
      {similar.length > 0 && (
        <div><div className="mb-1 font-bold">Similar opportunities</div>
        <div className="grid gap-4 md:grid-cols-3">{similar.map((s) => <Card key={s._id}><Link to={`/opportunities/${s._id}`} className="font-bold">{s.name}</Link><div className="text-xs">{s.subSector}</div></Card>)}</div></div>
      )}
    </div>
  );
}
