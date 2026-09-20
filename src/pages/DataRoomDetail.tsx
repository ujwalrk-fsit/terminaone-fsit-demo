import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, Eye, Lock, Plus, Search, Send } from 'lucide-react';
import type { RootState } from '../store';
import { useColl, upsert } from '../db';
import type { DataFile, DataFileType, DataFolder, FundOffering } from '../types';
import { FOLDERS, canView, fmtSize, fundName, latest, roomActivity, actorName } from '../dataRoom';
import { StatusPill } from '../components/OppCard';
import { Card, Empty } from '../components/Shell';

function downloadFile(f: DataFile) {
  const lines = [
    `${f.title} — v${latest(f).v} (${f.fileType})`, `Fund: ${fundName(f.fundId)}`, `Folder: ${f.folder} · Status: ${f.status}`,
    '', f.summary, '', 'VERSION HISTORY',
    ...[...f.versions].reverse().map((v) => `v${v.v} · ${v.uploadedAt} · ${actorName(v.uploadedBy)} · ${fmtSize(v.sizeKb)} — ${v.note}`),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${f._id}-v${latest(f).v}.txt`; a.click();
  URL.revokeObjectURL(url);
}

const typeColor: Record<DataFileType, string> = { PDF: '#D92D20', XLSX: '#178A3A', DOCX: '#2E21F3', ZIP: '#B7791F', CSV: '#0E7490' };

export default function DataRoomDetail() {
  const { fundId = '' } = useParams();
  const auth = useSelector((s: RootState) => s.auth);
  const role = auth.user?.roleGroup;
  const funds = useColl<FundOffering>('funds');
  const allFiles = useColl<DataFile>('datafiles');
  const fund = funds.find((f) => f._id === fundId);
  const [folder, setFolder] = useState<'All' | DataFolder>('All');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const [sessionActs, setSessionActs] = useState<{ action: string; target: string; createdAt: string }[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [up, setUp] = useState({ title: '', folder: 'Reports & Updates' as DataFolder, type: 'PDF' as DataFileType, note: '' });

  const files = useMemo(() => allFiles.filter((f) => f.fundId === fundId), [allFiles, fundId]);

  if (!fund) return <Empty text="Data room not found." />;
  const canUpload = role === 'admin' || role === 'fund_manager';
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    files.forEach((f) => m.set(f.folder, (m.get(f.folder) ?? 0) + 1));
    return m;
  }, [files]);
  const list = files.filter((f) =>
    (folder === 'All' || f.folder === folder) &&
    (!status || f.status === status) &&
    (!q || f.title.toLowerCase().includes(q.toLowerCase())));
  const selected = files.find((f) => f._id === sel);
  const acts = [...sessionActs.map((s, i) => ({ _id: `sess_${i}`, fundId, actor: 'you', action: s.action, target: s.target, createdAt: s.createdAt })), ...roomActivity(fundId)];

  const doUpload = () => {
    if (!up.title.trim()) return;
    const rec: DataFile = {
      _id: `dr_${Date.now()}`, fundId, folder: up.folder, title: up.title.trim(),
      fileType: up.type, status: 'draft', access: [], summary: up.note || 'Uploaded by the back office. Summary pending.',
      updatedAt: new Date().toISOString().slice(0, 10),
      versions: [{ v: 1, uploadedBy: auth.user?.sub ?? 'you', uploadedAt: new Date().toISOString().slice(0, 10), note: 'Initial upload', sizeKb: 320 }],
    };
    upsert('datafiles', rec);
    setSessionActs((p) => [{ action: 'uploaded', target: rec.title, createdAt: rec.updatedAt }, ...p]);
    setShowUpload(false); setUp({ title: '', folder: 'Reports & Updates', type: 'PDF', note: '' });
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}><Link to="/data-room" className="link-more" style={{ fontSize: 12 }}>Data Room</Link> / {fund.fundName}</div>
          <h1 className="page-h">{fund.fundName}</h1>
          <div className="tnum" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {files.length} files · {new Set(files.map((f) => f.folder)).size} folders · {fund.subscriptionStart ?? '—'} → {fund.subscriptionEnd ?? '—'}
          </div>
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <StatusPill status={fund.status} />
          {canUpload && <button className="btn btn-primary" style={{ height: 36 }} onClick={() => setShowUpload((s) => !s)}><Plus size={14} /> Upload</button>}
        </span>
      </div>

      {showUpload && canUpload && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>Upload document</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }} className="up-grid">
            <input placeholder="Document title" value={up.title} onChange={(e) => setUp({ ...up, title: e.target.value })} style={{ padding: 10 }} />
            <select value={up.folder} onChange={(e) => setUp({ ...up, folder: e.target.value as DataFolder })} style={{ padding: 10 }}>
              {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={up.type} onChange={(e) => setUp({ ...up, type: e.target.value as DataFileType })} style={{ padding: 10 }}>
              {(['PDF', 'XLSX', 'DOCX', 'ZIP', 'CSV'] as DataFileType[]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <input placeholder="Version note (e.g. Counsel review draft)" value={up.note} onChange={(e) => setUp({ ...up, note: e.target.value })} style={{ padding: 10, width: '100%', marginTop: 8 }} />
          <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={doUpload}>Publish v1</button></div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: 16 }} className="dr-grid">
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>Folders</div>
          <div style={{ display: 'grid', gap: 4 }}>
            {[['All', files.length] as const, ...FOLDERS.map((f) => [f, counts.get(f) ?? 0] as const)].map(([f, c]) => (
              <button key={f} onClick={() => setFolder(f as 'All' | DataFolder)}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, border: 0, cursor: 'pointer', background: folder === f ? 'var(--primary-50)' : 'transparent', color: folder === f ? 'var(--primary-800)' : 'var(--text-default)', fontWeight: folder === f ? 700 : 400, fontSize: 13, textAlign: 'left' }}>
                <span>{f}</span><span className="tnum">{c}</span>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div className="t-search-wrap" style={{ flex: '1 1 220px' }}>
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" className="t-search" style={{ width: '100%' }} aria-label="Search documents" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ height: 40, padding: '0 12px' }} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="final">Final</option>
              <option value="draft">Draft</option>
              <option value="superseded">Superseded</option>
            </select>
          </div>

          {list.length === 0 ? <Empty text="No documents match." /> : (
            <div className="dtable">
              <table className="grid" style={{ minWidth: 780 }}>
                <thead><tr><th>Document</th><th>Ver</th><th>Size</th><th>Updated</th><th>Status</th><th>Access</th><th /></tr></thead>
                <tbody>
                  {list.map((f) => {
                    const ok = canView(f, role);
                    const lv = latest(f);
                    return (
                      <tr key={f._id} style={{ opacity: ok ? 1 : .75 }}>
                        <td>
                          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: typeColor[f.fileType], border: `1px solid ${typeColor[f.fileType]}44`, borderRadius: 6, padding: '1px 6px', marginRight: 8 }}>{f.fileType}</span>
                          <b style={{ color: 'var(--text-strong)' }}>{f.title}</b>
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{f.folder}</div>
                        </td>
                        <td className="tnum">v{lv.v}{f.versions.length > 1 && <span style={{ color: 'var(--text-subtle)' }}> · {f.versions.length} rev</span>}</td>
                        <td className="tnum">{fmtSize(lv.sizeKb)}</td>
                        <td className="tnum">{f.updatedAt}</td>
                        <td>{f.status === 'final' ? <span className="pill pill-success" style={{ height: 22 }}>Final</span> : f.status === 'draft' ? <span className="pill pill-info">Draft</span> : <span className="pill pill-neutral">Superseded</span>}</td>
                        <td style={{ fontSize: 11 }}>{f.access.length === 0 ? 'All roles' : ok ? `${f.access.length} roles` : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--warning)' }}><Lock size={12} /> Restricted</span>}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {ok ? (
                            <>
                              <button className="link-more" style={{ fontSize: 12 }} onClick={() => setSel(sel === f._id ? null : f._id)}><Eye size={13} /> View</button>{' '}
                              <button className="link-more" style={{ fontSize: 12 }} onClick={() => downloadFile(f)}><Download size={13} /> File</button>
                            </>
                          ) : requested.includes(f._id) ? (
                            <span style={{ fontSize: 12, color: 'var(--success)' }}>Request sent</span>
                          ) : (
                            <button className="link-more" style={{ fontSize: 12 }} onClick={() => setRequested((p) => [...p, f._id])}><Send size={13} /> Request access</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selected && (
            <Card>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <b style={{ color: 'var(--text-strong)' }}>{selected.title}</b>
                <span className="pill pill-neutral">{selected.folder}</span>
                <button className="btn btn-primary" style={{ height: 34, marginLeft: 'auto' }} onClick={() => downloadFile(selected)}><Download size={14} /> Download v{latest(selected).v}</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.summary}</p>
              <div style={{ fontWeight: 700, color: 'var(--text-strong)', margin: '12px 0 8px', fontSize: 13 }}>Version history</div>
              <div style={{ display: 'grid', gap: 0 }}>
                {[...selected.versions].reverse().map((v, i) => (
                  <div key={v.v} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: i === 0 ? 0 : '1px solid var(--border-subtle)' }}>
                    <span className="tnum" style={{ fontWeight: 700, color: 'var(--text-strong)', minWidth: 36 }}>v{v.v}</span>
                    <div style={{ fontSize: 12 }}>
                      <div>{v.note}</div>
                      <div style={{ color: 'var(--text-subtle)' }}>{v.uploadedAt} · {actorName(v.uploadedBy)} · {fmtSize(v.sizeKb)}{i === 0 && ' · current'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>
                Visible to: {selected.access.length === 0 ? 'all signed-in roles' : selected.access.join(', ')}
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>Room activity</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {acts.slice(0, 10).map((a) => (
                <div key={a._id} style={{ fontSize: 13 }}>
                  <b style={{ color: 'var(--text-strong)' }}>{actorName(a.actor)}</b> {a.action} <b>{a.target}</b>
                  <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}> · {a.createdAt}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@media (max-width: 900px){ .dr-grid{ grid-template-columns: 1fr !important; } .up-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
