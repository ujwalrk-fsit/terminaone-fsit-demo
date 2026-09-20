import { useState } from 'react';
import { docs as docRows, signatures as sigRows, transfers as transferRows, notices as noticeRows } from '../data/sample';
import { Card, Empty } from '../components/Shell';
import { SignPad } from '../components/BankSign';

export function Documents() {
  const [sigs, setSigs] = useState(sigRows);
  const [showPad, setShowPad] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Documents</h1>
      <div className="grid-opp">
        {docRows.map((d) => <Card key={d._id}><div style={{ font: '700 15px var(--font-display)', color: 'var(--text-strong)' }}>{d.title}</div><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>v{d.version} · {d.status} · sign: {d.requiresSignature ? 'yes' : 'no'}</div></Card>)}
      </div>
      <h2 style={{ font: '700 18px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Signing inbox <span style={{ font: '400 12px var(--font-body)', color: 'var(--text-subtle)' }}>(investor→advisor→fund_manager)</span></h2>
      {sigs.length === 0 ? <Empty text="No signature requests." /> : sigs.map((s) => (
        <Card key={s._id}>
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{s._id} · <b style={{ color: 'var(--text-strong)' }}>{s.status}</b> · {s.stage} · order {s.currentOrder} · expires {s.expiresAt}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>{s.recipients.map((r) => `${r.role}#${r.order}:${r.status}`).join(' → ')}</div>
          <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setShowPad(showPad === s._id ? null : s._id)}>Sign current leg</button>
          {showPad === s._id && <div style={{ marginTop: 8 }}><SignPad onSign={(url) => {
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
    <div style={{ display: 'grid', gap: 12 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Transfers</h1>
      {transferRows.map((t) => <Card key={t._id}><div className="tnum" style={{ fontFamily: 'monospace', fontSize: 13 }}>{t._id} · {t.reference} · ${t.totalAmount.toLocaleString()} {t.currency} · <b style={{ color: 'var(--text-strong)' }}>{t.status}</b></div></Card>)}
    </div>
  );
}

export function Notifications() {
  const [list, setList] = useState(noticeRows);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Notifications</h1>
      {list.map((n) => <Card key={n._id}><div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{n.title} {!n.isRead && <span style={{ fontSize: 11, color: 'var(--info)' }}>● new</span>}</div><div style={{ fontSize: 13 }}>{n.body}</div>
      <button className="link-more" style={{ marginTop: 4, fontSize: 12 }} onClick={() => setList((p) => p.map((x) => x._id === n._id ? { ...x, isRead: true } : x))}>Mark read</button></Card>)}
    </div>
  );
}

export function Settings() {
  return <div style={{ display: 'grid', gap: 12 }}><h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Settings</h1><Card><div style={{ fontSize: 13 }}>Profile, notification preferences and session timeout ({import.meta.env.VITE_SESSION_TIMEOUT_MIN ?? 15} min).</div></Card></div>;
}
