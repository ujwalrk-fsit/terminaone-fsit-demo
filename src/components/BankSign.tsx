import { useRef, useState } from 'react';
import type { BankDetails } from '../types';

// Back-office bank panel (read-only for investor) + investor confirm + proof upload (mock).
export function BankPanel({ bank, indicationId, onConfirmed }: { bank?: BankDetails; indicationId: string; onConfirmed: (proofUrl: string) => void }) {
  const [proof, setProof] = useState<string>('');
  const [done, setDone] = useState(false);
  if (!bank) return <div className="rounded border border-dashed p-4 text-sm">Bank details not yet uploaded by back office (mock). This opportunity cannot accept transfers.</div>;
  const masked = bank.accountNumber.length > 4 ? `••••${bank.accountNumber.slice(-4)}` : bank.accountNumber;
  return (
    <div className="space-y-3 rounded border p-4 text-sm">
      <div className="font-bold">Manual bank transfer (replaces card/Stripe in mock)</div>
      <dl className="grid grid-cols-2 gap-2">
        <dt className="text-slate-500">Bank</dt><dd>{bank.bankName}</dd>
        <dt className="text-slate-500">Account</dt><dd>{bank.accountName} ({masked})</dd>
        <dt className="text-slate-500">Routing</dt><dd>{bank.routingCode}</dd>
        {bank.swift && <><dt className="text-slate-500">SWIFT</dt><dd>{bank.swift}</dd></>}
        <dt className="text-slate-500">Reference</dt><dd className="font-mono">REF-{indicationId}</dd>
      </dl>
      <p className="text-slate-600">{bank.instructions}</p>
      <label className="block">Transfer proof (mock upload, stored locally)
        <input type="file" accept="image/*,.pdf" className="mt-1 block" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = URL.createObjectURL(f);
          setProof(url);
        }} />
      </label>
      {proof && <div className="text-xs">Attached: <a href={proof} target="_blank" rel="noreferrer" className="underline">view proof</a></div>}
      <button disabled={!proof || done} className="rounded bg-[#0b3b8f] px-3 py-2 text-white disabled:opacity-40"
        onClick={() => { onConfirmed(proof); setDone(true); }}>
        {done ? 'Transfer marked (mock)' : 'I have transferred'}
      </button>
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
    onPointerDown: (e: React.PointerEvent) => { drawing.current = true; const c = canvasRef.current!; const r = c.getBoundingClientRect(); c.getContext('2d')!.beginPath(); c.getContext('2d')!.moveTo(e.clientX - r.left, e.clientY - r.top); },
    onPointerMove: (e: React.PointerEvent) => { if (!drawing.current) return; const c = canvasRef.current!; const r = c.getBoundingClientRect(); const ctx = c.getContext('2d')!; ctx.lineWidth = 2; ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); },
    onPointerUp: () => { drawing.current = false; },
  };

  return (
    <div className="space-y-3 rounded border p-4">
      <div className="flex gap-2 text-sm">
        {(['type', 'draw', 'upload'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded border px-2 py-1 ${mode === m ? 'bg-slate-900 text-white' : ''}`}>{m}</button>
        ))}
      </div>
      {mode === 'type' && (
        <div>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} className="w-full rounded border p-2 text-2xl" style={{ fontFamily: 'cursive' }} />
          <button className="mt-2 rounded bg-[#0b3b8f] px-3 py-2 text-sm text-white" onClick={() => {
            const c = document.createElement('canvas'); c.width = 400; c.height = 100;
            const ctx = c.getContext('2d')!; ctx.font = '40px cursive'; ctx.fillText(typed || 'X', 20, 60);
            onSign(c.toDataURL(), 'type');
          }}>Use typed signature</button>
        </div>
      )}
      {mode === 'draw' && (
        <div>
          <canvas ref={canvasRef} width={400} height={140} className="w-full touch-none rounded border bg-white" {...drawHandlers} />
          <div className="mt-2 flex gap-2">
            <button className="rounded border px-2 py-1 text-sm" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 400, 140)}>Clear</button>
            <button className="rounded bg-[#0b3b8f] px-3 py-1 text-sm text-white" onClick={() => onSign(canvasRef.current!.toDataURL(), 'draw')}>Use drawing</button>
          </div>
        </div>
      )}
      {mode === 'upload' && (
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onload = () => onSign(String(r.result), 'upload'); r.readAsDataURL(f);
        }} />
      )}
      <p className="text-xs text-slate-500">Stored locally as dataURL (mock). Multi-party order enforced by parent flow.</p>
    </div>
  );
}
