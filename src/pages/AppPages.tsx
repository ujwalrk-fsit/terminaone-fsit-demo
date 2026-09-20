import { useState } from 'react';
import { docs as seedDocs, signatures as seedSig, transfers as seedT, notices as seedN } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';
import { SignPad } from '../components/BankSign';

export function Documents() {
  const [sigs, setSigs] = useState(seedSig);
  const [showPad, setShowPad] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Documents (mock, no S3/SignNow)</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {seedDocs.map((d) => <Card key={d._id}><div className="font-bold">{d.title}</div><div className="text-xs">v{d.version} · {d.status} · sign: {d.requiresSignature ? 'yes' : 'no'}</div></Card>)}
      </div>
      <h2 className="font-bold">Signing inbox — multi-party mock (investor→advisor→fund_manager)</h2>
      {sigs.length === 0 ? <Empty text="No signature requests." /> : sigs.map((s) => (
        <Card key={s._id}>
          <div className="font-mono text-sm">{s._id} · {s.status} · {s.stage} · order {s.currentOrder} · expires {s.expiresAt}</div>
          <div className="mt-1 text-sm">{s.recipients.map((r) => `${r.role}#${r.order}:${r.status}`).join(' → ')}</div>
          <button className="mt-2 rounded border px-2 py-1 text-sm" onClick={() => setShowPad(showPad === s._id ? null : s._id)}>Sign current leg (mock)</button>
          {showPad === s._id && <div className="mt-2"><SignPad onSign={(url) => {
            setSigs((prev) => prev.map((p) => p._id === s._id ? { ...p, recipients: p.recipients.map((r) => r.order === p.currentOrder ? { ...r, status: 'COMPLETED' as const, signedAt: new Date().toISOString(), signatureDataUrl: url } : r), currentOrder: p.currentOrder + 1, stage: p.currentOrder + 1 > 3 ? 'ALL_SIGNERS_DONE' as const : p.stage, status: p.currentOrder + 1 > 3 ? 'COMPLETED' as const : 'IN_PROGRESS' as const } : p));
            setShowPad(null);
          }} /></div>}
        </Card>
      ))}
    </div>
  );
}

export function Transfers() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Transfers — bank history (mock, Stripe removed)</h1>
      <div className="space-y-2">{seedT.map((t) => <Card key={t._id}><div className="font-mono text-sm">{t._id} · {t.reference} · ${t.totalAmount.toLocaleString()} {t.currency} · {t.status}</div></Card>)}</div>
    </div>
  );
}

export function Notifications() {
  const [list, setList] = useState(seedN);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-extrabold">Notifications (mock in-app)</h1>
      {list.map((n) => <Card key={n._id}><div className="font-bold">{n.title} {!n.isRead && <span className="text-xs text-blue-600">● new</span>}</div><div className="text-sm">{n.body}</div>
      <button className="text-xs underline" onClick={() => setList((p) => p.map((x) => x._id === n._id ? { ...x, isRead: true } : x))}>Mark read</button></Card>)}
    </div>
  );
}

export function Settings() {
  return <div className="space-y-3"><h1 className="text-2xl font-extrabold">Settings (mock)</h1><Card><div className="text-sm">Profile, notification preferences, session timeout demo ({import.meta.env.VITE_SESSION_TIMEOUT_MIN ?? 15} min). Persisted to localStorage in this build.</div></Card></div>;
}
