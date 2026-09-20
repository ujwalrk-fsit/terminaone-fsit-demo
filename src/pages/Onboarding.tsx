import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import type { RootState } from '../store';
import { useColl, upsert } from '../db';
import type { InvestorAccount } from '../types';
import { Card } from '../components/Shell';

const input = { padding: '8px 10px', width: '100%' } as const;
const LS_DRAFT = 'tsg.onboard';
function loadDraft() {
  try { const r = localStorage.getItem(LS_DRAFT); if (r) return JSON.parse(r); } catch { /* */ }
  return {};
}

const STEPS = ['Profile', 'Address', 'Investment profile', 'Documents', 'Nominee', 'Review'];

export default function Onboarding() {
  const auth = useSelector((s: RootState) => s.auth);
  const accounts = useColl<InvestorAccount>('accounts');
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Record<string, string>>(loadDraft);
  const set = (k: string, v: string) => {
    const next = { ...d, [k]: v };
    setD(next);
    try { localStorage.setItem(LS_DRAFT, JSON.stringify(next)); } catch { /* */ }
  };
  const mine = accounts.find((a) => a.userId === (auth.user?.sub ?? ''));
  const done = mine && mine.status !== 'DRAFT';

  const finish = () => {
    const rec: InvestorAccount = {
      _id: mine?._id ?? `a_${Date.now()}`, userId: auth.user?.sub ?? 'u_inv1',
      accountType: (d.acctType ?? 'INDIVIDUAL') as InvestorAccount['accountType'],
      status: 'IN_REVIEW', stepKey: 'DONE', kycName: `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || undefined,
    };
    upsert('accounts', rec);
    try { localStorage.removeItem(LS_DRAFT); } catch { /* */ }
    setStep(6);
  };

  const req = (v?: string) => (v ?? '').trim().length > 0;
  const canNext =
    step === 0 ? req(d.firstName) && req(d.lastName) && req(d.phone) :
    step === 1 ? req(d.city) && req(d.country) :
    step === 2 ? req(d.income) && req(d.experience) :
    step === 3 ? d.pan === 'yes' && d.addr === 'yes' :
    step === 4 ? req(d.nominee) : true;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gap: 14 }}>
      <div>
        <h1 className="page-h">Investment account setup</h1>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
          {done ? `Status: ${mine?.status} · ${mine?._id}` : 'Complete the sections below. Drafts save automatically.'}
        </div>
      </div>
      <div className="wizard-steps">{STEPS.map((s, i) => <i key={s} className={i <= Math.min(step, 5) ? 'on' : ''} title={s} />)}</div>
      <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Section {Math.min(step + 1, 6)} of 6 — {STEPS[Math.min(step, 5)]}</div>

      {step === 0 && <Card><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={{ fontSize: 12 }}>First name<input style={input} autoComplete="given-name" value={d.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Last name<input style={input} autoComplete="family-name" value={d.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Date of birth<input style={input} type="date" autoComplete="bday" value={d.dob ?? ''} onChange={(e) => set('dob', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Phone<input style={input} autoComplete="tel" inputMode="tel" value={d.phone ?? ''} onChange={(e) => set('phone', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Account type<select style={input} value={d.acctType ?? 'INDIVIDUAL'} onChange={(e) => set('acctType', e.target.value)}>
          {['INDIVIDUAL', 'JOINT', 'LLC', 'TRUST', 'IRA'].map((a) => <option key={a}>{a}</option>)}
        </select></label>
      </div></Card>}

      {step === 1 && <Card><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={{ fontSize: 12, gridColumn: '1 / -1' }}>Street<input style={input} autoComplete="street-address" value={d.street ?? ''} onChange={(e) => set('street', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>City<input style={input} autoComplete="address-level2" value={d.city ?? ''} onChange={(e) => set('city', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Country<input style={input} autoComplete="country-name" value={d.country ?? ''} onChange={(e) => set('country', e.target.value)} /></label>
      </div></Card>}

      {step === 2 && <Card><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={{ fontSize: 12 }}>Annual income<select style={input} value={d.income ?? ''} onChange={(e) => set('income', e.target.value)}>
          <option value="">Select…</option><option>Under $100K</option><option>$100K – $500K</option><option>$500K – $2M</option><option>Above $2M</option>
        </select></label>
        <label style={{ fontSize: 12 }}>Net worth<select style={input} value={d.worth ?? ''} onChange={(e) => set('worth', e.target.value)}>
          <option value="">Select…</option><option>Under $1M</option><option>$1M – $5M</option><option>Above $5M</option>
        </select></label>
        <label style={{ fontSize: 12 }}>Investing experience<select style={input} value={d.experience ?? ''} onChange={(e) => set('experience', e.target.value)}>
          <option value="">Select…</option><option>Under 2 years</option><option>2 – 5 years</option><option>Above 5 years</option>
        </select></label>
        <label style={{ fontSize: 12 }}>Tax residency<select style={input} value={d.tax ?? 'Resident'} onChange={(e) => set('tax', e.target.value)}>
          <option>Resident</option><option>NRI / Non-resident</option>
        </select></label>
      </div></Card>}

      {step === 3 && <Card><div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
        {([['pan', 'PAN / government ID on file'], ['addr', 'Address proof on file'], ['bank', 'Cancelled cheque on file']] as const).map(([k, label]) => (
          <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={d[k] === 'yes'} onChange={(e) => set(k, e.target.checked ? 'yes' : 'no')} /> {label}
          </label>
        ))}
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>PAN and address proof are required to continue.</div>
      </div></Card>}

      {step === 4 && <Card><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={{ fontSize: 12 }}>Nominee name<input style={input} value={d.nominee ?? ''} onChange={(e) => set('nominee', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Relationship<input style={input} value={d.relation ?? ''} onChange={(e) => set('relation', e.target.value)} /></label>
      </div></Card>}

      {step === 5 && <Card>
        <div style={{ fontSize: 13, display: 'grid', gap: 4 }}>
          <div><b style={{ color: 'var(--text-strong)' }}>{d.firstName} {d.lastName}</b> · {d.city}, {d.country}</div>
          <div>Type {d.acctType ?? 'INDIVIDUAL'} · Income {d.income} · Experience {d.experience}</div>
          <div>Nominee: {d.nominee} ({d.relation})</div>
        </div>
        <div className="risk-note" style={{ marginTop: 10 }}><b>Declaration:</b> details provided are true to the best of my knowledge. Submissions move to review.</div>
      </Card>}

      {step === 6 && <Card>
        <div style={{ fontWeight: 700, color: 'var(--success)' }}>Submitted — your account is now in review.</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Link to="/opportunities" className="btn btn-primary">Browse opportunities <ArrowRight size={14} /></Link>
        </div>
      </Card>}

      {step < 6 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 5 && <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue <ArrowRight size={14} /></button>}
          {step === 5 && <button className="btn btn-primary" onClick={finish}>Submit for review</button>}
        </div>
      )}
    </div>
  );
}
