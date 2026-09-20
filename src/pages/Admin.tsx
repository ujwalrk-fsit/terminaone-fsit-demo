import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { users, funds, indications, articles, logs, opportunities } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';
import { Markdown } from '../components/Markdown';

function Denied() { return <Empty text="403 — admin, fund_manager or monitor only (edge case)." />; }

export default function Admin() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const [tab, setTab] = useState<'funds' | 'users' | 'roles' | 'indications' | 'cms' | 'logs'>('funds');
  const [cmsTab, setCmsTab] = useState<'articles' | 'opportunities'>('articles');
  const [body, setBody] = useState(articles[0].bodyMarkdown);
  if (!(role === 'admin' || role === 'fund_manager' || role === 'monitor')) return <Denied />;
  const ro = role === 'monitor';
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin console (mock back office)</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        {(['funds', 'users', 'roles', 'indications', 'cms', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded border px-2 py-1 ${tab === t ? 'bg-slate-900 text-white' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === 'funds' && (
        <div className="space-y-2">{funds.map((f) => (
          <Card key={f._id}><div className="font-bold">{f.fundName} <span className="text-xs font-normal">({f.status})</span></div>
          <div className="text-xs">min ${f.minimumInvestment.toLocaleString()} · price/unit ${f.offerPricePerUnit} · bank: {f.bankDetails ? `${f.bankDetails.bankName} ✓` : 'not uploaded (mock blocks transfers)'}</div>
          {!ro && <div className="mt-1 text-xs text-slate-500">Bank upload form is a Zod-validated mock in full build; persisted per fund (see IndicationNew BankPanel contract).</div>}</Card>
        ))}</div>
      )}
      {tab === 'users' && <Card><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((u) => <tr key={u._id} className="border-t"><td>{u.emailId}</td><td>{u.roleGroup}</td><td>{u.status}</td></tr>)}</tbody></table></Card>}
      {tab === 'roles' && <Card><div className="text-sm">RBAC matrix (collapsed: admin absorbs superadmin). Modules: USER_MANAGEMENT, FUND_OFFERINGS, INDICATIONS, DOCUMENTS, CMS, LOGS × CREATE/READ/UPDATE/DELETE. Full checkbox editor is a Phase-1 stretch; contracts in README.</div></Card>}
      {tab === 'indications' && (
        <div className="space-y-2">{indications.filter((i) => ['AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'SUBSCRIBED', 'PAYMENT_PROCESSING'].includes(i.status)).map((i) => (
          <Card key={i._id}><div className="font-mono text-sm">{i._id} · {i.status} · ${i.investmentAmount.toLocaleString()} {i.proofUrl ? '· proof ✓' : ''}</div>
          {!ro && <div className="mt-1 flex gap-2 text-xs"><button className="rounded border px-2 py-1">Approve (mock)</button><button className="rounded border px-2 py-1">Reject (mock)</button><button className="rounded border px-2 py-1">Allocate (mock)</button></div>}</Card>
        ))}</div>
      )}
      {tab === 'cms' && (
        <div className="space-y-3">
          <div className="flex gap-2 text-sm">
            <button onClick={() => setCmsTab('articles')} className={`rounded border px-2 py-1 ${cmsTab === 'articles' ? 'bg-slate-900 text-white' : ''}`}>Articles & announcements</button>
            <button onClick={() => setCmsTab('opportunities')} className={`rounded border px-2 py-1 ${cmsTab === 'opportunities' ? 'bg-slate-900 text-white' : ''}`}>Opportunities market-data editor (merged)</button>
          </div>
          {cmsTab === 'articles' ? (
            <Card><div className="font-bold">Markdown editor (mock, replaces rich-text)</div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-2 w-full rounded border p-2 font-mono text-xs" />
            <div className="mt-2 rounded border p-3"><Markdown text={body} /></div></Card>
          ) : (
            <div className="space-y-2">{opportunities.slice(0, 5).map((o) => (
              <Card key={o._id}><div className="font-bold">{o.name} <span className="text-xs font-normal">rank #{o.rank} · {o.sector}</span></div>
              <div className="text-xs">TSG Price ${o.tsgPrice ?? 'N/A'} · QoQ {o.latestQoQ ?? '—'}% · points {o.quarterlyData.length} · last round {o.lastRound?.round ?? '—'}</div>
              {!ro && <div className="text-xs text-slate-500">Inline market-data edit (price/quarterly/round) is a mock form in full build; shape matches Opportunity type.</div>}</Card>
            ))}</div>
          )}
        </div>
      )}
      {tab === 'logs' && <Card><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Module</th><th>Action</th><th>By</th><th>At</th></tr></thead><tbody>{logs.map((l) => <tr key={l._id} className="border-t"><td>{l.module}</td><td>{l.action}</td><td className="font-mono">{l.performedBy}</td><td>{l.createdAt}</td></tr>)}</tbody></table><div className="mt-1 text-xs">TTL 3 years enforced in Phase-2 DB (see README).</div></Card>}
    </div>
  );
}
