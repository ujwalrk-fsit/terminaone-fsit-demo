import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RootState } from '../store';
import { useColl } from '../db';
import type { Indication, FundOffering, Opportunity } from '../types';
import { Card, Empty } from '../components/Shell';

const SLICE = ['#3772cf', '#1ba673', '#c37d0d', '#5a5fc7', '#0f6f8c', '#9c4dcc'];

export default function Portfolio() {
  const auth = useSelector((s: RootState) => s.auth);
  const indications = useColl<Indication>('indications');
  const funds = useColl<FundOffering>('funds');
  const opportunities = useColl<Opportunity>('opportunities');
  const mine = indications.filter((i) => i.investorUserId === auth.user?.sub && ['ALLOCATED', 'APPROVED', 'SUBSCRIBED'].includes(i.status));
  const total = mine.reduce((a, b) => a + b.investmentAmount, 0);
  const byFund = new Map<string, number>();
  mine.forEach((m) => byFund.set(m.fundId, (byFund.get(m.fundId) ?? 0) + m.investmentAmount));
  const donut = [...byFund.entries()].map(([fid, amt], i) => ({
    name: funds.find((x) => x._id === fid)?.fundName ?? fid,
    value: amt, fill: SLICE[i % SLICE.length],
  }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="section-head" style={{ margin: 0 }}><h2>Portfolio</h2></div>

      <div className="balance-hero">
        <small>Holdings value</small>
        <b>${total.toLocaleString()}</b>
        <div style={{ fontSize: 12, color: '#b7c5e0', marginTop: 4 }}>{mine.length} positions across {byFund.size} funds</div>
      </div>

      {byFund.size === 0 ? (
        <Card><div style={{ fontSize: 13 }}>No holdings yet. <Link to="/opportunities" className="link-more">Browse opportunities</Link>.</div></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }} className="pf-grid">
          <Card>
            <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 14, marginBottom: 4 }}>Allocation</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} strokeWidth={2} stroke="var(--surface-1)" paddingAngle={2}>
                    {donut.map((d) => <Cell key={d.name} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#16233c', border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}
                    formatter={((v: number) => [`$${(v ?? 0).toLocaleString()}`, '']) as never} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
              {donut.map((d) => (
                <div key={d.name} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: d.fill, flex: 'none' }} />
                  <span style={{ flex: 1, color: 'var(--text-default)' }}>{d.name}</span>
                  <span className="tnum" style={{ color: 'var(--text-strong)' }}>${d.value.toLocaleString()} · {total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
            {[...byFund.entries()].map(([fid, amt]) => {
              const f = funds.find((x) => x._id === fid);
              const opp = opportunities.find((o) => o._id === f?.opportunityId);
              return (
                <Card key={fid}>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 14 }}>{f?.fundName}</div>
                  <div className="tnum" style={{ fontSize: 13, marginTop: 2 }}>${amt.toLocaleString()} {opp && <>· <Link to={`/opportunities/${opp._id}`} className="link-more" style={{ fontSize: 12 }}>{opp.name}</Link></>}</div>
                </Card>
              );
            })}
            {mine.length === 0 && <Empty text="No open positions." />}
          </div>
        </div>
      )}
      <style>{`@media (max-width: 900px){ .pf-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
