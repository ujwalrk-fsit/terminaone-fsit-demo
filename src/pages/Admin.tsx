import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import type { RootState } from '../store';
import { users, funds, indications, articles, logs, opportunities } from '../data/sample';
import { Card, Empty } from '../components/Shell';
import { Markdown } from '../components/Markdown';
import { fmtMoney } from '../components/OppCard';

function Denied() { return <Empty text="403 — admin, fund_manager or monitor only (edge case)." />; }

export default function Admin() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const [tab, setTab] = useState<'funds' | 'users' | 'roles' | 'indications' | 'cms' | 'logs'>('funds');
  const [cmsTab, setCmsTab] = useState<'articles' | 'opportunities'>('articles');
  const [body, setBody] = useState(articles[0].bodyMarkdown);
  if (!(role === 'admin' || role === 'fund_manager' || role === 'monitor')) return <Denied />;
  const ro = role === 'monitor';
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)', margin: 0 }}>Admin console</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(['funds', 'users', 'roles', 'indications', 'cms', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`chip${tab === t ? ' on' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === 'funds' && (
        <div style={{ display: 'grid', gap: 8 }}>{funds.map((f) => (
          <Card key={f._id}><div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{f.fundName} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-subtle)' }}>({f.status})</span></div>
          <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>min ${f.minimumInvestment.toLocaleString()} · price/unit ${f.offerPricePerUnit} · raised {f.raised ? fmtMoney(f.raised) : '—'} · bank: {f.bankDetails ? `${f.bankDetails.bankName} ✓` : 'to be published'}</div>
          {!ro && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-subtle)' }}>Bank details are published per fund and shown to investors at checkout.</div>}</Card>
        ))}</div>
      )}
      {tab === 'users' && <Card><table className="grid"><thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((u) => <tr key={u._id}><td>{u.emailId}</td><td>{u.roleGroup}</td><td>{u.status}</td></tr>)}</tbody></table></Card>}
      {tab === 'roles' && <Card><div style={{ fontSize: 13 }}>Role matrix: admin, advisor, affiliate, fund_manager, monitor, investor. Modules: USER_MANAGEMENT, FUND_OFFERINGS, INDICATIONS, DOCUMENTS, CMS, LOGS × CREATE/READ/UPDATE/DELETE.</div></Card>}
      {tab === 'indications' && (
        <div style={{ display: 'grid', gap: 8 }}>{indications.filter((i) => ['AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'SUBSCRIBED', 'PAYMENT_PROCESSING'].includes(i.status)).map((i) => (
          <Card key={i._id}><div className="tnum" style={{ fontFamily: 'monospace', fontSize: 13 }}>{i._id} · {i.status} · ${i.investmentAmount.toLocaleString()} {i.proofUrl ? '· proof ✓' : ''}</div>
          {!ro && <div style={{ marginTop: 8, display: 'flex', gap: 8 }}><button className="chip">Approve</button><button className="chip">Reject</button><button className="chip">Allocate</button></div>}</Card>
        ))}</div>
      )}
      {tab === 'cms' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setCmsTab('articles')} className={`chip${cmsTab === 'articles' ? ' on' : ''}`}>Articles & announcements</button>
            <button onClick={() => setCmsTab('opportunities')} className={`chip${cmsTab === 'opportunities' ? ' on' : ''}`}>Opportunities market-data editor (merged)</button>
          </div>
          {cmsTab === 'articles' ? (
            <Card><div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>Markdown editor</div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} style={{ marginTop: 8, width: '100%', padding: 10, fontFamily: 'monospace', fontSize: 12 }} />
            <div style={{ marginTop: 8, border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}><Markdown text={body} /></div></Card>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>{opportunities.slice(0, 5).map((o) => (
              <Card key={o._id}><div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{o.name} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-subtle)' }}>rank #{o.rank} · {o.sector}</span></div>
              <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>TSG Price ${o.tsgPrice ?? 'N/A'} · QoQ {o.latestQoQ ?? '—'}% · points {o.quarterlyData.length} · last round {o.lastRound?.round ?? '—'}</div>
              {!ro && <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Inline editing for price, quarterly points and funding rounds.</div>}</Card>
            ))}</div>
          )}
        </div>
      )}
      {tab === 'logs' && <Card><table className="grid"><thead><tr><th>Module</th><th>Action</th><th>By</th><th>At</th></tr></thead><tbody>{logs.map((l) => <tr key={l._id}><td>{l.module}</td><td>{l.action}</td><td style={{ fontFamily: 'monospace' }}>{l.performedBy}</td><td>{l.createdAt}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-subtle)' }}>Audit trail retained for 3 years. <span className="link-more" style={{ fontSize: 12 }}>Export <ArrowRight size={14} /></span></div></Card>}
    </div>
  );
}
