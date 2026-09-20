import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { indications, funds, transfers } from '../mocks/seed';
import { Card, Empty } from '../components/Shell';

export default function Dashboard() {
  const auth = useSelector((s: RootState) => s.auth);
  const role = auth.user?.roleGroup;
  const mine = indications.filter((i) => i.investorUserId === auth.user?.sub);
  const queue = indications.filter((i) => ['AWAITING_APPROVAL', 'AWAITING_SIGNATURE'].includes(i.status));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold" style={{ color: '#fff' }}>Dashboard <span className="text-sm font-normal" style={{ color: 'var(--text-subtle)' }}>({role})</span></h1>
      {role === 'investor' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card><div className="text-xs">My indications</div><div className="text-2xl font-extrabold">{mine.length}</div><Link to="/indications" className="text-sm underline">View</Link></Card>
          <Card><div className="text-xs">Allocated value (mock)</div><div className="text-2xl font-extrabold">${mine.filter((m) => m.status === 'ALLOCATED').reduce((a, b) => a + b.investmentAmount, 0).toLocaleString()}</div><Link to="/portfolio" className="text-sm underline">Portfolio</Link></Card>
          <Card><div className="text-xs">Live funds</div><div className="text-2xl font-extrabold">{funds.filter((f) => f.status === 'live').length}</div><Link to="/opportunities" className="text-sm underline">Browse</Link></Card>
        </div>
      )}
      {(role === 'admin' || role === 'fund_manager') && (
        <Card><div className="font-bold">Approvals queue (mock)</div>
        {queue.length === 0 ? <Empty text="Queue empty." /> : queue.map((q) => <div key={q._id} className="border-t py-1 text-sm font-mono">{q._id} · {q.status} · ${q.investmentAmount.toLocaleString()}</div>)}
        <Link to="/admin" className="text-sm underline">Open admin</Link></Card>
      )}
      {role === 'advisor' && <Card><div className="text-sm">Clients pending signatures: {queue.length} (mock).</div></Card>}
      {role === 'monitor' && <Card><div className="text-sm">Read-only overview. Transfers: {transfers.length}, Indications: {indications.length}.</div></Card>}
      {role === 'affiliate' && <Card><div className="text-sm">Your referred funds: {funds.filter((f) => f.affiliates.length).length} (mock).</div></Card>}
      {!role && <Empty text="Not logged in." />}
    </div>
  );
}
