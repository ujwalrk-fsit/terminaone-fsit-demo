import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import type { RootState } from '../store';
import { indications as seed, funds, opportunities, accounts } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';
import { BankPanel, SignPad } from '../components/BankSign';

const LS_IOI = 'tsg.iois';
function loadLocal() {
  try { const r = localStorage.getItem(LS_IOI); if (r) return JSON.parse(r); } catch { /* */ }
  return [];
}

const STATUSES = ['DRAFT', 'PAYMENT_PROCESSING', 'SUBSCRIBED', 'AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'APPROVED', 'REJECTED', 'ALLOCATED'];

export function Indications() {
  const auth = useSelector((s: RootState) => s.auth);
  const [filter, setFilter] = useState('');
  const local = loadLocal();
  const all = [...local, ...seed].filter((i) => !auth.user || auth.user.roleGroup !== 'investor' || i.investorUserId === auth.user.sub);
  const list = all.filter((i) => !filter || i.status === filter);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Indications <span style={{ font: '400 12px var(--font-body)', color: 'var(--text-subtle)' }}>(mock IOI book)</span></h2>
        <Link to="/indications/new" className="btn btn-primary">New indication</Link>
      </div>
      <div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ height: 40, padding: '0 12px' }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty text="No indications (edge case). Create one." /> :
        <div style={{ display: 'grid', gap: 8 }}>{list.map((i) => {
          const f = funds.find((x) => x._id === i.fundId);
          return <Card key={i._id}><div className="tnum" style={{ fontFamily: 'monospace', fontSize: 13 }}>{i._id} · {f?.fundName} · {i.numberOfUnits} units · ${i.investmentAmount.toLocaleString()} · <b style={{ color: '#fff' }}>{i.status}</b></div></Card>;
        })}</div>}
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
  const fund = funds.find((f) => f._id === fundId)!;
  const opp = opportunities.find((o) => o._id === (params.get('opp') ?? fund.opportunityId));
  const amount = useMemo(() => units * fund.offerPricePerUnit, [units, fund]);
  const myAccounts = accounts.filter((a) => a.userId === (auth.user?.sub ?? 'u_inv1'));

  const submit = () => {
    const rec = { _id: `i_local_${Date.now()}`, investorUserId: auth.user?.sub ?? 'u_inv1', investorAccountId: myAccounts[0]?._id ?? 'a_inv1', fundId, opportunityId: opp?._id, numberOfUnits: units, investmentAmount: amount, status: 'AWAITING_APPROVAL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), proofUrl: proof };
    const prev = loadLocal(); localStorage.setItem(LS_IOI, JSON.stringify([rec, ...prev]));
    setStep(6);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gap: 16 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: '#fff', margin: 0 }}>New indication — {fund.fundName}</h1>
      <div className="wizard-steps" aria-hidden="true">{[1, 2, 3, 4, 5].map((s) => <i key={s} className={s <= Math.min(step, 5) ? 'on' : ''} />)}</div>
      <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Step {Math.min(step, 5)} of 5 · Account → Units → Transfer → Sign → Review {proof && '· proof ✓'} {sig && `· signed (${sig.mode}) ✓`}</div>
      {step === 1 && <Card><div style={{ font: '700 15px var(--font-display)', color: '#fff' }}>1. Account</div>
        <select value={fundId} onChange={(e) => setFundId(e.target.value)} style={{ marginTop: 8, width: '100%', padding: 10 }}>
          {funds.filter((f) => f.status === 'live' || f.status === 'upcoming').map((f) => <option key={f._id} value={f._id}>{f.fundName} ({f.status})</option>)}
        </select>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>Onboarding account: {myAccounts[0]?._id} ({myAccounts[0]?.status})</div>
        <div style={{ marginTop: 12 }}><button className="btn btn-primary" onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 2 && <Card><div style={{ font: '700 15px var(--font-display)', color: '#fff' }}>2. Units / amount</div>
        <input type="number" min={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} style={{ marginTop: 8, width: '100%', padding: 10 }} aria-label="Number of units" />
        <div className="tnum" style={{ marginTop: 8, fontSize: 13 }}>Amount: <b style={{ color: '#fff' }}>${amount.toLocaleString()}</b> (min ${fund.minimumInvestment.toLocaleString()})</div>
        {amount < fund.minimumInvestment && <div style={{ fontSize: 13, color: 'var(--danger)' }}>Below minimum (validation edge case).</div>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
        <button disabled={amount < fund.minimumInvestment} className="btn btn-primary" onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 3 && <Card><div style={{ font: '700 15px var(--font-display)', color: '#fff', marginBottom: 8 }}>3. Bank transfer + proof</div>
        <BankPanel bank={fund.bankDetails} indicationId={`draft-${units}`} onConfirmed={(u) => setProof(u)} />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
        <button disabled={!proof} className="btn btn-primary" onClick={() => setStep(4)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 4 && <Card><div style={{ font: '700 15px var(--font-display)', color: '#fff', marginBottom: 8 }}>4. Native e-sign <span style={{ font: '400 12px var(--font-body)', color: 'var(--text-subtle)' }}>(investor leg; advisor/FM legs in Documents)</span></div>
        <SignPad onSign={(url, mode) => setSig({ url, mode })} />
        {sig && <div style={{ fontSize: 12 }}>Captured ✓ <a href={sig.url} target="_blank" rel="noreferrer" className="link-more">preview</a></div>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
        <button disabled={!sig} className="btn btn-primary" onClick={() => setStep(5)}>Continue <ArrowRight size={16} /></button></div></Card>}
      {step === 5 && <Card><div style={{ font: '700 15px var(--font-display)', color: '#fff' }}>5. Review & submit</div>
        <div className="tnum" style={{ marginTop: 8, fontSize: 13 }}>Fund: {fund.fundName} · Units: {units} · Amount: ${amount.toLocaleString()} · Proof: {proof ? 'attached ✓' : 'missing'} · Signed: {sig ? sig.mode : 'no'}</div>
        <div className="risk-note" style={{ marginTop: 12 }}><b>Before you submit:</b> this interest is non-binding until fund approval. Private interests are illiquid (mock disclosure).</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn btn-ghost" onClick={() => setStep(4)}>Back</button>
        <button className="btn btn-primary" onClick={submit}>Submit indication (mock)</button></div></Card>}
      {step === 6 && <Card><div style={{ font: '700 15px var(--font-display)', color: 'var(--signal)' }}>Submitted ✓ (mock, persisted to localStorage tsg.iois)</div><Link to="/indications" className="link-more" style={{ marginTop: 8 }}>Back to list <ArrowRight size={16} /></Link></Card>}
    </div>
  );
}
