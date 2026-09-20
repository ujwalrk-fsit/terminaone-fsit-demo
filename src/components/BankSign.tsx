import { useRef, useState } from 'react';
import type { BankDetails } from '../types';

const dt = { color: 'var(--text-subtle)' };

// Back-office bank panel (read-only for investor) + investor confirm + proof upload (mock).
export function BankPanel({ bank, indicationId, onConfirmed }: { bank?: BankDetails; indicationId: string; onConfirmed: (proofUrl: string) => void }) {
  const [proof, setProof] = useState<string>('');
  const [done, setDone] = useState(false);
  if (!bank) return <div style={{ border: '1px dashed var(--border-default)', borderRadius: 8, padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>Bank details not yet uploaded by back office (mock). This opportunity cannot accept transfers.</div>;
  const masked = bank.accountNumber.length > 4 ? `••••${bank.accountNumber.slice(-4)}` : bank.accountNumber;
  return (
    <div style={{ display: 'grid', gap: 12, border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16, fontSize: 13 }}>
      <div style={{ font: '700 14px var(--font-display)', color: '#fff' }}>Manual bank transfer (replaces card/Stripe in mock)</div>
      <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, margin: 0 }}>
        <dt style={dt}>Bank</dt><dd style={{ margin: 0 }}>{bank.bankName}</dd>
        <dt style={dt}>Account</dt><dd style={{ margin: 0 }}>{bank.accountName} ({masked})</dd>
        <dt style={dt}>Routing</dt><dd style={{ margin: 0 }}>{bank.routingCode}</dd>
        {bank.swift && <><dt style={dt}>SWIFT</dt><dd style={{ margin: 0 }}>{bank.swift}</dd></>}
        <dt style={dt}>Reference</dt><dd style={{ margin: 0, fontFamily: 'monospace' }}>REF-{indicationId}</dd>
      </dl>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>{bank.instructions}</p>
      <label style={{ display: 'block' }}>Transfer proof (mock upload, stored locally)
        <input type="file" accept="image/*,.pdf" style={{ display: 'block', marginTop: 6 }} onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setProof(URL.createObjectURL(f));
        }} />
      </label>
      {proof && <div style={{ fontSize: 12 }}>Attached: <a href={proof} target="_blank" rel="noreferrer" className="link-more">view proof</a></div>}
      <div><button disabled={!proof || done} className="btn btn-primary"
        onClick={() => { onConfirmed(proof); setDone(true); }}>
        {done ? 'Transfer marked (mock)' : 'I have transferred'}
      </button></div>
    </div>
  );
}

// Native signature block: type | draw | upload. Returns dataURL.
export function SignPad({ onSign }: { onSign: (dataUrl: string, mode: string) => void }) {
  const [mode, setMode] = useState<'type' | 'draw' | 'upload'>('type');
  const [typed, setTyped] = useState('Dev Investor');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const drawHandlers = {
    onPointerDown: (e: React.PointerEvent) => { drawing.current = true; const c = canvasRef.current!; const r = c.getBoundingClientRect(); const ctx = c.getContext('2d')!; ctx.strokeStyle = '#0B0C1B'; ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); },
    onPointerMove: (e: React.PointerEvent) => { if (!drawing.current) return; const c = canvasRef.current!; const r = c.getBoundingClientRect(); const ctx = c.getContext('2d')!; ctx.lineWidth = 2; ctx.strokeStyle = '#0B0C1B'; ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); },
    onPointerUp: () => { drawing.current = false; },
  };

  return (
    <div style={{ display: 'grid', gap: 12, border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['type', 'draw', 'upload'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`chip${mode === m ? ' on' : ''}`}>{m}</button>
        ))}
      </div>
      {mode === 'type' && (
        <div>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} style={{ width: '100%', padding: 10, fontSize: 24, fontFamily: 'cursive' }} />
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => {
            const c = document.createElement('canvas'); c.width = 400; c.height = 100;
            const ctx = c.getContext('2d')!; ctx.font = '40px cursive'; ctx.fillText(typed || 'X', 20, 60);
            onSign(c.toDataURL(), 'type');
          }}>Use typed signature</button>
        </div>
      )}
      {mode === 'draw' && (
        <div>
          <canvas ref={canvasRef} width={400} height={140} style={{ width: '100%', touchAction: 'none', borderRadius: 8, background: '#fff' }} {...drawHandlers} />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 400, 140)}>Clear</button>
            <button className="btn btn-primary" onClick={() => onSign(canvasRef.current!.toDataURL(), 'draw')}>Use drawing</button>
          </div>
        </div>
      )}
      {mode === 'upload' && (
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onload = () => onSign(String(r.result), 'upload'); r.readAsDataURL(f);
        }} />
      )}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>Stored locally as dataURL (mock). Multi-party order enforced by parent flow.</p>
    </div>
  );
}
