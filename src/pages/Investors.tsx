import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useColl, upsert } from '../db';
import type { AppUser, Indication, InvestorAccount } from '../types';
import { Toolbar, Pager, usePagination, SortTh, useSort, ExpandBtn } from '../components/Tables';
import { Card, Empty } from '../components/Shell';

const STAFF = ['admin', 'fund_manager', 'monitor', 'advisor', 'affiliate'];
const TIERS = ['All', 'Lite', 'Plus', 'Pro'];

export default function Investors() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const users = useColl<AppUser>('users');
  const accounts = useColl<InvestorAccount>('accounts');
  const indications = useColl<Indication>('indications');
  const [tq, setTq] = useState('');
  const [tier, setTier] = useState('All');
  const [open, setOpen] = useState<string | null>(null);
  if (!role || !STAFF.includes(role)) return <Empty text="403: staff only." />;
  const canEdit = role === 'admin' || role === 'fund_manager';

  const inv = users.filter((u) => u.roleGroup === 'investor');
  const q = tq.trim().toLowerCase();
  const filtered = inv.filter((u) =>
    (tier === 'All' || (u.tier ?? 'Lite') === tier) &&
    (!q || `${u.firstName} ${u.lastName} ${u.emailId}`.toLowerCase().includes(q)));
  const get = (u: AppUser, k: string): string | number =>
    k === 'name' ? `${u.firstName} ${u.lastName}` : k === 'tier' ? (u.tier ?? 'Lite') : u.status;
  const [sorted, sk, dir, sort] = useSort(filtered, 'name', 1, get);
  const [paged, page, pages, setPage, total] = usePagination(sorted, 8);

  const holdingsOf = (id: string) => indications
    .filter((i) => i.investorUserId === id && ['ALLOCATED', 'APPROVED', 'SUBSCRIBED'].includes(i.status))
    .reduce((a, i) => a + i.investmentAmount, 0);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Investors</h2>
        <span className="pill pill-neutral">{inv.length}</span>
      </div>
      <Toolbar search={tq} onSearch={(s) => { setTq(s); setPage(0); }} placeholder="Search name or email…">
        <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(0); }} style={{ height: 34, padding: '0 10px' }} aria-label="Filter by tier">
          {TIERS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Toolbar>
      {sorted.length === 0 ? <Empty text="No investors match." /> : (
        <>
          <div className="dtable tall">
            <table className="grid" style={{ minWidth: 820 }}>
              <thead><tr>
                <SortTh label="Investor" k="name" sk={sk} dir={dir} onSort={sort} />
                <SortTh label="Tier" k="tier" sk={sk} dir={dir} onSort={sort} />
                <th>Accounts</th><th>Holdings</th><th>Indications</th>
                <SortTh label="Status" k="status" sk={sk} dir={dir} onSort={sort} />
                <th />
              </tr></thead>
              <tbody>
                {paged.map((u) => {
                  const accs = accounts.filter((a) => a.userId === u._id);
                  const n = indications.filter((i) => i.investorUserId === u._id).length;
                  const isOpen = open === u._id;
                  return [
                    <tr key={u._id}>
                      <td><b style={{ color: 'var(--text-strong)' }}>{u.firstName} {u.lastName}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{u.emailId}</div></td>
                      <td>
                        {canEdit ? (
                          <select value={u.tier ?? 'Lite'} onChange={(e) => upsert('users', { ...u, tier: e.target.value as 'Lite' | 'Plus' | 'Pro' })} style={{ padding: '4px 6px' }} aria-label={`Tier for ${u.emailId}`}>
                            {['Lite', 'Plus', 'Pro'].map((t) => <option key={t}>{t}</option>)}
                          </select>
                        ) : <span className="pill pill-neutral">{u.tier ?? 'Lite'}</span>}
                      </td>
                      <td className="tnum">{accs.length}</td>
                      <td className="tnum"><b>${holdingsOf(u._id).toLocaleString()}</b></td>
                      <td className="tnum">{n}</td>
                      <td>{u.status}</td>
                      <td><ExpandBtn open={isOpen} onClick={() => setOpen(isOpen ? null : u._id)} label={`Details for ${u.emailId}`} /></td>
                    </tr>,
                    ...(isOpen ? [(
                      <tr key={`${u._id}-x`}>
                        <td colSpan={7} style={{ background: 'var(--surface-2)' }}>
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
                            <span>Accounts: {accs.length > 0 ? accs.map((a) => `${a._id} (${a.accountType}, ${a.status})`).join(' · ') : 'none yet'}</span>
                            <Link to="/onboarding" className="link-more" style={{ fontSize: 12 }}>Open setup</Link>
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
        </>
      )}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Tiers drive the dashboard funnel. Lite is the default for new signups; Plus and Pro unlock larger minimums and priority allocation.</div>
      </Card>
    </div>
  );
}
