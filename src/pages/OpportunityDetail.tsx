import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { opportunities, funds, indications } from '../data/sample';
import { Empty } from '../components/Shell';
import { StatusPill, fmtMoney } from '../components/OppCard';
import { toggle, type RootState } from '../store';

export default function OpportunityDetail() {
  const { id } = useParams();
  const o = opportunities.find((x) => x._id === id);
  const dispatch = useDispatch();
  const watch = useSelector((s: RootState) => s.watch);
  if (!o) return <Empty text="Opportunity not found (edge case)." />;
  const fund = funds.find((f) => f._id === o.fundId);
  const book = indications.filter((i) => i.opportunityId === o._id || i.fundId === o.fundId);
  const chart = o.quarterlyData.map((d) => ({ name: `${d.year} ${d.quarter}`, v: d.value }));
  const similar = opportunities.filter((x) => x._id !== o._id && x.sector === o.sector).slice(0, 3);
  const inWatch = watch.ids.includes(o._id);
  const pct = fund?.raised && fund.offeringSize ? Math.min(100, Math.round((fund.raised / fund.offeringSize) * 100)) : 0;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ font: '700 28px/34px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>{o.name}</h1>
        {fund ? <StatusPill status={fund.status} /> : <span className="pill pill-neutral">{o.activity}</span>}
        <span className="pill pill-neutral">{o.sector} / {o.subSector}</span>
        <button onClick={() => dispatch(toggle(o._id))} className="chip" style={{ marginLeft: 'auto' }}>{inWatch ? '★ Watching' : '☆ Watch'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }} className="detail-grid">
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>TSG PRICE (DERIVED, MOCK)</div>
          <div className="tnum" style={{ font: '700 28px/34px var(--font-display)', color: 'var(--text-strong)' }}>{o.tsgPrice ? `$${o.tsgPrice.toFixed(2)}` : 'Not available'}</div>
          <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>1Y: {o.priceChange1Y ?? '—'}% · QoQ: {o.latestQoQ ?? '—'}% · Bids: {book.length}</div>
          <div style={{ height: 192, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8A8CA8', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: '#8A8CA8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A1B3A', border: '1px solid rgba(154,98,243,.3)', borderRadius: 8, color: 'var(--text-strong)' }} />
                <Line type="monotone" dataKey="v" stroke="#9A62F3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div style={{ font: '700 16px/22px var(--font-display)', color: 'var(--text-strong)' }}>Funding & details</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>Last round: {o.lastRound ? `${o.lastRound.round} · ${o.lastRound.date} · $${(o.lastRound.valuation / 1e9).toFixed(1)}B · $${o.lastRound.pps}/share` : '—'}</div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>{o.description}</p>
          {fund && (
            <>
              <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
              <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                <span><strong style={{ color: 'var(--signal)' }}>{fmtMoney(fund.raised ?? 0)}</strong> <span style={{ color: 'var(--text-muted)' }}>raised</span></span>
                <span><strong style={{ color: 'var(--text-strong)' }}>{fmtMoney(fund.offeringSize)}</strong> <span style={{ color: 'var(--text-muted)' }}>offering</span></span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13 }}>Linked fund: <strong style={{ color: 'var(--text-strong)' }}>{fund.fundName}</strong> · min ${fund.minimumInvestment.toLocaleString()}</div>
            </>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to={fund ? `/indications/new?fund=${fund._id}&opp=${o._id}` : '/indications/new'} className="btn btn-primary">Express interest <ArrowRight size={16} /></Link>
            {fund && <Link to={`/data-room/${fund._id}`} className="btn btn-ghost">Open data room</Link>}
          </div>
        </div>
      </div>

      <div className="card">
          <div style={{ font: '700 16px/22px var(--font-display)', color: 'var(--text-strong)' }}>Order book</div>
        {book.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No bids yet — be the first (edge case).</div> :
          <table className="grid" style={{ marginTop: 8 }}><thead><tr><th>ID</th><th>Units</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{book.map((b) => <tr key={b._id}><td style={{ fontFamily: 'monospace' }}>{b._id}</td><td className="tnum">{b.numberOfUnits}</td><td className="tnum">${b.investmentAmount.toLocaleString()}</td><td>{b.status}</td></tr>)}</tbody></table>}
      </div>

      <div className="card">
        <div style={{ font: '700 16px/22px var(--font-display)', color: 'var(--text-strong)' }}>Transfer notes & FAQs</div>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)' }}><li>Transfers subject to fund approval.</li><li>Bank transfer only; no cards accepted.</li><li>Lock-up and eligibility per offering memo.</li></ul>
      </div>

      <div className="risk-note"><b>Contextual risk:</b> secondary interests carry transfer restrictions and corporate actions. Review the offering memo with your advisor before expressing interest.</div>

      {similar.length > 0 && (
        <div>
          <div style={{ marginBottom: 8, font: '700 16px var(--font-display)', color: 'var(--text-strong)' }}>Similar opportunities</div>
          <div className="grid-posts">{similar.map((s) => (
            <div className="card" key={s._id}><Link to={`/opportunities/${s._id}`} style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)', textDecoration: 'none' }}>{s.name}</Link><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.subSector}</div></div>
          ))}</div>
        </div>
      )}
      <style>{`@media (max-width: 900px){ .detail-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
