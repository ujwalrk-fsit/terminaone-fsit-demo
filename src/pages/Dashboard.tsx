import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Info } from 'lucide-react';
import { SortTh, useSort, Pager, usePagination } from '../components/Tables';
import type { RootState } from '../store';
import { useColl } from '../db';
import type { FundOffering, Indication, InvestorAccount, Opportunity, Transfer } from '../types';
import { priceSeries } from '../data/company';
import { toggle } from '../store';
import { Card, Empty } from '../components/Shell';

function vwap(id: string, ref: number) {
  const s = priceSeries(id, ref, ref * 0.72).slice(-90);
  return s.reduce((a, p) => a + p.v, 0) / s.length;
}

export default function Dashboard() {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const opportunities = useColl<Opportunity>('opportunities');
  const funds = useColl<FundOffering>('funds');
  const indications = useColl<Indication>('indications');
  const accounts = useColl<InvestorAccount>('accounts');
  const transfers = useColl<Transfer>('transfers');
  const role = auth.user?.roleGroup;
  const watchIds = useSelector((s: RootState) => s.watch.ids);

  const withPrice = useMemo(() => opportunities.filter((o) => o.tsgPrice != null && o.priceChange1Y != null), [opportunities]);
  const gainers = [...withPrice].sort((a, b) => (b.priceChange1Y ?? 0) - (a.priceChange1Y ?? 0)).slice(0, 5);
  const losers = [...withPrice].sort((a, b) => (a.priceChange1Y ?? 0) - (b.priceChange1Y ?? 0)).slice(0, 5);
  const bids = [...indications].sort((a, b) => b.investmentAmount - a.investmentAmount).slice(0, 4);
  const asks = [...opportunities.filter((o) => o.tsgPrice != null)].sort((a, b) => (b.tsgPrice ?? 0) - (a.tsgPrice ?? 0)).slice(0, 4);
  const watched = opportunities.filter((o) => watchIds.includes(o._id));
  const wrows = watched.map((o) => ({ o, ...bidAskFor(o) }));
  const wGet = (r: { o: Opportunity } & ReturnType<typeof bidAskFor>, k: string): string | number => {
    if (k === 'company') return r.o.name;
    if (k === 'bid') return r.high ?? -1;
    if (k === 'ask') return r.ask ?? -1;
    if (k === 'vwap') return r.w ?? -1;
    if (k === 'price') return r.o.tsgPrice ?? -1;
    return '';
  };
  const [wsorted, wsk, wdir, wsort] = useSort(wrows, 'price', -1, wGet);
  const [wpaged, wpage, wpages, wsetPage, wtotal] = usePagination(wsorted, 8);
  const queue = indications.filter((i) => ['AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'SUBSCRIBED', 'PAYMENT_PROCESSING'].includes(i.status));
  const txns = transfers.slice(0, 4);
  const oppOf = (i: Indication) => opportunities.find((o) => o._id === i.opportunityId) ?? opportunities.find((o) => o.fundId === i.fundId);

  const bidAskFor = (o: Opportunity) => {
    const rel = indications.filter((i) => i.opportunityId === o._id || (o.fundId && i.fundId === o.fundId));
    const units = rel.reduce((a, i) => a + i.numberOfUnits, 0);
    const amt = rel.reduce((a, i) => a + i.investmentAmount, 0);
    const high = units > 0 ? amt / units : null;
    const ask = o.tsgPrice != null ? o.tsgPrice * 1.03 : null;
    const lfr = o.lastRound?.pps ?? null;
    const w = o.tsgPrice != null ? vwap(o._id, o.tsgPrice) : null;
    return { high, ask, lfr, w };
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Dashboard</h2>
        <span className="pill pill-neutral">{role}</span>
      </div>

      {role === 'investor' && !accounts.some((a) => a.userId === auth.user?.sub && a.status !== 'DRAFT') && (
        <div className="notice-banner">
          <span><b>Setup incomplete.</b> Finish your investment account to move indications to allocation.</span>
          <Link to="/onboarding" className="link-more" style={{ fontSize: 12, marginLeft: 'auto' }}>Continue setup</Link>
        </div>
      )}

      {(role === 'admin' || role === 'fund_manager') && queue.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>Approvals queue ({queue.length})</div>
          {queue.slice(0, 4).map((q) => {
            const f = funds.find((x) => x._id === q.fundId);
            return <div key={q._id} className="tnum" style={{ fontSize: 12, padding: '3px 0', borderTop: '1px solid var(--border-subtle)' }}>{q._id} · {f?.fundName} · ${q.investmentAmount.toLocaleString()} · <b>{q.status}</b></div>;
          })}
          <Link to="/admin" className="link-more" style={{ fontSize: 12, marginTop: 4 }}>Open admin <ArrowRight size={14} /></Link>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 12 }} className="dash-grid">
        <Card>
          <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>7-Day Biggest Price Movers</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
            <div>
              {gainers.map((o) => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                  <Link to={`/opportunities/${o._id}`} style={{ color: 'var(--text-default)', textDecoration: 'none' }}>{o.name}</Link>
                  <span className="tnum up">+{o.priceChange1Y}%</span>
                </div>
              ))}
            </div>
            <div>
              {losers.map((o) => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                  <span style={{ color: 'var(--text-default)' }}>{o.name}</span>
                  <span className="tnum down">{o.priceChange1Y}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Largest Bids and Asks</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>Bid</div>
              {bids.map((b) => {
                const o = oppOf(b);
                const per = b.numberOfUnits > 0 ? b.investmentAmount / b.numberOfUnits : 0;
                return (
                  <div key={b._id} className="tnum" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                    <span>{o?.name ?? b.fundId}</span><span>${per.toFixed(2)} · ${b.investmentAmount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>Ask</div>
              {asks.map((o) => {
                const f = funds.find((x) => x._id === o.fundId);
                return (
                  <div key={o._id} className="tnum" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                    <span>{o.name}</span><span>${o.tsgPrice?.toFixed(2)} · ${Math.round((f?.offeringSize ?? 0) * 0.15).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Watchlist Activity</b>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-subtle)' }}>Updated today, 09:30 IST</span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, marginTop: 6, flexWrap: 'wrap' }}>
          <b style={{ color: 'var(--text-strong)', borderBottom: '2px solid var(--brand-blue)', paddingBottom: 4 }}>{txns.length} New Secondary Transactions</b>
          <span style={{ color: 'var(--text-subtle)' }}>{funds.filter((f) => f.status === 'live').length} Live Funds</span>
          <span style={{ color: 'var(--text-subtle)' }}>{indications.length} Total IOIs</span>
          <span style={{ color: 'var(--text-subtle)' }}>{queue.length} Updated IOIs</span>
        </div>
        {txns.length === 0 ? <Empty text="No transactions yet." /> : (
          <div style={{ overflowX: 'auto', marginTop: 6 }} className="dtable">
            <table className="grid compact-table" style={{ minWidth: 720 }}>
              <thead><tr><th>Company</th><th>Date</th><th>Transaction Size</th><th>Price</th><th>Quantity</th><th>Price vs 90-Day VWAP</th><th>Actions</th></tr></thead>
              <tbody>
                {txns.map((t) => {
                  const ind = indications.find((i) => i._id === t.indicationId);
                  const o = ind ? oppOf(ind) : undefined;
                  const units = ind?.numberOfUnits ?? 0;
                  const px = units > 0 ? t.totalAmount / units : 0;
                  const w = o?.tsgPrice != null ? vwap(o._id, o.tsgPrice) : null;
                  const vs = w ? ((px - w) / w) * 100 : null;
                  return (
                    <tr key={t._id}>
                      <td><b style={{ color: 'var(--text-strong)' }}>{o?.name ?? t.indicationId}</b></td>
                      <td className="tnum">{t.createdAt}</td>
                      <td className="tnum">${t.totalAmount.toLocaleString()}</td>
                      <td className="tnum">${px.toFixed(2)}</td>
                      <td className="tnum">{units.toLocaleString()}</td>
                      <td className={`tnum ${vs != null && vs >= 0 ? 'up' : 'down'}`}>{vs != null ? `${vs >= 0 ? '+' : ''}${vs.toFixed(0)}%` : '—'}</td>
                      <td><Link to="/indications/new" className="link-more" style={{ fontSize: 12 }}>Submit IOI</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Watchlists</b>
          <Link to="/watchlist" className="btn btn-ghost" style={{ marginLeft: 'auto' }}>Manage</Link>
        </div>
        {watched.length === 0 ? <Empty text="Your watchlist is empty." hint="Add companies from any opportunity page." /> : (
          <>
            <div style={{ overflowX: 'auto', marginTop: 6 }} className="dtable tall">
            <table className="grid compact-table" style={{ minWidth: 860 }}>
              <thead><tr>
                <SortTh label="Company" k="company" sk={wsk} dir={wdir} onSort={wsort} />
                <th>Sector</th>
                <SortTh label="Highest Bid" k="bid" sk={wsk} dir={wdir} onSort={wsort} />
                <SortTh label="Lowest Ask" k="ask" sk={wsk} dir={wdir} onSort={wsort} />
                <th>% vs LFR <Info size={11} style={{ display: 'inline' }} /></th>
                <SortTh label="90-Day VWAP" k="vwap" sk={wsk} dir={wdir} onSort={wsort} />
                <SortTh label="TSG Price" k="price" sk={wsk} dir={wdir} onSort={wsort} />
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {wpaged.map(({ o, high, ask, lfr, w }) => {
                  const vsLfr = lfr && o.tsgPrice ? ((o.tsgPrice - lfr) / lfr) * 100 : null;
                  return (
                    <tr key={o._id}>
                      <td><Link to={`/opportunities/${o._id}`} style={{ fontWeight: 700, color: 'var(--text-strong)', textDecoration: 'none' }}>{o.name}</Link></td>
                      <td>{o.sector}</td>
                      <td className="tnum">{high != null ? `$${high.toFixed(2)}` : '—'}</td>
                      <td className="tnum">{ask != null ? `$${ask.toFixed(2)}` : '—'}</td>
                      <td className={`tnum ${vsLfr != null && vsLfr >= 0 ? 'up' : 'down'}`}>{vsLfr != null ? `${vsLfr >= 0 ? '+' : ''}${vsLfr.toFixed(0)}%` : '—'}</td>
                      <td className="tnum">{w != null ? `$${w.toFixed(2)}` : '—'}</td>
                      <td className="tnum"><b>${o.tsgPrice?.toFixed(2) ?? '—'}</b></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Link to={`/indications/new?opp=${o._id}`} className="link-more" style={{ fontSize: 12 }}>Submit IOI</Link>{' '}
                        <button onClick={() => dispatch(toggle(o._id))} aria-label={`Remove ${o.name}`} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-subtle)' }}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={wpage} pages={wpages} total={wtotal} onPage={wsetPage} />
          </>
        )}
      </Card>
      <style>{`@media (max-width: 1000px){ .dash-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
