import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, CalendarDays, ChevronDown, Download, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useColl } from '../db';
import type { Opportunity, FundOffering, Indication, InvestorAccount } from '../types';
import { buyerFaqs, sellerFaqs, companyExt, companyNews, hashStr, priceSeries, RANGES } from '../data/company';
import { Empty } from '../components/Shell';
import { StatusPill, fmtMoney, tagClass } from '../components/OppCard';
import { toggle, type RootState } from '../store';

const TABS = [
  { k: 'market', label: 'Active Market' },
  { k: 'metrics', label: 'Trade Metrics' },
  { k: 'funding', label: 'Funding' },
  { k: 'company', label: 'Company Details' },
  { k: 'faqs', label: 'FAQs' },
  { k: 'news', label: 'News' },
  { k: 'similar', label: 'Similar Companies' },
] as const;

function Acc({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="acc">
      <button aria-expanded={open} onClick={onToggle}><span>{q}</span><ChevronDown size={16} /></button>
      {open && <div className="acc__body">{a}</div>}
    </div>
  );
}

export default function OpportunityDetail() {
  const { id = '' } = useParams();
  const opportunities = useColl<Opportunity>('opportunities');
  const fundList = useColl<FundOffering>('funds');
  const indicationList = useColl<Indication>('indications');
  const accountList = useColl<InvestorAccount>('accounts');
  const o = opportunities.find((x) => x._id === id);
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);
  const watch = useSelector((s: RootState) => s.watch);
  const [tab, setTab] = useState<string>('market');
  const [range, setRange] = useState<string>('1Y');
  const [sub, setSub] = useState<'investors' | 'leadership' | 'board'>('investors');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const spyOff = useRef(false);

  const ext = companyExt[id];
  const fund = fundList.find((f) => f._id === o?.fundId);
  const book = indicationList.filter((i) => o && (i.opportunityId === o._id || i.fundId === o.fundId));
  const peers = useMemo(() => {
    if (!o) return [];
    const same = opportunities.filter((x) => x._id !== o._id && x.sector === o.sector);
    const rest = opportunities.filter((x) => x._id !== o._id && x.sector !== o.sector).sort((a, b) => a.rank - b.rank);
    return [...same, ...rest].slice(0, 6);
  }, [o]);

  const ref = o?.tsgPrice ?? o?.quarterlyData[o.quarterlyData.length - 1].value ?? 100;
  const series = useMemo(() => priceSeries(id, ref, ref * 0.72), [id, ref]);
  const rk = RANGES.find((r) => r.k === range)!;
  const slice = series.slice(-rk.n);
  const chg = ((slice[slice.length - 1].v - slice[0].v) / slice[0].v) * 100;
  const hi = Math.max(...slice.map((p) => p.v));
  const lo = Math.min(...slice.map((p) => p.v));

  const h = hashStr(id);
  const bids = book.length;
  const asks = Math.max(1, Math.round(bids * (0.5 + (h % 100) / 140)));
  const highBid = o?.tsgPrice ? o.tsgPrice * 0.97 : undefined;
  const lowAsk = o?.tsgPrice ? o.tsgPrice * 1.03 : undefined;
  const myAcct = accountList.find((a) => a.userId === (auth.user?.sub ?? 'u_inv1'));
  const news = [...companyNews.filter((n) => n.oppId === id), ...companyNews.filter((n) => !n.oppId)].slice(0, 4);

  // scroll-spy
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        if (spyOff.current) return;
        es.forEach((e) => { if (e.isIntersecting) setTab(e.target.id.replace('sec-', '')); });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    TABS.forEach((t) => { const el = refs.current[t.k]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [id]);

  const go = (k: string) => {
    setTab(k);
    spyOff.current = true;
    refs.current[k]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { spyOff.current = false; }, 600);
  };

  if (!o || !ext) return <Empty text="Opportunity not found (edge case)." />;
  const inWatch = watch.ids.includes(o._id);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <CompanyNotice />
      {/* 1 · header */}
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
          <Link to="/opportunities" className="link-more" style={{ fontSize: 12 }}>Marketplace</Link> / {o.sector} / {o.subSector}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <h1 className="page-h" style={{ fontSize: 26 }}>{o.name}</h1>
          {fund ? <StatusPill status={fund.status} /> : <span className="pill pill-neutral">{o.activity}</span>}
          {ext.tags.map((t) => <span key={t} className={tagClass(t)}>{t}</span>)}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => dispatch(toggle(o._id))} className="chip">{inWatch ? '★ Watching' : '☆ Watch'}</button>
            {fund && <Link to={`/data-room/${fund._id}`} className="btn btn-ghost" style={{ height: 34 }}>Data room</Link>}
            <button className="btn btn-ghost" style={{ height: 34 }} onClick={() => window.print()}><Download size={14} /> Company profile</button>
            <Link to={fund ? `/indications/new?fund=${fund._id}&opp=${o._id}` : '/indications/new'} className="btn btn-primary" style={{ height: 34 }}>Express interest</Link>
          </span>
        </div>
      </div>

      {/* 2 · sticky tabs */}
      <div className="tabs-sticky no-print">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.k} role="tab" aria-selected={tab === t.k} className={`tab${tab === t.k ? ' on' : ''}`} onClick={() => go(t.k)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* A · Active Market */}
      <section id="sec-market" ref={(el) => { refs.current.market = el; }} style={{ display: 'grid', gap: 12, scrollMarginTop: 108 }}>
        <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <b style={{ color: 'var(--text-strong)' }}>Market status</b>
          <span className="tnum" style={{ fontSize: 13 }}>{asks} seller asks · {bids} buyer bids</span>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Last updated today, 09:30 IST</span>
          {o.tsgPrice && <span className="tnum" style={{ marginLeft: 'auto', font: '700 18px var(--font-display)', color: 'var(--text-strong)' }}>${o.tsgPrice.toFixed(2)}</span>}
        </div>

        {auth.user && myAcct && myAcct.status !== 'ACTIVE' && (
          <div className="notice-banner" style={{ borderColor: 'var(--border-brand)', background: 'var(--primary-50)' }}>
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span><b style={{ color: 'var(--primary-800)' }}>Account setup {myAcct.stepKey}.</b> Complete verification to move indications to allocation.</span>
            <Link to="/settings" className="link-more" style={{ fontSize: 12, marginLeft: 'auto' }}>Resume setup</Link>
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Peer opportunities</div>
          <div className="grid-posts" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
            {peers.slice(0, 3).map((p) => (
              <Link key={p._id} to={`/opportunities/${p._id}`} className="card" style={{ textDecoration: 'none', padding: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{p.subSector}</div>
                <div className="tnum" style={{ fontSize: 13, marginTop: 4, color: 'var(--text-default)' }}>
                  {p.tsgPrice ? `$${p.tsgPrice.toFixed(2)}` : 'Price N/A'}
                  {p.priceChange1Y != null && <span className={p.priceChange1Y >= 0 ? 'up' : 'down'}> · {p.priceChange1Y >= 0 ? '+' : ''}{p.priceChange1Y}%</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B · Trade Metrics */}
      <section id="sec-metrics" ref={(el) => { refs.current.metrics = el; }} style={{ display: 'grid', gap: 12, scrollMarginTop: 108 }}>
        <div className="kpis">
          <div className="kpi"><small>Activity</small><b>{o.activity}</b></div>
          <div className="kpi"><small>Bids / Asks</small><b>{bids} / {asks}</b></div>
          <div className="kpi"><small>Spread</small><b>{highBid && lowAsk ? `$${(lowAsk - highBid).toFixed(2)}` : '—'}</b></div>
          <div className="kpi"><small>Last matched</small><b>{ext.lastMatched ? `$${ext.lastMatched.toFixed(2)}` : '—'}</b></div>
          <div className="kpi"><small>TSG Price</small><b>{o.tsgPrice ? `$${o.tsgPrice.toFixed(2)}` : 'N/A'}</b></div>
          <div className="kpi"><small>Range change ({range})</small><b className={chg >= 0 ? 'up' : 'down'}>{chg >= 0 ? '+' : ''}{chg.toFixed(1)}%</b></div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <b style={{ color: 'var(--text-strong)' }}>Price history</b>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {RANGES.map((r) => (
                <button key={r.k} onClick={() => setRange(r.k)} className={`chip${range === r.k ? ' on' : ''}`}>{r.k}</button>
              ))}
            </span>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={slice} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="i" tick={{ fill: '#8A8CA8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (range === '7D' ? `D${v - slice[0].i + 1}` : range === '1M' ? `W${Math.floor((v - slice[0].i) / 7) + 1}` : `M${Math.floor((v - slice[0].i) / 30) + 1}`)} minTickGap={24} />
                <YAxis tick={{ fill: '#8A8CA8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[(lo * 0.97).toFixed(0), (hi * 1.03).toFixed(0)]} />
                <Tooltip contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="vol" fill="var(--surface-3)" radius={[2, 2, 0, 0]} />
                <Area type="monotone" dataKey="v" stroke="#6B0AEA" strokeWidth={2} fill="var(--primary-50)" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="tnum" style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>High <b style={{ color: 'var(--text-strong)' }}>${hi.toFixed(2)}</b></span>
            <span>Low <b style={{ color: 'var(--text-strong)' }}>${lo.toFixed(2)}</b></span>
            <span>TSG Valuation <b style={{ color: 'var(--text-strong)' }}>{o.lastRound ? `$${(o.lastRound.valuation / 1e9).toFixed(1)}B` : '—'}</b></span>
          </div>
        </div>

        <div className="ticker" aria-label="Enterprise software ticker">
          <div className="ticker__track">
            {[...opportunities.filter((x) => x.sector === 'Enterprise Software'), ...opportunities.filter((x) => x.sector !== 'Enterprise Software').slice(0, 3)].map((t) => (
              <span key={t._id} className="tick-item"><b>{t.name}</b><span className="tnum">{t.tsgPrice ? `$${t.tsgPrice.toFixed(2)}` : 'N/A'}</span>
                {t.priceChange1Y != null && <span className={t.priceChange1Y >= 0 ? 'up' : 'down'}>{t.priceChange1Y}%</span>}</span>
            ))}
          </div>
        </div>
      </section>

      {/* C · Funding */}
      <section id="sec-funding" ref={(el) => { refs.current.funding = el; }} style={{ display: 'grid', gap: 12, scrollMarginTop: 108 }}>
        <div className="card">
          <b style={{ color: 'var(--text-strong)' }}>Funding history</b>
          <div className="timeline" style={{ marginTop: 12 }}>
            {ext.rounds.map((r) => (
              <div key={r.round} style={{ position: 'relative' }}>
                <span className="timeline__dot" />
                <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 13 }}>{r.round} · {r.date}</div>
                <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {r.raised > 0 ? `${fmtMoney(r.raised)} raised · ` : ''}${(r.valuation / 1e9).toFixed(1)}B post-money{r.pps > 0 && ` · $${r.pps.toFixed(2)}/share`}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ overflowX: 'auto' }}>
          <b style={{ color: 'var(--text-strong)' }}>Round details</b>
          <table className="grid compact-table" style={{ marginTop: 8, minWidth: 760 }}>
            <thead><tr><th>Date</th><th>Round</th><th>Raised</th><th>Price/Share</th><th>Post-Money</th><th>Key Investors</th><th>Liquidation</th></tr></thead>
            <tbody>
              {ext.rounds.map((r) => (
                <tr key={r.round}>
                  <td className="tnum">{r.date}</td><td><b style={{ color: 'var(--text-strong)' }}>{r.round}</b></td>
                  <td className="tnum">{r.raised > 0 ? fmtMoney(r.raised) : '—'}</td>
                  <td className="tnum">{r.pps > 0 ? `$${r.pps.toFixed(2)}` : '—'}</td>
                  <td className="tnum">${(r.valuation / 1e9).toFixed(1)}B</td>
                  <td style={{ fontSize: 12 }}>{r.investors.join(', ')}</td><td style={{ fontSize: 12 }}>{r.liquidation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* D · Company Details */}
      <section id="sec-company" ref={(el) => { refs.current.company = el; }} style={{ display: 'grid', gap: 12, scrollMarginTop: 108 }}>
        <div className="card">
          <b style={{ color: 'var(--text-strong)' }}>About {o.name}</b>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>{ext.overview}</p>
          <div className="kpis" style={{ marginTop: 12 }}>
            <div className="kpi"><small>Sector</small><b style={{ fontSize: 14 }}>{o.sector}</b></div>
            <div className="kpi"><small>Subsector</small><b style={{ fontSize: 14 }}>{o.subSector}</b></div>
            <div className="kpi"><small>Headquarters</small><b style={{ fontSize: 14 }}>{ext.hq}</b></div>
            <div className="kpi"><small>Founded</small><b style={{ fontSize: 14 }}>{ext.founded}</b></div>
            <div className="kpi"><small>Website</small><b style={{ fontSize: 14 }}>{ext.website}</b></div>
          </div>
        </div>
        <div className="card">
          <div className="subtabs" style={{ marginBottom: 10 }}>
            {(['investors', 'leadership', 'board'] as const).map((s) => (
              <button key={s} onClick={() => setSub(s)} className={`chip${sub === s ? ' on' : ''}`} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
          {sub === 'investors' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{ext.investors.map((i) => <span key={i} className="pill pill-neutral">{i}</span>)}</div>}
          {sub === 'leadership' && (
            <table className="grid compact-table"><thead><tr><th>Name</th><th>Role</th></tr></thead>
              <tbody>{ext.leadership.map((l) => <tr key={l.name}><td><b style={{ color: 'var(--text-strong)' }}>{l.name}</b></td><td>{l.role}</td></tr>)}</tbody></table>
          )}
          {sub === 'board' && (
            <table className="grid compact-table"><thead><tr><th>Board member</th></tr></thead>
              <tbody>{ext.board.map((b) => <tr key={b}><td><b style={{ color: 'var(--text-strong)' }}>{b}</b></td></tr>)}</tbody></table>
          )}
        </div>
      </section>

      {/* E · FAQs */}
      <section id="sec-faqs" ref={(el) => { refs.current.faqs = el; }} style={{ display: 'grid', gap: 12, scrollMarginTop: 108 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }} className="faq-grid">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Buyer FAQs</div>
            {buyerFaqs.map((f) => <Acc key={f.q} q={f.q} a={f.a} open={openFaq === `b${f.q}`} onToggle={() => setOpenFaq(openFaq === `b${f.q}` ? null : `b${f.q}`)} />)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Seller FAQs</div>
            {sellerFaqs.map((f) => <Acc key={f.q} q={f.q} a={f.a} open={openFaq === `s${f.q}`} onToggle={() => setOpenFaq(openFaq === `s${f.q}` ? null : `s${f.q}`)} />)}
          </div>
        </div>
      </section>

      {/* F · News */}
      <section id="sec-news" ref={(el) => { refs.current.news = el; }} style={{ display: 'grid', gap: 8, scrollMarginTop: 108 }}>
        <b style={{ color: 'var(--text-strong)' }}>News & highlights</b>
        <div className="grid-posts" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
          {news.map((n, i) => (
            <div key={i} className="card" style={{ padding: 12 }}>
              <span className="pill pill-brand">{n.source}</span>
              <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 13, marginTop: 8 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={12} /> {n.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* G · Similar matrix */}
      <section id="sec-similar" ref={(el) => { refs.current.similar = el; }} style={{ display: 'grid', gap: 8, scrollMarginTop: 108 }}>
        <b style={{ color: 'var(--text-strong)' }}>Similar companies</b>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="grid compact-table" style={{ minWidth: 760 }}>
            <thead><tr><th>Company</th><th>TSG Price</th><th>Last Matched</th><th>Last Round</th><th>Valuation</th><th>Price/Share</th><th>Raised</th></tr></thead>
            <tbody>
              {peers.map((p) => {
                const e = companyExt[p._id];
                const lr = e.rounds[0];
                return (
                  <tr key={p._id}>
                    <td><Link to={`/opportunities/${p._id}`} style={{ fontWeight: 700, color: 'var(--text-strong)', textDecoration: 'none' }}>{p.name}</Link></td>
                    <td className="tnum">{p.tsgPrice ? `$${p.tsgPrice.toFixed(2)}` : '—'}</td>
                    <td className="tnum">{e.lastMatched ? `$${e.lastMatched.toFixed(2)}` : '—'}</td>
                    <td>{lr.round}</td>
                    <td className="tnum">${(lr.valuation / 1e9).toFixed(1)}B</td>
                    <td className="tnum">{lr.pps > 0 ? `$${lr.pps.toFixed(2)}` : '—'}</td>
                    <td className="tnum">{lr.raised > 0 ? fmtMoney(lr.raised) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* H · regulatory footer */}
      <div style={{ fontSize: 11, color: 'var(--text-subtle)', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <b>Regulatory & legal.</b> TerminaOne is a design-reference build. All prices, rounds and company data shown are illustrative sample data, not offers, quotes or investment advice.
        Secondary transactions are subject to company transfer restrictions, fund-manager consent and applicable securities regulations.
        <span style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          <Link to="/insights" className="link-more" style={{ fontSize: 11 }}>Terms of Use</Link>
          <Link to="/insights" className="link-more" style={{ fontSize: 11 }}>Privacy Policy</Link>
          <Link to="/insights" className="link-more" style={{ fontSize: 11 }}>Disclosures</Link>
          <span>© 2026 TerminaOne</span>
        </span>
      </div>

      {/* print profile */}
      <div className="print-only" aria-hidden="true">
        <h1>{o.name} — Company Profile</h1>
        <p>{ext.overview} Sector: {o.sector} / {o.subSector}. HQ: {ext.hq}. Founded: {ext.founded}. Website: {ext.website}.</p>
        <p>TSG Price: {o.tsgPrice ? `$${o.tsgPrice.toFixed(2)}` : 'N/A'} · Last matched: {ext.lastMatched ? `$${ext.lastMatched}` : 'N/A'} · Activity: {o.activity}</p>
        <table><thead><tr><th>Date</th><th>Round</th><th>Raised</th><th>PPS</th><th>Valuation</th><th>Investors</th></tr></thead>
          <tbody>{ext.rounds.map((r) => <tr key={r.round}><td>{r.date}</td><td>{r.round}</td><td>{r.raised}</td><td>{r.pps}</td><td>{r.valuation}</td><td>{r.investors.join(', ')}</td></tr>)}</tbody></table>
        <p>Investors: {ext.investors.join(', ')}. Leadership: {ext.leadership.map((l) => `${l.name} (${l.role})`).join(', ')}. Board: {ext.board.join(', ')}.</p>
        <p>Illustrative sample data — not investment advice.</p>
      </div>
      <style>{`@media (max-width: 900px){ .faq-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

export function CompanyNotice() {
  const [off, setOff] = useState(false);
  if (off) return null;
  return (
    <div className="notice-banner no-print" style={{ marginBottom: 14 }}>
      <TriangleAlert size={15} color="var(--warning)" style={{ flex: 'none', marginTop: 2 }} />
      <span><b>Trading notice:</b> secondary transfers need company ROFR waiver + fund-manager consent. Windows open per fund — check Data Room before expressing interest.</span>
      <button onClick={() => setOff(true)} aria-label="Dismiss">✕</button>
    </div>
  );
}
