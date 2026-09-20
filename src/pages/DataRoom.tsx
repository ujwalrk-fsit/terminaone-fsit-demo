import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Database, FileText, Lock } from 'lucide-react';
import type { RootState } from '../store';
import { useColl } from '../db';
import type { FundOffering, DataFile } from '../types';
import { dataActivity } from '../data/sample';
import { canView, lastUpdated, actorName } from '../dataRoom';
import { StatusPill } from '../components/OppCard';
import { Card } from '../components/Shell';

export default function DataRoom() {
  const role = useSelector((s: RootState) => s.auth.user?.roleGroup);
  const funds = useColl<FundOffering>('funds');
  const dataFiles = useColl<DataFile>('datafiles');
  const rooms = funds.map((f) => {
    const files = dataFiles.filter((d) => d.fundId === f._id);
    const mine = files.filter((d) => canView(d, role));
    const folders = new Set(files.map((d) => d.folder)).size;
    return { fund: f, total: files.length, mine: mine.length, folders, updated: lastUpdated(f._id) };
  }).filter((r) => r.total > 0 && (r.fund.status !== 'draft' || role === 'admin' || role === 'fund_manager' || role === 'monitor'));

  const total = dataFiles.length;
  const finals = dataFiles.filter((d) => d.status === 'final').length;
  const restricted = dataFiles.filter((d) => d.access.length > 0).length;
  const recent = [...dataActivity].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Data Room</h2>
        <span className="pill pill-neutral">{total} files</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-subtle)' }}><Database size={14} /> Total files</div><div className="tnum" style={{ font: '700 24px var(--font-display)', color: 'var(--text-strong)' }}>{total}</div></Card>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-subtle)' }}><FileText size={14} /> Final versions</div><div className="tnum" style={{ font: '700 24px var(--font-display)', color: 'var(--text-strong)' }}>{finals}</div></Card>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-subtle)' }}><Lock size={14} /> Access-controlled</div><div className="tnum" style={{ font: '700 24px var(--font-display)', color: 'var(--text-strong)' }}>{restricted}</div></Card>
        <Card><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Fund rooms</div><div className="tnum" style={{ font: '700 24px var(--font-display)', color: 'var(--text-strong)' }}>{rooms.length}</div></Card>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {rooms.map(({ fund, total: t, mine, folders, updated }) => (
          <Card key={fund._id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{fund.fundName}</div>
                <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {mine} of {t} files visible to you · {folders} folders · updated {updated}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusPill status={fund.status} />
                <Link to={`/data-room/${fund._id}`} className="btn btn-primary" style={{ height: 36 }}>Open <ArrowRight size={14} /></Link>
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>Recent room activity</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {recent.map((a) => (
            <div key={a._id} style={{ fontSize: 13 }}>
              <b style={{ color: 'var(--text-strong)' }}>{actorName(a.actor)}</b> {a.action} <b>{a.target}</b>
              <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}> · {a.createdAt}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
