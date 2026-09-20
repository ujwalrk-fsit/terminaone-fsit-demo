import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useColl, upsert, remove, resetDb } from '../db';
import type { AppUser, DocItem, NoticeItem, SignatureRequest, Transfer } from '../types';
import { dataActivity } from '../data/sample';
import { actorName } from '../dataRoom';
import { Card, Empty } from '../components/Shell';
import { SignPad } from '../components/BankSign';
import { useTheme, toggleTheme } from '../theme';

const input = { padding: '8px 10px', width: '100%' } as const;

export function Documents() {
  const docs = useColl<DocItem>('docs');
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const canUpload = role === 'admin' || role === 'fund_manager' || role === 'advisor';
  const [sigs, setSigs] = useState<SignatureRequest[]>(() => {
    try {
      const r = localStorage.getItem('tsg.signatures');
      if (r) return JSON.parse(r);
    } catch { /* */ }
    return [
      { _id: 's_1', documentId: 'd_1', indicationId: 'i_3', status: 'IN_PROGRESS', stage: 'WAITING_FOR_ADVISOR', recipients: [{ role: 'investor', order: 1, status: 'COMPLETED', signedAt: '2026-09-05' }, { role: 'advisor', order: 2, status: 'PENDING' }, { role: 'fund_manager', order: 3, status: 'PENDING' }], currentOrder: 2, expiresAt: '2026-10-05', reminderCount: 1 },
    ] as SignatureRequest[];
  });
  const [showPad, setShowPad] = useState<string | null>(null);
  const [showUp, setShowUp] = useState(false);
  const [up, setUp] = useState({ title: '', type: 'personal' as DocItem['documentType'], sign: false });

  const persistSigs = (next: SignatureRequest[]) => {
    setSigs(next);
    try { localStorage.setItem('tsg.signatures', JSON.stringify(next)); } catch { /* */ }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Documents</h2>
        {canUpload && <button className="btn btn-primary" style={{ height: 34 }} onClick={() => setShowUp((s) => !s)}>Upload</button>}
      </div>

      {showUp && canUpload && (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <input style={input} placeholder="Document title" value={up.title} onChange={(e) => setUp({ ...up, title: e.target.value })} />
            <select style={input} value={up.type} onChange={(e) => setUp({ ...up, type: e.target.value as DocItem['documentType'] })}>
              {['subscription', 'offering', 'account', 'compliance', 'legal', 'personal', 'content'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginTop: 8 }}>
            <input type="checkbox" checked={up.sign} onChange={(e) => setUp({ ...up, sign: e.target.checked })} /> Requires signature
          </label>
          <div style={{ marginTop: 8 }}><button className="btn btn-primary" disabled={!up.title.trim()}
            onClick={() => {
              upsert('docs', { _id: `d_${Date.now()}`, title: up.title.trim(), category: up.type, documentType: up.type, status: 'active', version: 1, updatedAt: new Date().toISOString().slice(0, 10), requiresSignature: up.sign });
              setUp({ title: '', type: 'personal', sign: false }); setShowUp(false);
            }}>Publish v1</button></div>
        </Card>
      )}

      <div className="grid-opp">
        {docs.map((d) => (
          <Card key={d._id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <b style={{ color: 'var(--text-strong)', fontSize: 14 }}>{d.title}</b>
              <span style={{ marginLeft: 'auto' }} className={`pill ${d.status === 'active' ? 'pill-live' : d.status === 'draft' ? 'pill-neutral' : 'pill-info'}`}>{d.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>v{d.version} · {d.documentType} · {d.updatedAt} · sign: {d.requiresSignature ? 'yes' : 'no'}</div>
            {canUpload && <button className="link-more" style={{ fontSize: 12, marginTop: 6 }} onClick={() => remove('docs', d._id)}>Archive</button>}
          </Card>
        ))}
      </div>

      <h2 className="page-h" style={{ fontSize: 17 }}>Signing inbox <span className="sub">(investor → advisor → fund manager)</span></h2>
      {sigs.length === 0 ? <Empty text="No signature requests." /> : sigs.map((s) => (
        <Card key={s._id}>
          <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{s._id} · <b style={{ color: 'var(--text-strong)' }}>{s.status}</b> · {s.stage} · order {s.currentOrder} · expires {s.expiresAt}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>{s.recipients.map((r) => `${r.role}#${r.order}:${r.status}`).join(' → ')}</div>
          {s.status !== 'COMPLETED' ? (
            <>
              <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setShowPad(showPad === s._id ? null : s._id)}>Sign current leg</button>
              {showPad === s._id && <div style={{ marginTop: 8 }}><SignPad onSign={(url) => {
                persistSigs(sigs.map((p) => p._id === s._id ? {
                  ...p,
                  recipients: p.recipients.map((r) => r.order === p.currentOrder ? { ...r, status: 'COMPLETED' as const, signedAt: new Date().toISOString().slice(0, 10), signatureDataUrl: url } : r),
                  currentOrder: p.currentOrder + 1,
                  stage: p.currentOrder + 1 > 3 ? 'ALL_SIGNERS_DONE' as const : p.stage,
                  status: p.currentOrder + 1 > 3 ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
                } : p));
                setShowPad(null);
              }} /></div>}
            </>
          ) : <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>Completed ✓</div>}
        </Card>
      ))}
    </div>
  );
}

export function Transfers() {
  const transfers = useColl<Transfer>('transfers');
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="section-head" style={{ margin: 0 }}><h2>Transfers</h2><span className="pill pill-neutral">{transfers.length}</span></div>
      {transfers.map((t) => (
        <Card key={t._id}>
          <div className="tnum" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {t._id} · {t.reference} · ${t.totalAmount.toLocaleString()} {t.currency} · <b style={{ color: 'var(--text-strong)' }}>{t.status}</b>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{t.method} · {t.createdAt} · indication {t.indicationId}</div>
        </Card>
      ))}
      {transfers.length === 0 && <Empty text="No transfers yet. Transfers appear here after you confirm a bank payment." />}
    </div>
  );
}

export function Notifications() {
  const notices = useColl<NoticeItem>('notices');
  const unread = notices.filter((n) => !n.isRead).length;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Notifications {unread > 0 && <span className="pill pill-info">{unread} new</span>}</h2>
        {unread > 0 && <button className="btn btn-ghost" onClick={() => notices.filter((n) => !n.isRead).forEach((n) => upsert('notices', { ...n, isRead: true }))}>Mark all read</button>}
      </div>
      {notices.map((n) => (
        <Card key={n._id}>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 13 }}>{n.title} {!n.isRead && <span style={{ fontSize: 11, color: 'var(--info)' }}>● new</span>}</div>
          <div style={{ fontSize: 13 }}>{n.body}</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>{n.category} · {n.createdAt}</div>
          {!n.isRead && <button className="link-more" style={{ marginTop: 4, fontSize: 12 }} onClick={() => upsert('notices', { ...n, isRead: true })}>Mark read</button>}
        </Card>
      ))}
    </div>
  );
}

const PREFS_KEY = 'tsg.prefs';
const CATS = ['FUND_UPDATES', 'PORTFOLIO_UPDATES', 'WEBINAR_INVITATIONS'];
function loadPrefs(): Record<string, { email: boolean; inApp: boolean }> {
  try { const r = localStorage.getItem(PREFS_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return Object.fromEntries(CATS.map((c) => [c, { email: true, inApp: true }]));
}

export function Settings() {
  const auth = useSelector((s: RootState) => s.auth);
  const users = useColl<AppUser>('users');
  const me = users.find((u) => u._id === auth.user?.sub);
  const [name, setName] = useState({ first: me?.firstName ?? '', last: me?.lastName ?? '' });
  const [prefs, setPrefs] = useState(loadPrefs);
  const theme = useTheme();
  const flip = (cat: string, ch: 'email' | 'inApp') => {
    const next = { ...prefs, [cat]: { ...prefs[cat], [ch]: !prefs[cat][ch] } };
    setPrefs(next);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* */ }
  };
  return (
    <div style={{ display: 'grid', gap: 10, maxWidth: 640 }}>
      <h1 className="page-h">Settings</h1>
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input style={{ padding: 10 }} value={name.first} onChange={(e) => setName({ ...name, first: e.target.value })} placeholder="First name" />
          <input style={{ padding: 10 }} value={name.last} onChange={(e) => setName({ ...name, last: e.target.value })} placeholder="Last name" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 6 }}>{me?.emailId} · {me?.roleGroup}</div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary" disabled={!me}
          onClick={() => { if (me) upsert('users', { ...me, firstName: name.first || me.firstName, lastName: name.last || me.lastName }); }}>
          Save profile</button></div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Notification preferences</div>
        {CATS.map((c) => (
          <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ flex: 1 }}>{c.replace(/_/g, ' ').toLowerCase()}</span>
            <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}><input type="checkbox" checked={prefs[c]?.email ?? true} onChange={() => flip(c, 'email')} /> Email</label>
            <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}><input type="checkbox" checked={prefs[c]?.inApp ?? true} onChange={() => flip(c, 'inApp')} /> In-app</label>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Appearance & session</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
          <button className="btn btn-ghost" onClick={toggleTheme}>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</button>
          <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>Auto sign-out after {import.meta.env.VITE_SESSION_TIMEOUT_MIN ?? 15} min idle.</span>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>Reference data</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Restore all lists, users and rooms to their original sample state.</div>
        <div style={{ marginTop: 8 }}><button className="btn btn-ghost" onClick={() => { resetDb(); window.location.reload(); }}>Reset demo data</button></div>
      </Card>
    </div>
  );
}

export function ActivityLog() {
  return (
    <Card>
      <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>Recent activity</div>
      {dataActivity.slice(0, 6).map((a) => (
        <div key={a._id} style={{ fontSize: 12, padding: '4px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <b>{actorName(a.actor)}</b> {a.action} <b>{a.target}</b> <span style={{ color: 'var(--text-subtle)' }}>· {a.createdAt}</span>
        </div>
      ))}
    </Card>
  );
}
