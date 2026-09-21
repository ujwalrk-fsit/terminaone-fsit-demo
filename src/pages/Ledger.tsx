import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useColl, upsert } from '../db';
import type { FundOffering, Indication, AppUser } from '../types';
import { actorName } from '../dataRoom';
import { announce } from '../components/Live';
import { confirm } from '../components/Confirm';
import { StatusPill, fmtMoney } from '../components/OppCard';
import { Card, Empty } from '../components/Shell';
import { ExpandBtn } from '../components/Tables';

const STAFF = ['admin', 'fund_manager', 'monitor', 'advisor', 'affiliate'];

export default function Ledger() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const funds = useColl<FundOffering>('funds');
  const indications = useColl<Indication>('indications');
  const users = useColl<AppUser>('users');
  const [open, setOpen] = useState<string | null>(null);
  if (!role || !STAFF.includes(role)) return <Empty text="403: staff only." />;
  const canAct = role === 'admin' || role === 'fund_manager';
  const tierOf = (id: string) => users.find((u) => u._id === id)?.tier ?? 'Lite';
  const set = (i: Indication, status: Indication['status']) => {
    upsert('indications', { ...i, status, updatedAt: new Date().toISOString().slice(0, 10) });
    announce(`Indication ${i._id} moved to ${status}.`);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Fund Ledger</h2>
        <span className="pill pill-neutral">{indications.length} entries</span>
      </div>
      {funds.map((f) => {
        const rows = indications.filter((i) => i.fundId === f._id);
        if (rows.length === 0) return null;
        const total = rows.reduce((a, r) => a + r.investmentAmount, 0);
        const isOpen = open === f._id;
        return (
          <Card key={f._id}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <b style={{ color: 'var(--text-strong)' }}>{f.fundName}</b>
              <StatusPill status={f.status} />
              <span className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {rows.length} entries · {fmtMoney(total)} · raised {f.raised ? fmtMoney(f.raised) : 'n/a'}
              </span>
              <span style={{ marginLeft: 'auto' }}>
                <ExpandBtn open={isOpen} onClick={() => setOpen(isOpen ? null : f._id)} label={`Ledger for ${f.fundName}`} />
              </span>
            </div>
            {isOpen && (
              <div className="dtable" style={{ marginTop: 10 }}>
                <table className="grid">
                  <thead><tr><th>Investor</th><th>Tier</th><th>Units</th><th>Amount</th><th>Status</th><th>Date</th>{canAct && <th>Actions</th>}</tr></thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i._id}>
                        <td><b style={{ color: 'var(--text-strong)' }}>{actorName(i.investorUserId)}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{i._id}</div></td>
                        <td><span className="pill pill-neutral">{tierOf(i.investorUserId)}</span></td>
                        <td className="tnum">{i.numberOfUnits.toLocaleString()}</td>
                        <td className="tnum">${i.investmentAmount.toLocaleString()}</td>
                        <td><b style={{ fontSize: 12 }}>{i.status}</b></td>
                        <td className="tnum">{i.updatedAt}</td>
                        {canAct && (
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="chip" onClick={() => set(i, 'APPROVED')}>Approve</button>{' '}
                            <button className="chip" onClick={() => set(i, 'ALLOCATED')}>Allocate</button>{' '}
                            <button className="chip" onClick={async () => {
                              if (await confirm({ title: `Reject indication ${i._id}?`, body: 'The investor is notified and the entry closes.', confirmLabel: 'Reject', danger: true })) set(i, 'REJECTED');
                            }}>Reject</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
