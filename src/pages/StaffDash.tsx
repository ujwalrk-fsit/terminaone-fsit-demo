import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useColl } from '../db';
import type { FundOffering, Indication, AppUser } from '../types';
import { fmtCompact, fmtMoney } from '../format';
import { hashStr, mulberry } from '../data/company';
import { actorName } from '../dataRoom';
import { Card } from '../components/Shell';
import { ExpandBtn } from '../components/Tables';
import type { RoleGroup } from '../types';

type Bucket = 'Submitted' | 'Approved' | 'Subscribed' | 'Allocated' | 'Rejected';
const BUCKET_COLOR: Record<Bucket, string> = {
  Submitted: '#c37d0d', Approved: '#3772cf', Subscribed: '#0f6f8c', Allocated: '#1ba673', Rejected: '#d45656',
};

function bucketOf(i: Indication): Bucket {
  if (i.status === 'ALLOCATED') return 'Allocated';
  if (i.status === 'SUBSCRIBED') return 'Subscribed';
  if (i.status === 'REJECTED') return 'Rejected';
  if (i.status === 'APPROVED' || i.status === 'AWAITING_APPROVAL' || i.status === 'AWAITING_SIGNATURE') return 'Approved';
  return 'Submitted';
}

function monthly(status: string, total: number, months = 60) {
  const rnd = mulberry(hashStr(`pipeline-${status}`));
  const shaped = Array.from({ length: months }, (_, i) => (0.3 + rnd()) * (0.4 + 0.6 * (i / months)));
  const sum = shaped.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return shaped.map((w, i) => {
    acc += (w / sum) * total;
    const d = new Date(2026, 8 - (months - 1 - i), 1);
    return { m: d.toLocaleDateString('en-US', { month: 'short' }), v: Math.round(acc) };
  });
}

const RANGES = [{ k: '1M', n: 3 }, { k: '1Y', n: 12 }, { k: '5Y', n: 60 }, { k: 'Max', n: 60 }] as const;

function KpiBanner({ cells }: { cells: { label: string; value: string; subs: [string, string][] }[] }) {
  return (
    <div className="card" style={{ background: 'var(--hero-bg)', color: '#fff', border: 0, display: 'grid', gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))`, gap: 16 }} >
      {cells.map((c, i) => (
        <div key={c.label} style={{ borderLeft: i === 0 ? 0 : '1px solid rgba(255,255,255,.18)', paddingLeft: i === 0 ? 0 : 16 }}>
          <div style={{ fontSize: 13, color: '#b7c5e0' }}>{c.label}</div>
          <div className="tnum" style={{ fontSize: 26, fontWeight: 600, color: '#fff' }}>{c.value}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
            {c.subs.map(([k, v]) => (
              <span key={k} style={{ fontSize: 12, color: '#b7c5e0' }}>{k} <b className="tnum" style={{ color: '#fff' }}>{v}</b></span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Awaiting({ rows, funds }: { rows: Indication[]; funds: FundOffering[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Card>
      <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 14, marginBottom: 8 }}>Awaiting Indication Approvals</div>
      {rows.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Queue clear.</div> : (
        <table className="grid compact-table">
          <thead><tr><th>Fund Name</th><th>Quantity</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.slice(0, 6).map((i) => {
              const f = funds.find((x) => x._id === i.fundId);
              const isOpen = open === i._id;
              return [
                <tr key={i._id}>
                  <td><b style={{ color: 'var(--text-strong)' }}>{f?.fundName}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{actorName(i.investorUserId)} · {i.status}</div></td>
                  <td className="tnum">{i.numberOfUnits}</td>
                  <td className="tnum">${i.investmentAmount.toLocaleString()}</td>
                  <td className="tnum">{i.createdAt}</td>
                  <td><ExpandBtn open={isOpen} onClick={() => setOpen(isOpen ? null : i._id)} label={`Review ${i._id}`} /></td>
                </tr>,
                ...(isOpen ? [(
                  <tr key={`${i._id}-x`}>
                    <td colSpan={5} style={{ background: 'var(--surface-2)', fontSize: 12 }}>
                      Account {i.investorAccountId} · proof {i.proofUrl ? <a href={i.proofUrl} target="_blank" rel="noreferrer" className="link-more" style={{ fontSize: 12 }}>attached</a> : 'missing'} ·{' '}
                      <Link to="/ledger" className="link-more" style={{ fontSize: 12 }}>Decide in Fund Ledger</Link>
                    </td>
                  </tr>
                )] : []),
              ];
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function OutcomeDonut({ title, slices }: { title: string; slices: { name: string; value: number; color: string }[] }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <Card>
      <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ height: 170 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} strokeWidth={2} stroke="var(--surface-1)" paddingAngle={2}>
              {slices.map((s) => <Cell key={s.name} fill={s.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#16233c', border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Geist Mono, monospace', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
        {slices.map((s) => (
          <div key={s.name} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: s.color, flex: 'none' }} />
            <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.name}</span>
            <span className="tnum" style={{ color: 'var(--text-strong)' }}>{fmtMoney(s.value)} ({Math.round((s.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Analytics({ buckets, totals }: { buckets: Bucket[]; totals: Record<Bucket, number> }) {
  const [rk, setRk] = useState<string>('1Y');
  const n = RANGES.find((r) => r.k === rk)!.n;
  const data = useMemo(() => {
    const series = buckets.map((b) => ({ b, pts: monthly(b, totals[b]) }));
    return series[0].pts.map((_, i) => {
      const row: Record<string, number | string> = { m: series[0].pts[i].m };
      series.forEach((s) => { row[s.b] = s.pts[i].v; });
      return row;
    }).slice(-n);
  }, [buckets.join(','), totals.Submitted, totals.Approved, totals.Subscribed, totals.Allocated, totals.Rejected, n]);
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Fund Analytics</b>
        <span style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          {buckets.map((b) => <span key={b} style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><span style={{ width: 8, height: 8, borderRadius: 9999, background: BUCKET_COLOR[b] }} />{b}</span>)}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {RANGES.map((r) => <button key={r.k} onClick={() => setRk(r.k)} className={`chip${rk === r.k ? ' on' : ''}`}>{r.k}</button>)}
        </span>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="m" tick={{ fill: '#64769a', fontSize: 10, fontFamily: 'Geist Mono, monospace' }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis tick={{ fill: '#64769a', fontSize: 10, fontFamily: 'Geist Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmtCompact(v)} width={52} />
            <Tooltip contentStyle={{ background: '#16233c', border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}
              formatter={((v: number, name: string) => [fmtMoney(v ?? 0), name]) as never} />
            {buckets.map((b) => <Line key={b} type="monotone" dataKey={b} stroke={BUCKET_COLOR[b]} strokeWidth={2} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function StaffDash({ role }: { role: RoleGroup }) {
  const funds = useColl<FundOffering>('funds');
  const indications = useColl<Indication>('indications');
  const users = useColl<AppUser>('users');
  const [yr, setYr] = useState('This Year');

  const inScope = yr === 'This Year' ? indications.filter((i) => i.createdAt.startsWith('2026')) : indications;
  const sum = (b: Bucket) => inScope.filter((i) => bucketOf(i) === b).reduce((a, i) => a + i.investmentAmount, 0);
  const cnt = (b: Bucket) => inScope.filter((i) => bucketOf(i) === b).length;
  const totals: Record<Bucket, number> = {
    Submitted: sum('Submitted'), Approved: sum('Approved'), Subscribed: sum('Subscribed'),
    Allocated: sum('Allocated'), Rejected: sum('Rejected'),
  };
  const raised = funds.reduce((a, f) => a + (f.raised ?? 0), 0);
  const investors = users.filter((u) => u.roleGroup === 'investor');
  const tier = (t: string) => investors.filter((u) => (u.tier ?? 'Lite') === t);
  const ticket = (t: string) => {
    const ids = new Set(tier(t).map((u) => u._id));
    const amt = indications.filter((i) => ids.has(i.investorUserId)).reduce((a, i) => a + i.investmentAmount, 0);
    const n = tier(t).length || 1;
    return Math.round(amt / n);
  };
  const live = funds.filter((f) => f.status === 'live');
  const upcoming = funds.filter((f) => f.status === 'upcoming').length;
  const drafts = funds.filter((f) => f.status === 'draft').length;
  const closed = funds.filter((f) => f.status === 'closed').length;
  const active = live.length + funds.filter((f) => f.status === 'upcoming').length;
  const queue = indications.filter((i) => ['AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'SUBSCRIBED', 'PAYMENT_PROCESSING'].includes(i.status));
  const yrSel = (
    <select value={yr} onChange={(e) => setYr(e.target.value)} aria-label="Year range"
      style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
      <option>This Year</option><option>All Time</option>
    </select>
  );

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Dashboard</h2>
        <span>{yrSel}</span>
      </div>

      {role === 'admin' && (
        <KpiBanner cells={[
          { label: 'Total Funds Raised', value: fmtMoney(raised), subs: [['Lite', String(tier('Lite').length)], ['Plus', String(tier('Plus').length)], ['Pro', String(tier('Pro').length)]] },
          { label: 'Total Investors', value: String(investors.length), subs: [['Upcoming', String(upcoming)], ['Draft', String(drafts)], ['Closed', String(closed)]] },
          { label: 'Total Allocated', value: fmtMoney(totals.Allocated), subs: [['Queue', String(queue.length)], ['Approved', String(cnt('Approved'))]] },
        ]} />
      )}
      {(role === 'advisor' || role === 'affiliate') && (
        <KpiBanner cells={[
          { label: 'Total Funds Raised', value: fmtMoney(raised), subs: [['Plus', String(tier('Plus').length)], ['Pro', String(tier('Pro').length)]] },
          { label: 'Total Offerings', value: String(funds.filter((f) => f.status !== 'draft').length), subs: [['Active', String(active)], ['Closed', String(closed)]] },
          { label: 'Total Allocated', value: fmtMoney(totals.Allocated), subs: [['Queue', String(queue.length)]] },
        ]} />
      )}
      {(role === 'fund_manager' || role === 'monitor') && (
        <KpiBanner cells={[
          { label: 'Total Funds Raised', value: fmtMoney(raised), subs: [['Upcoming', String(upcoming)], ['Draft', String(drafts)], ['Closed', String(closed)]] },
          { label: 'Total Allocated', value: fmtMoney(totals.Allocated), subs: [['Subscribed', String(cnt('Subscribed'))]] },
        ]} />
      )}

      {role === 'admin' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 12 }} className="staff-grid">
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Investor Tier Funnel</b>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-subtle)' }}>{investors.length} registered this year</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginTop: 10 }}>
                {['Lite', 'Plus', 'Pro'].map((t) => {
                  const n = tier(t).length;
                  const pct = investors.length ? Math.round((n / investors.length) * 100) : 0;
                  return (
                    <div key={t} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t} Users</div>
                      <div className="tnum" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-strong)' }}>{n}</div>
                      <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
                      <div className="tnum" style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>{pct}% · avg {fmtMoney(ticket(t))}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Investment Pipeline</b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 8, marginTop: 10 }}>
                {(Object.keys(BUCKET_COLOR) as Bucket[]).map((b) => (
                  <div key={b} style={{ borderTop: `3px solid ${BUCKET_COLOR[b]}`, paddingTop: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b}</div>
                    <div className="tnum" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-strong)' }}>{cnt(b)}</div>
                    <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtMoney(totals[b])}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Analytics buckets={['Submitted', 'Approved', 'Rejected', 'Allocated']} totals={totals} />
          </div>
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <Card>
              <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>Offers Overview</b>
              <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                {live.slice(0, 3).map((f) => {
                  const pct = f.raised && f.offeringSize ? Math.min(100, Math.round((f.raised / f.offeringSize) * 100)) : 0;
                  const days = Math.max(0, Math.ceil((new Date(f.subscriptionEnd ?? '2026-12-31').getTime() - new Date('2026-09-13').getTime()) / 86400000));
                  return (
                    <div key={f._id}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <b style={{ color: 'var(--text-strong)', fontSize: 13 }}>{f.fundName}</b>
                        <span style={{ marginLeft: 'auto' }} className={`pill ${days <= 14 ? 'pill-warn' : 'pill-live'}`}>{days} Days Left</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{f.sector} Capital</div>
                      <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
                      <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                        <span><strong style={{ color: 'var(--success-text)' }}>{fmtMoney(f.raised ?? 0)}</strong> <span style={{ color: 'var(--text-subtle)' }}>raised</span></span>
                        <span><strong style={{ color: 'var(--text-strong)' }}>{fmtMoney(f.offeringSize)}</strong> <span style={{ color: 'var(--text-subtle)' }}>Offering Size</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/funds" className="link-more" style={{ fontSize: 12, marginTop: 10 }}>View all offerings</Link>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 12 }} className="staff-grid">
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <Awaiting rows={queue} funds={funds} />
            <Analytics
              buckets={(role === 'advisor' || role === 'affiliate') ? ['Submitted', 'Approved', 'Rejected'] : ['Subscribed', 'Allocated']}
              totals={totals}
            />
          </div>
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            {(role === 'advisor' || role === 'affiliate') ? (
              <OutcomeDonut title="Outcome Insights" slices={[
                { name: `Approved (${cnt('Approved')})`, value: totals.Approved, color: '#3772cf' },
                { name: `Rejected (${cnt('Rejected')})`, value: totals.Rejected, color: '#d45656' },
              ]} />
            ) : (
              <OutcomeDonut title="Outcome Insights" slices={[
                { name: `Subscribed (${cnt('Subscribed')})`, value: totals.Subscribed, color: '#0f6f8c' },
                { name: `Allocated (${cnt('Allocated')})`, value: totals.Allocated, color: '#1ba673' },
              ]} />
            )}
          </div>
        </div>
      )}
      <style>{`@media (max-width: 1100px){ .staff-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
