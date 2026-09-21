import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useColl, upsert, remove } from '../db';
import { useQueryState } from '../url';
import type { AppUser, FundOffering, FundStatus, Indication, Article, Opportunity, RoleGroup } from '../types';
import { logs } from '../data/sample';
import { fmtMoney } from '../components/OppCard';
import { Pager, usePagination } from '../components/Tables';
import { confirm } from '../components/Confirm';
import { announce } from '../components/Live';
import { Card, Empty } from '../components/Shell';

function Denied() { return <Empty text="403: admin, fund_manager or monitor only." />; }
const input = { padding: '8px 10px', width: '100%' } as const;
const H = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 14, marginBottom: 8 }}>{children}</div>
);

/* ---------- funds + bank details ---------- */
const BLANK_FUND: FundOffering = {
  _id: '', fundName: 'New Fund', fundType: 'equity', minimumInvestment: 25000,
  offerPricePerUnit: 100, offeringSize: 10000000, raised: 0, sector: 'Enterprise Software',
  subSector: 'Data Intelligence', status: 'draft', managers: [], affiliates: [], faqs: [], keyRisks: '',
};
function FundEditor({ f, onDone }: { f: FundOffering; onDone: () => void }) {
  const [v, setV] = useState<FundOffering>({ ...f, bankDetails: f.bankDetails ? { ...f.bankDetails } : undefined });
  const set = (k: keyof FundOffering, val: unknown) => setV({ ...v, [k]: val });
  const setBank = (k: string, val: string) => setV({ ...v, bankDetails: { ...(v.bankDetails ?? { bankName: '', accountName: '', accountNumber: '', routingCode: '', instructions: '', uploadedBy: 'u_admin', updatedAt: new Date().toISOString().slice(0, 10) }), [k]: val } });
  return (
    <Card>
      <H>{f._id ? `Edit: ${f.fundName}` : 'New fund'}</H>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <label style={{ fontSize: 12 }}>Name<input style={input} value={v.fundName} onChange={(e) => set('fundName', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Status<select style={input} value={v.status} onChange={(e) => set('status', e.target.value as FundStatus)}>
          {(['draft', 'upcoming', 'live', 'closed'] as FundStatus[]).map((s) => <option key={s}>{s}</option>)}
        </select></label>
        <label style={{ fontSize: 12 }}>Type<select style={input} value={v.fundType} onChange={(e) => set('fundType', e.target.value)}>
          {['equity', 'debt', 'real_estate', 'private_equity'].map((s) => <option key={s}>{s}</option>)}
        </select></label>
        <label style={{ fontSize: 12 }}>Min investment<input style={input} type="number" value={v.minimumInvestment} onChange={(e) => set('minimumInvestment', Number(e.target.value))} /></label>
        <label style={{ fontSize: 12 }}>Price / unit<input style={input} type="number" value={v.offerPricePerUnit} onChange={(e) => set('offerPricePerUnit', Number(e.target.value))} /></label>
        <label style={{ fontSize: 12 }}>Offering size<input style={input} type="number" value={v.offeringSize} onChange={(e) => set('offeringSize', Number(e.target.value))} /></label>
        <label style={{ fontSize: 12 }}>Raised<input style={input} type="number" value={v.raised ?? 0} onChange={(e) => set('raised', Number(e.target.value))} /></label>
        <label style={{ fontSize: 12 }}>Sector<input style={input} value={v.sector} onChange={(e) => set('sector', e.target.value)} /></label>
      </div>
      <H><span style={{ display: 'block', marginTop: 12 }}>Bank details (shown to investors at checkout)</span></H>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <label style={{ fontSize: 12 }}>Bank<input style={input} value={v.bankDetails?.bankName ?? ''} onChange={(e) => setBank('bankName', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Account name<input style={input} value={v.bankDetails?.accountName ?? ''} onChange={(e) => setBank('accountName', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Account no.<input style={input} value={v.bankDetails?.accountNumber ?? ''} onChange={(e) => setBank('accountNumber', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Routing<input style={input} value={v.bankDetails?.routingCode ?? ''} onChange={(e) => setBank('routingCode', e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>SWIFT<input style={input} value={v.bankDetails?.swift ?? ''} onChange={(e) => setBank('swift', e.target.value)} /></label>
        <label style={{ fontSize: 12, gridColumn: '1 / -1' }}>Instructions<textarea style={input} rows={2} value={v.bankDetails?.instructions ?? ''} onChange={(e) => setBank('instructions', e.target.value)} /></label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary" onClick={() => {
          const rec = v._id ? v : { ...v, _id: `f_${Date.now()}` };
          upsert('funds', rec); onDone();
        }}>Save fund</button>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </Card>
  );
}

/* ---------- users ---------- */
const ROLES: RoleGroup[] = ['admin', 'advisor', 'affiliate', 'fund_manager', 'monitor', 'investor'];
function UserManager({ me }: { me: string }) {
  const users = useColl<AppUser>('users');
  const [form, setForm] = useState({ firstName: '', lastName: '', emailId: '', roleGroup: 'investor' as RoleGroup, password: 'welcome123' });
  const [upaged, upage, upages, usetPage, utotal] = usePagination(users, 8);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="dtable">
        <table className="grid"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Tier</th><th>Status</th><th /></tr></thead>
          <tbody>
            {upaged.map((u) => (
              <tr key={u._id}>
                <td><b style={{ color: 'var(--text-strong)' }}>{u.firstName} {u.lastName}</b></td>
                <td>{u.emailId}</td>
                <td>
                  <select value={u.roleGroup} disabled={u._id === me} onChange={(e) => upsert('users', { ...u, roleGroup: e.target.value as RoleGroup })} style={{ padding: '4px 6px' }}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  {u.roleGroup === 'investor' ? (
                    <select value={u.tier ?? 'Lite'} onChange={(e) => upsert('users', { ...u, tier: e.target.value as 'Lite' | 'Plus' | 'Pro' })} style={{ padding: '4px 6px' }}>
                      {['Lite', 'Plus', 'Pro'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  ) : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                </td>
                <td>{u.status}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="chip" disabled={u._id === me} onClick={() => upsert('users', { ...u, status: u.status === 'active' ? 'deactivated' : 'active' })}>
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>{' '}
                  <button className="chip" disabled={u._id === me} onClick={async () => {
                    if (await confirm({ title: `Delete ${u.firstName} ${u.lastName}?`, body: 'This removes the user immediately. This cannot be undone.', confirmLabel: 'Delete user', danger: true })) {
                      remove('users', u._id); announce(`Deleted user ${u.emailId}.`);
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody></table>
      </div>
      <Pager page={upage} pages={upages} total={utotal} onPage={usetPage} />
      <Card>
        <H>Add user</H>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          <input style={input} placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input style={input} placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input style={input} placeholder="email" value={form.emailId} onChange={(e) => setForm({ ...form, emailId: e.target.value.toLowerCase() })} />
          <select style={input} value={form.roleGroup} onChange={(e) => setForm({ ...form, roleGroup: e.target.value as RoleGroup })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary" disabled={!form.emailId.includes('@') || !form.firstName}
          onClick={() => {
            upsert('users', { _id: `u_${Date.now()}`, firstName: form.firstName, lastName: form.lastName, emailId: form.emailId.toLowerCase(), roleGroup: form.roleGroup, roleId: `r_${form.roleGroup}`, status: 'active', password: form.password });
            setForm({ firstName: '', lastName: '', emailId: '', roleGroup: 'investor', password: 'welcome123' });
          }}>Create user</button></div>
      </Card>
    </div>
  );
}

/* ---------- roles matrix ---------- */
const MODULES = ['USER_MANAGEMENT', 'FUND_OFFERINGS', 'INDICATIONS', 'DOCUMENTS', 'CMS', 'LOGS'];
const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
const LS_ROLES = 'tsg.rolematrix';
function seedMatrix(): Record<string, Record<string, string[]>> {
  return {
    admin: Object.fromEntries(MODULES.map((m) => [m, [...ACTIONS]])),
    fund_manager: { USER_MANAGEMENT: [], FUND_OFFERINGS: ['READ', 'UPDATE'], INDICATIONS: ['READ', 'UPDATE'], DOCUMENTS: ['READ'], CMS: [], LOGS: ['READ'] },
    advisor: { USER_MANAGEMENT: [], FUND_OFFERINGS: ['READ'], INDICATIONS: ['READ'], DOCUMENTS: ['READ'], CMS: [], LOGS: [] },
    affiliate: { USER_MANAGEMENT: [], FUND_OFFERINGS: ['READ'], INDICATIONS: [], DOCUMENTS: [], CMS: [], LOGS: [] },
    monitor: Object.fromEntries(MODULES.map((m) => [m, ['READ']])),
    investor: { USER_MANAGEMENT: [], FUND_OFFERINGS: ['READ'], INDICATIONS: ['READ', 'CREATE'], DOCUMENTS: ['READ'], CMS: [], LOGS: [] },
  };
}
function RolesMatrix() {
  const [m, setM] = useState<Record<string, Record<string, string[]>>>(() => {
    try { const r = localStorage.getItem(LS_ROLES); if (r) return JSON.parse(r); } catch { /* */ }
    return seedMatrix();
  });
  const flip = (role: string, mod: string, act: string) => {
    const cur = m[role]?.[mod] ?? [];
    const next = { ...m, [role]: { ...m[role], [mod]: cur.includes(act) ? cur.filter((a) => a !== act) : [...cur, act] } };
    setM(next);
    try { localStorage.setItem(LS_ROLES, JSON.stringify(next)); } catch { /* */ }
  };
  return (
    <Card>
      <div style={{ overflowX: 'auto' }}>
        <table className="grid compact-table" style={{ minWidth: 640 }}>
          <thead><tr><th>Role \ Module</th>{MODULES.map((x) => <th key={x}>{x}</th>)}</tr></thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r}>
                <td><b style={{ color: 'var(--text-strong)' }}>{r}</b></td>
                {MODULES.map((mod) => (
                  <td key={mod}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ACTIONS.map((a) => (
                        <label key={a} style={{ fontSize: 11, display: 'flex', gap: 3, alignItems: 'center', cursor: 'pointer' }} title={`${a} ${mod}`}>
                          <input type="checkbox" checked={(m[r]?.[mod] ?? []).includes(a)} onChange={() => flip(r, mod, a)} />{a[0]}
                        </label>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>C = create, R = read, U = update, D = delete. Changes save automatically.</div>
    </Card>
  );
}

/* ---------- indications queue ---------- */
function Queue() {
  const indications = useColl<Indication>('indications');
  const funds = useColl<FundOffering>('funds');
  const list = indications.filter((i) => !['DRAFT', 'ALLOCATED', 'REJECTED'].includes(i.status));
  const set = (i: Indication, status: Indication['status']) =>
    upsert('indications', { ...i, status, updatedAt: new Date().toISOString().slice(0, 10) });
  if (list.length === 0) return <Empty text="Queue clear. Nothing awaiting action." />;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {list.map((i) => {
        const f = funds.find((x) => x._id === i.fundId);
        return (
          <Card key={i._id}>
            <div className="tnum" style={{ fontSize: 13 }}>
              <b style={{ color: 'var(--text-strong)' }}>{f?.fundName}</b> · {i.numberOfUnits} units · ${i.investmentAmount.toLocaleString()} · <b>{i.status}</b>
              {i.proofUrl && <> · <a href={i.proofUrl} target="_blank" rel="noreferrer" className="link-more" style={{ fontSize: 12 }}>proof</a></>}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="chip" onClick={() => set(i, 'APPROVED')}>Approve</button>
              <button className="chip" onClick={() => set(i, 'REJECTED')}>Reject</button>
              <button className="chip" onClick={() => set(i, 'ALLOCATED')}>Allocate</button>
              {i.status !== 'AWAITING_SIGNATURE' && <button className="chip" onClick={() => set(i, 'AWAITING_SIGNATURE')}>Request signature</button>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- CMS ---------- */
function Cms() {
  const articles = useColl<Article>('articles');
  const [sel, setSel] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', category: 'GUIDES', status: 'draft' as 'draft' | 'published', bodyMarkdown: '' });
  const cur = articles.find((a) => a._id === sel);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {articles.map((a) => (
        <Card key={a._id}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <b style={{ color: 'var(--text-strong)' }}>{a.title}</b>
            <span className={`pill ${a.status === 'published' ? 'pill-live' : 'pill-neutral'}`}>{a.status}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="chip" onClick={() => { setSel(a._id); setDraft({ title: a.title, category: a.category, status: a.status, bodyMarkdown: a.bodyMarkdown }); }}>
                {sel === a._id ? 'Editing…' : 'Edit'}
              </button>
              <button className="chip" onClick={() => { upsert('articles', { ...a, status: a.status === 'published' ? 'draft' : 'published' }); }}>
                {a.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button className="chip" onClick={async () => {
                if (await confirm({ title: `Delete “${a.title}”?`, body: 'The article is removed immediately. This cannot be undone.', confirmLabel: 'Delete article', danger: true })) {
                  remove('articles', a._id); announce(`Deleted article ${a.title}.`);
                }
              }}>Delete</button>
            </span>
          </div>
          {sel === a._id && (
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                <input style={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <input style={input} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                <select style={input} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as 'draft' | 'published' })}>
                  <option value="draft">draft</option><option value="published">published</option>
                </select>
              </div>
              <textarea style={input} rows={6} value={draft.bodyMarkdown} onChange={(e) => setDraft({ ...draft, bodyMarkdown: e.target.value })} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => { upsert('articles', { ...a, ...draft, updatedAt: new Date().toISOString().slice(0, 10) }); setSel(null); }}>Save</button>
                <button className="btn btn-ghost" onClick={() => setSel(null)}>Cancel</button>
              </div>
            </div>
          )}
        </Card>
      ))}
      <Card>
        <H>New article</H>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
          <input style={input} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input style={input} placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        </div>
        <textarea style={input} rows={4} placeholder="Markdown body" value={draft.bodyMarkdown} onChange={(e) => setDraft({ ...draft, bodyMarkdown: e.target.value })} />
        <div style={{ marginTop: 8 }}><button className="btn btn-primary" disabled={!draft.title}
          onClick={() => {
            upsert('articles', { _id: `a_${Date.now()}`, title: draft.title, category: draft.category || 'GUIDES', status: 'draft', bodyMarkdown: draft.bodyMarkdown, updatedAt: new Date().toISOString().slice(0, 10) });
            setDraft({ title: '', category: 'GUIDES', status: 'draft', bodyMarkdown: '' });
          }}>Create draft</button></div>
      </Card>
    </div>
  );
}

/* ---------- market data ---------- */
function MarketData() {
  const opps = useColl<Opportunity>('opportunities');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {opps.map((o) => (
        <Card key={o._id}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
            <div><b style={{ color: 'var(--text-strong)' }}>{o.name}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>rank #{o.rank} · {o.sector}</div></div>
            <label style={{ fontSize: 11 }}>TSG Price<input style={input} type="number" step="0.01" value={o.tsgPrice ?? ''} placeholder="—"
              onChange={(e) => upsert('opportunities', { ...o, tsgPrice: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
            <label style={{ fontSize: 11 }}>1Y %<input style={input} type="number" step="0.1" value={o.priceChange1Y ?? ''} placeholder="—"
              onChange={(e) => upsert('opportunities', { ...o, priceChange1Y: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
            <label style={{ fontSize: 11 }}>Activity<select style={input} value={o.activity}
              onChange={(e) => upsert('opportunities', { ...o, activity: e.target.value as Opportunity['activity'] })}>
              {['Limited', 'Low', 'Medium', 'High'].map((a) => <option key={a}>{a}</option>)}
            </select></label>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- shell ---------- */
export default function Admin() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const me = useSelector((s: RootState) => s.auth.user?.sub ?? '');
  const funds = useColl<FundOffering>('funds');
  const [tab, setTab] = useQueryState('tab', 'funds') as unknown as ['funds' | 'users' | 'roles' | 'indications' | 'cms' | 'market' | 'logs', (t: string) => void];
  const [cmsTab, setCmsTab] = useState<'articles' | 'opportunities'>('articles');
  const [editFund, setEditFund] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [logPaged, logPage, logPages, logSetPage, logTotal] = usePagination(logs, 10);
  if (!(role === 'admin' || role === 'fund_manager' || role === 'monitor')) return <Denied />;
  const ro = role === 'monitor';
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Admin console</h2>
        {tab === 'funds' && !ro && !adding && <button className="btn btn-primary" style={{ height: 34 }} onClick={() => setAdding(true)}>New fund</button>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(['funds', 'users', 'roles', 'indications', 'cms', 'market', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`chip${tab === t ? ' on' : ''}`}>{t === 'market' ? 'market data' : t}</button>
        ))}
      </div>

      {tab === 'funds' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {(adding || editFund) && !ro && (
            <FundEditor
              f={editFund ? funds.find((x) => x._id === editFund) ?? BLANK_FUND : BLANK_FUND}
              onDone={() => { setAdding(false); setEditFund(null); }}
            />
          )}
          {funds.map((f) => (
            <Card key={f._id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{f.fundName} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-subtle)' }}>({f.status})</span></div>
                  <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    min ${f.minimumInvestment.toLocaleString()} · ${f.offerPricePerUnit}/unit · raised {f.raised ? fmtMoney(f.raised) : '—'} / {fmtMoney(f.offeringSize)} · bank: {f.bankDetails?.bankName ?? 'to be published'}
                  </div>
                </div>
                {!ro && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="chip" onClick={() => { setEditFund(f._id); setAdding(false); }}>Edit</button>
                  {f.status === 'draft' && <button className="chip" onClick={async () => {
                    if (await confirm({ title: `Delete draft “${f.fundName}”?`, body: 'The draft fund is removed immediately.', confirmLabel: 'Delete draft', danger: true })) {
                      remove('funds', f._id); announce(`Deleted draft fund ${f.fundName}.`);
                    }
                  }}>Delete</button>}
                </span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'users' && (ro ? <Empty text="Read-only role." /> : <UserManager me={me} />)}
      {tab === 'roles' && (ro ? <Empty text="Read-only role." /> : <RolesMatrix />)}
      {tab === 'indications' && (ro ? <Empty text="Read-only role." /> : <Queue />)}

      {tab === 'cms' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setCmsTab('articles')} className={`chip${cmsTab === 'articles' ? ' on' : ''}`}>Articles & announcements</button>
            <button onClick={() => setCmsTab('opportunities')} className={`chip${cmsTab === 'opportunities' ? ' on' : ''}`}>Market-data help</button>
          </div>
          {cmsTab === 'articles' ? (ro ? <Empty text="Read-only role." /> : <Cms />) : (
            <Card><div style={{ fontSize: 13 }}>Price, 1Y change and activity for every tracked company are edited under the <b>market data</b> tab. Article bodies render as markdown on the Insights pages.</div></Card>
          )}
        </div>
      )}
      {tab === 'market' && (ro ? <Empty text="Read-only role." /> : <MarketData />)}

      {tab === 'logs' && (
        <div>
          <div className="dtable tall">
            <table className="grid"><thead><tr><th>Module</th><th>Action</th><th>By</th><th>At</th></tr></thead>
              <tbody>{logPaged.map((l) => <tr key={l._id}><td>{l.module}</td><td>{l.action}</td><td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{l.performedBy}</td><td>{l.createdAt}</td></tr>)}</tbody></table>
          </div>
          <Pager page={logPage} pages={logPages} total={logTotal} onPage={logSetPage} />
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-subtle)' }}>Audit trail retained for 3 years.</div>
        </div>
      )}
    </div>
  );
}
