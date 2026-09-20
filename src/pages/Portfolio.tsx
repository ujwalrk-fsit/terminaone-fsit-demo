import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store';
import { useColl } from '../db';
import type { Indication, FundOffering, Opportunity } from '../types';
import { Card } from '../components/Shell';

export default function Portfolio() {
  const auth = useSelector((s: RootState) => s.auth);
  const indications = useColl<Indication>('indications');
  const funds = useColl<FundOffering>('funds');
  const opportunities = useColl<Opportunity>('opportunities');
  const mine = indications.filter((i) => i.investorUserId === auth.user?.sub && ['ALLOCATED', 'APPROVED', 'SUBSCRIBED'].includes(i.status));
  const total = mine.reduce((a, b) => a + b.investmentAmount, 0);
  const byFund = new Map<string, number>();
  mine.forEach((m) => byFund.set(m.fundId, (byFund.get(m.fundId) ?? 0) + m.investmentAmount));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-strong)' }}>Portfolio</h1>
      <Card><div className="text-xs" style={{ color: 'var(--text-subtle)' }}>Holdings value</div><div className="text-2xl font-extrabold tnum" style={{ color: 'var(--text-strong)' }}>${total.toLocaleString()}</div></Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[...byFund.entries()].map(([fid, amt]) => {
          const f = funds.find((x) => x._id === fid);
          const opp = opportunities.find((o) => o._id === f?.opportunityId);
          return <Card key={fid}><div className="font-bold">{f?.fundName}</div><div className="text-sm">${amt.toLocaleString()} {opp && <>· <Link to={`/opportunities/${opp._id}`} className="underline">{opp.name}</Link></>}</div></Card>;
        })}
        {byFund.size === 0 && <Card><div className="text-sm">No holdings yet. <Link to="/opportunities" className="underline">Browse opportunities</Link>.</div></Card>}
      </div>
    </div>
  );
}
