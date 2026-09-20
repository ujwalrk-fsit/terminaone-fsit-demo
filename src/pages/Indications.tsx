import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { indications as seed, funds, opportunities, accounts } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';
import { BankPanel, SignPad } from '../components/BankSign';

const LS_IOI = 'tsg.iois';
function loadLocal() {
  try { const r = localStorage.getItem(LS_IOI); if (r) return JSON.parse(r); } catch { /* */ }
  return [];
}

export function Indications() {
  const auth = useSelector((s: RootState) => s.auth);
  const [filter, setFilter] = useState('');
  const local = loadLocal();
  const all = [...local, ...seed].filter((i) => !auth.user || auth.user.roleGroup !== 'investor' || i.investorUserId === auth.user.sub);
  const list = all.filter((i) => !filter || i.status === filter);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-extrabold">Indications (mock IOI book)</h1>
      <Link to="/indications/new" className="ml-auto rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white">New indication</Link></div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border p-2 text-sm">
        <option value="">All statuses</option>
        {['DRAFT','PAYMENT_PROCESSING','SUBSCRIBED','AWAITING_APPROVAL','AWAITING_SIGNATURE','APPROVED','REJECTED','ALLOCATED'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {list.length === 0 ? <Empty text="No indications (edge case). Create one." /> :
        <div className="space-y-2">{list.map((i) => {
          const f = funds.find((x) => x._id === i.fundId);
          return <Card key={i._id}><div className="font-mono text-sm">{i._id} · {f?.fundName} · {i.numberOfUnits} units · ${i.investmentAmount.toLocaleString()} · <b>{i.status}</b></div></Card>;
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
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold">New indication — {fund.fundName}</h1>
      <div className="text-xs text-slate-500">Step {Math.min(step, 5)} of 5 {proof && '· proof attached'} {sig && `· signed (${sig.mode})`}</div>
      {step === 1 && <Card><div className="font-bold">1. Account</div>
        <select value={fundId} onChange={(e) => setFundId(e.target.value)} className="mt-2 w-full rounded border p-2 text-sm">
          {funds.filter((f) => f.status === 'live' || f.status === 'upcoming').map((f) => <option key={f._id} value={f._id}>{f.fundName} ({f.status})</option>)}
        </select>
        <div className="mt-2 text-sm">Onboarding account: {myAccounts[0]?._id} ({myAccounts[0]?.status})</div>
        <button className="mt-3 rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white" onClick={() => setStep(2)}>Continue</button></Card>}
      {step === 2 && <Card><div className="font-bold">2. Units / amount</div>
        <input type="number" min={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="mt-2 w-full rounded border p-2" />
        <div className="mt-1 text-sm">Amount: <b>${amount.toLocaleString()}</b> (min ${fund.minimumInvestment.toLocaleString()})</div>
        {amount < fund.minimumInvestment && <div className="text-sm text-red-600">Below minimum (validation edge case).</div>}
        <div className="mt-3 flex gap-2"><button className="rounded border px-3 py-2 text-sm" onClick={() => setStep(1)}>Back</button>
        <button disabled={amount < fund.minimumInvestment} className="rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => setStep(3)}>Continue</button></div></Card>}
      {step === 3 && <Card><div className="font-bold">3. Bank transfer + proof</div>
        <div className="mt-2"><BankPanel bank={fund.bankDetails} indicationId={`draft-${units}`} onConfirmed={(u) => setProof(u)} /></div>
        <div className="mt-3 flex gap-2"><button className="rounded border px-3 py-2 text-sm" onClick={() => setStep(2)}>Back</button>
        <button disabled={!proof} className="rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => setStep(4)}>Continue</button></div></Card>}
      {step === 4 && <Card><div className="font-bold">4. Native e-sign (investor leg; advisor/FM legs mocked in Documents)</div>
        <div className="mt-2"><SignPad onSign={(url, mode) => setSig({ url, mode })} /></div>
        {sig && <div className="text-xs">Captured ✓ <a href={sig.url} target="_blank" rel="noreferrer" className="underline">preview</a></div>}
        <div className="mt-3 flex gap-2"><button className="rounded border px-3 py-2 text-sm" onClick={() => setStep(3)}>Back</button>
        <button disabled={!sig} className="rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => setStep(5)}>Continue</button></div></Card>}
      {step === 5 && <Card><div className="font-bold">5. Review & submit</div>
        <div className="mt-1 text-sm">Fund: {fund.fundName} · Units: {units} · Amount: ${amount.toLocaleString()} · Proof: {proof ? 'attached' : 'missing'} · Signed: {sig ? sig.mode : 'no'}</div>
        <div className="mt-3 flex gap-2"><button className="rounded border px-3 py-2 text-sm" onClick={() => setStep(4)}>Back</button>
        <button className="rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white" onClick={submit}>Submit indication (mock)</button></div></Card>}
      {step === 6 && <Card><div className="font-bold">Submitted ✓ (mock, persisted to localStorage tsg.iois)</div><Link to="/indications" className="text-sm underline">Back to list</Link></Card>}
    </div>
  );
}
