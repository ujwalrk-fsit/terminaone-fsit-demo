import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useColl } from '../db';
import type { DocItem, SignatureRequest } from '../types';
import { announce } from '../components/Live';
import { confirm } from '../components/Confirm';
import { Card, Empty } from '../components/Shell';
import { Pager, SortTh, usePagination, useSort } from '../components/Tables';

const STAFF = ['admin', 'fund_manager', 'monitor', 'advisor', 'affiliate'];

function loadSessions(): SignatureRequest[] {
  try {
    const r = localStorage.getItem('tsg.signatures');
    if (r) return JSON.parse(r);
  } catch { /* */ }
  return [
    { _id: 's_1', documentId: 'd_1', indicationId: 'i_3', status: 'IN_PROGRESS', stage: 'WAITING_FOR_ADVISOR', recipients: [{ role: 'investor', order: 1, status: 'COMPLETED', signedAt: '2026-09-05' }, { role: 'advisor', order: 2, status: 'PENDING' }, { role: 'fund_manager', order: 3, status: 'PENDING' }], currentOrder: 2, expiresAt: '2026-10-05', reminderCount: 1 },
  ] as SignatureRequest[];
}
function persist(sigs: SignatureRequest[]) {
  try { localStorage.setItem('tsg.signatures', JSON.stringify(sigs)); } catch { /* */ }
}

export default function Signing() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const docs = useColl<DocItem>('docs');
  const [sigs, setSigs] = useState<SignatureRequest[]>(loadSessions);
  if (!role || !STAFF.includes(role)) return <Empty text="403: staff only." />;
  const canAct = role === 'admin' || role === 'fund_manager';
  const titleOf = (id: string) => docs.find((d) => d._id === id)?.title ?? id;
  const get = (s: SignatureRequest, k: string): string | number =>
    k === 'doc' ? titleOf(s.documentId) : k === 'status' ? s.status : k === 'expires' ? s.expiresAt : s.currentOrder;
  const [sorted, sk, dir, sort] = useSort(sigs, 'expires', -1, get);
  const [paged, page, pages, setPage, total] = usePagination(sorted, 8);

  const save = (next: SignatureRequest[], msg: string) => { setSigs(next); persist(next); announce(msg); };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Signing Sessions</h2>
        <span className="pill pill-neutral">{sigs.length}</span>
      </div>
      {sorted.length === 0 ? <Empty text="No signing sessions." /> : (
        <>
          <div className="dtable tall">
            <table className="grid" style={{ minWidth: 860 }}>
              <thead><tr>
                <SortTh label="Document" k="doc" sk={sk} dir={dir} onSort={sort} />
                <th>Route</th>
                <SortTh label="Status" k="status" sk={sk} dir={dir} onSort={sort} />
                <th>Stage</th>
                <SortTh label="Expires" k="expires" sk={sk} dir={dir} onSort={sort} />
                <th>Reminders</th>
                {canAct && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {paged.map((s) => (
                  <tr key={s._id}>
                    <td><b style={{ color: 'var(--text-strong)' }}>{titleOf(s.documentId)}</b><div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{s._id}{s.indicationId ? ` · ${s.indicationId}` : ''}</div></td>
                    <td style={{ fontSize: 12 }}>{s.recipients.map((r) => `${r.role}#${r.order}:${r.status}`).join(' → ')}</td>
                    <td><b style={{ fontSize: 12 }}>{s.status}</b></td>
                    <td style={{ fontSize: 12 }}>{s.stage}</td>
                    <td className="tnum">{s.expiresAt}</td>
                    <td className="tnum">{s.reminderCount}</td>
                    {canAct && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="chip" onClick={() => save(sigs.map((p) => p._id === s._id ? { ...p, reminderCount: p.reminderCount + 1 } : p), `Reminder sent for ${s._id}.`)}>Remind</button>{' '}
                        <button className="chip" onClick={async () => {
                          if (await confirm({ title: `Cancel session ${s._id}?`, body: 'Pending signers are notified and the session closes.', confirmLabel: 'Cancel session', danger: true })) {
                            save(sigs.map((p) => p._id === s._id ? { ...p, status: 'CANCELLED' as const } : p), `Canceled session ${s._id}.`);
                          }
                        }}>Cancel</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} pages={pages} total={total} onPage={setPage} />
        </>
      )}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Sessions complete in order: investor, then advisor, then fund manager. Full signing happens in <Link to="/documents" className="link-more" style={{ fontSize: 12 }}>Documents</Link>.</div>
      </Card>
    </div>
  );
}
