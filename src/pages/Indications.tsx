import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Info } from 'lucide-react';
import type { RootState } from '../store';
import { useColl, upsert } from '../db';
import type { Indication, FundOffering, Opportunity, InvestorAccount } from '../types';
import { priceSeries } from '../data/company';
import { Card, Empty } from '../components/Shell';
import { BankPanel, SignPad } from '../components/BankSign';
import { Avatar, ExpandBtn, SortTh, TableTabs, Pager, Toolbar, toCsv, usePagination, useSort } from '../components/Tables';
import { actorName } from '../dataRoom';

export function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function vwap(id: string, ref: number) {
  const s = priceSeries(id, ref, ref * 0.72).slice(-90);
  return s.reduce((a, p) => a + p.v, 0) / s.length;
}

export function Indications() {
  const auth = useSelector((s: RootState) => s.auth);
  const rows = useColl<Indication>('indications');
  const funds = useColl<FundOffering>('funds');
  const opportunities = useColl<Opportunity>('opportunities');
  const [scope, setScope] = useState('Mine');
  const [tq, setTq] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState<Record<string, number>>({});

  const mine = rows.filter((i) => !auth.user || auth.user.roleGroup !== 'investor' || i.investorUserId === auth.user.sub);
  const shown = scope === 'Mine' && auth.user ? mine.filter((i) => i.investorUserId === auth.user!.sub) : mine;
  const oppOf = (i: Indication) => opportunities.find((x) => x._id === i.opportunityId) ?? opportunities.find((x) => x.fundId === i.fundId);
  const q = tq.trim().toLowerCase();
  const live = shown.filter((i) => !['REJECTED', 'ALLOCATED'].includes(i.status)).filter((i) => {
    if (!q) return true;
    const o = oppOf(i);
    return (o?.name ?? '').toLowerCase().includes(q) || i.status.toLowerCase().includes(q) || i._id.toLowerCase().includes(q);
  });
  const buys = live.length;
  const get = (i: Indication, k: string): string | number => {
    const o = opportunities.find((x) => x._id === i.opportunityId) ?? opportunities.find((x) => x.fundId === i.fundId);
    const px = i.numberOfUnits > 0 ? i.investmentAmount / i.numberOfUnits : 0;
    switch (k) {
      case 'company': return o?.name ?? i.fundId;
      case 'by': return i.investorUserId === auth.user?.sub ? 'Me' : actorName(i.investorUserId);
      case 'price': return px;
      case 'qty': return i.numberOfUnits;
      case 'size': return i.investmentAmount;
      case 'tsg': return o?.tsgPrice ?? 0;
      case 'created': return i.createdAt;
      case 'updated': return i.updatedAt;
      default: return '';
    }
  };
  const [sorted, sk, dir, sort] = useSort(live, 'updated', -1, get);
  const [paged, page, pages, setPage, total] = usePagination(sorted, 8);

  const csv = () => toCsv('iois.csv',
    ['Company', 'Submitted By', 'Type', 'Price', 'Quantity', 'Size', 'TSG Price', 'Created', 'Updated', 'Status'],
    sorted.map((i) => {
      const o = oppOf(i);
      return [o?.name ?? i.fundId, i.investorUserId === auth.user?.sub ? 'Me' : actorName(i.investorUserId), 'Buy',
        (i.numberOfUnits > 0 ? i.investmentAmount / i.numberOfUnits : 0).toFixed(2), i.numberOfUnits,
        i.investmentAmount, o?.tsgPrice ?? '', i.createdAt, i.updatedAt, i.status];
    }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1 className="page-h">IOI Management</h1>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        IOIs not present here have been matched into a trade or canceled. You can{' '}
        <button className="link-more" style={{ fontSize: 12 }} onClick={csv}>download a CSV</button> of canceled and previously filled IOIs.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
        <div className="stat3"><small>Total IOIs</small><b>{live.length}</b></div>
        <div className="stat3"><small>Buys</small><b>{buys}</b></div>
        <div className="stat3"><small>Sells</small><b>0</b></div>
      </div>

      <TableTabs tabs={['Mine', 'All']} active={scope} onChange={(t) => { setScope(t); setPage(0); }} />
      <Toolbar search={tq} onSearch={(s) => { setTq(s); setPage(0); }} placeholder="Search company, status or ID…" onExport={csv} />

      {sorted.length === 0 ? <Empty text="No open IOIs." hint="Create one to get started, or clear the search." /> : (
        <div>
          <div className="dtable tall">
            <table className="grid" style={{ minWidth: 1080 }}>
            <thead><tr>
              <SortTh label="Company" k="company" sk={sk} dir={dir} onSort={sort} />
              <SortTh label="Submitted By" k="by" sk={sk} dir={dir} onSort={sort} />
              <th>Type</th>
              <SortTh label="Price" k="price" sk={sk} dir={dir} onSort={sort} />
              <SortTh label="Quantity" k="qty" sk={sk} dir={dir} onSort={sort} />
              <SortTh label="Size" k="size" sk={sk} dir={dir} onSort={sort} />
              <th>TSG Price <Info size={11} style={{ display: 'inline' }} /></th>
              <th>IOI vs 90D VWAP <Info size={11} style={{ display: 'inline' }} /></th>
              <SortTh label="Date Created" k="created" sk={sk} dir={dir} onSort={sort} />
              <SortTh label="Last Updated" k="updated" sk={sk} dir={dir} onSort={sort} />
              <th>Actions</th><th />
            </tr></thead>
            <tbody>
              {paged.map((i) => {
                const o = oppOf(i);
                const f = funds.find((x) => x._id === i.fundId);
                const px = i.numberOfUnits > 0 ? i.investmentAmount / i.numberOfUnits : 0;
                const w = o?.tsgPrice != null ? vwap(o._id, o.tsgPrice) : null;
                const vs = w ? ((px - w) / w) * 100 : null;
                const isOpen = open === i._id;
                const units = editUnits[i._id] ?? i.numberOfUnits;
                const cancellable = !['ALLOCATED', 'REJECTED'].includes(i.status);
                return [
                  <tr key={i._id}>
                    <td><b style={{ color: 'var(--text-strong)' }}>{o?.name ?? i.fundId}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{i.status}</div></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name={i.investorUserId === auth.user?.sub ? 'Me' : actorName(i.investorUserId)} />{i.investorUserId === auth.user?.sub ? 'Me' : actorName(i.investorUserId)}</span></td>
                    <td>Buy</td>
                    <td className="num">${px.toFixed(2)}</td>
                    <td className="num">{i.numberOfUnits.toLocaleString()}</td>
                    <td className="num">{fmtCompact(i.investmentAmount)}</td>
                    <td className="num">${o?.tsgPrice?.toFixed(2) ?? '—'}</td>
                    <td className={`num ${vs != null && vs >= 0 ? 'up' : 'down'}`}>
                      {vs != null ? `${vs >= 0 ? '+' : ''}$${Math.abs(px - (w ?? 0)).toFixed(2)} (${vs >= 0 ? '+' : ''}${vs.toFixed(0)}%)` : '—'}
                    </td>
                    <td className="num">{i.createdAt}</td>
                    <td className="num">{i.updatedAt}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {cancellable ? (
                        <>
                          <button className="link-more" style={{ fontSize: 12 }} onClick={() => { setOpen(isOpen ? null : i._id); setEditUnits({ ...editUnits, [i._id]: i.numberOfUnits }); }}>Update</button>{' '}
                          <button className="link-more" style={{ fontSize: 12, color: 'var(--danger)' }} onClick={() => upsert('indications', { ...i, status: 'REJECTED', updatedAt: new Date().toISOString().slice(0, 10) })}>Cancel</button>
                        </>
                      ) : <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{i.status}</span>}
                    </td>
                    <td><ExpandBtn open={isOpen} onClick={() => setOpen(isOpen ? null : i._id)} label={`Details for ${i._id}`} /></td>
                  </tr>,
                  ...(isOpen ? [(
                    <tr key={`${i._id}-x`}>
                      <td colSpan={12} style={{ background: 'var(--surface-2)' }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, alignItems: 'end' }}>
                          <span>Fund: <b>{f?.fundName}</b></span>
                          <span>Account: <b className="tnum">{i.investorAccountId}</b></span>
                          {i.proofUrl && <a className="link-more" style={{ fontSize: 12 }} href={i.proofUrl} target="_blank" rel="noreferrer">Transfer proof</a>}
                          {cancellable && (
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              Units:
                              <input type="number" min={1} value={units} onChange={(e) => setEditUnits({ ...editUnits, [i._id]: Number(e.target.value) })} style={{ width: 90, padding: '4px 6px' }} />
                              <button className="btn btn-accent" style={{ height: 30 }} onClick={() => {
                                const price = f?.offerPricePerUnit ?? px;
                                upsert('indications', { ...i, numberOfUnits: units, investmentAmount: Math.round(units * price), updatedAt: new Date().toISOString().slice(0, 10) });
                                setOpen(null);
                              }}>Save</button>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )] : []),
                ];
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} total={total} onPage={setPage} />
        </div>
      )}
      <div>
        <Link to="/indications/new" className="btn btn-accent">New indication</Link>
      </div>
    </div>
  );
}

// 5-step wizard: account -> units -> bank+proof -> native sign -> review/submit
export function IndicationNew() {
  const auth = useSelector((s: RootState) => s.auth);
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [fundId, setFundId] = useState(params.get('fund') ?? 'f_alpha_1');
  const [units, setUnits] = useState(100);
  const [proof, setProof] = useState('');
  const [sig, setSig] = useState<{ url: string; mode: string } | null>(null);
  const funds = useColl<FundOffering>('funds');
  const opportunities = useColl<Opportunity>('opportunities');
  const accounts = useColl<InvestorAccount>('accounts');
  const fund = funds.find((f) => f._id === fundId) ?? funds[0];
  const opp = opportunities.find((o) => o._id === (params.get('opp') ?? fund.opportunityId));
  const amount = useMemo(() => units * fund.offerPricePerUnit, [units, fund]);
  const myAccounts = accounts.filter((a) => a.userId === (auth.user?.sub ?? 'u_inv1'));

  const submit = () => {
    const rec: Indication = { _id: `i_${Date.now()}`, investorUserId: auth.user?.sub ?? 'u_inv1', investorAccountId: myAccounts[0]?._id ?? 'a_inv1', fundId, opportunityId: opp?._id, numberOfUnits: units, investmentAmount: amount, status: 'AWAITING_APPROVAL', createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10), proofUrl: proof };
    upsert('indications', rec);
    setStep(6);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>New indication — {fund.fundName}</h1>
      <div className="wizard-steps" aria-hidden="true">{[1, 2, 3, 4, 5].map((s) => <i key={s} className={s <= Math.min(step, 5) ? 'on' : ''} />)}</div>
      <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Step {Math.min(step, 5)} of 5 · Account → Units → Transfer → Sign → Review {proof && '· proof ✓'} {sig && `· signed (${sig.mode}) ✓`}</div>
      {step === 1 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)' }}>1. Account</div>
        <select value={fundId} onChange={(e) => setFundId(e.target.value)} style={{ marginTop: 8, width: '100%', padding: 10 }}>
          {funds.filter((f) => f.status === 'live' || f.status === 'upcoming').map((f) => <option key={f._id} value={f._id}>{f.fundName} ({f.status})</option>)}
        </select>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Onboarding account: {myAccounts[0]?._id} ({myAccounts[0]?.status})</div>
        {myAccounts[0]?.status !== 'ACTIVE' && <div style={{ marginTop: 6, fontSize: 13 }}><Link to="/onboarding" className="link-more">Complete account setup first</Link></div>}
        <div style={{ marginTop: 12 }}><button className="btn btn-accent" onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 2 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)' }}>2. Units / amount</div>
        <input type="number" min={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} style={{ marginTop: 8, width: '100%', padding: 10 }} aria-label="Number of units" />
        <div className="tnum" style={{ marginTop: 8, fontSize: 13 }}>Amount: <b style={{ color: 'var(--text-strong)' }}>${amount.toLocaleString()}</b> (min ${fund.minimumInvestment.toLocaleString()})</div>
        {amount < fund.minimumInvestment && <div style={{ fontSize: 13, color: 'var(--danger)' }}>Below minimum.</div>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
        <button disabled={amount < fund.minimumInvestment} className="btn btn-accent" onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 3 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)', marginBottom: 8 }}>3. Bank transfer + proof</div>
        <BankPanel bank={fund.bankDetails} indicationId={`draft-${units}`} onConfirmed={(u) => setProof(u)} />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
        <button disabled={!proof} className="btn btn-accent" onClick={() => setStep(4)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 4 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)', marginBottom: 8 }}>4. E-sign <span style={{ font: '400 12px var(--font-body)', color: 'var(--text-subtle)' }}>(investor leg; advisor and manager legs in Documents)</span></div>
        <SignPad onSign={(url, mode) => setSig({ url, mode })} />
        {sig && <div style={{ fontSize: 12 }}>Captured ✓ <a href={sig.url} target="_blank" rel="noreferrer" className="link-more">preview</a></div>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
        <button disabled={!sig} className="btn btn-accent" onClick={() => setStep(5)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 5 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)' }}>5. Review & submit</div>
        <div className="tnum" style={{ marginTop: 8, fontSize: 13 }}>Fund: {fund.fundName} · Units: {units} · Amount: ${amount.toLocaleString()} · Proof: {proof ? 'attached ✓' : 'missing'} · Signed: {sig ? sig.mode : 'no'}</div>
        <div className="risk-note" style={{ marginTop: 12 }}><b>Before you submit:</b> this interest is non-binding until fund approval. Private interests are illiquid.</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(4)}>Back</button>
        <button className="btn btn-accent" onClick={submit}>Submit indication</button></div></Card>}
      {step === 6 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--success)' }}>Submitted ✓ — your indication is now awaiting approval.</div><Link to="/indications" className="link-more" style={{ marginTop: 8 }}>Back to list <ArrowRight size={16} /></Link></Card>}
    </div>
  );
}
