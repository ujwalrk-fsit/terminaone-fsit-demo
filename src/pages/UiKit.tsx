import { ArrowRight } from 'lucide-react';
import { Menu } from '../components/Menu';
import { Card } from '../components/Shell';
import { useTheme, toggleTheme } from '../theme';

// Decision aid: every token + core component on one screen. Point at anything
// here and tell me what to change (color, radius, spacing, copy).
const swatches: [string, string][] = [
  ['Primary / brand', 'var(--primary-600)'],
  ['Canvas', 'var(--bg-canvas)'],
  ['Surface 1', 'var(--surface-1)'],
  ['Surface 2', 'var(--surface-2)'],
  ['Text strong', 'var(--text-strong)'],
  ['Text muted', 'var(--text-muted)'],
  ['Success', 'var(--success)'],
  ['Info', 'var(--info)'],
  ['Warning', 'var(--warning)'],
  ['Danger', 'var(--danger)'],
];

export default function UiKit() {
  const theme = useTheme();
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>UI kit <span className="page-h sub">— tokens & components for review</span></h2>
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'light' ? 'Preview dark mode' : 'Preview light mode'}
        </button>
      </div>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Color tokens</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {swatches.map(([name, v]) => (
            <div key={name}>
              <div className="swatch" style={{ background: v }}>{v}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{name}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Buttons</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-outline">Buy Or Sell</button>
          <button className="btn btn-ghost">Ghost <ArrowRight size={16} /></button>
          <button className="btn" disabled>Disabled</button>
          <a className="link-more" href="#/ui-kit">Text link <ArrowRight size={16} /></a>
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Pills</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="pill pill-live">Live</span>
          <span className="pill pill-success">Full Access Approved</span>
          <span className="pill pill-brand">Primary Advisor</span>
          <span className="pill pill-info">Upcoming</span>
          <span className="pill pill-neutral">Closed</span>
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Menus, inputs, progress</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Menu label="Explore" items={[
            { title: 'Market Opportunities', desc: 'Find active opportunities to invest in' },
            { title: 'Watchlist', desc: 'Track companies that matter to you' },
          ]} />
          <input placeholder="Search for companies" style={{ height: 40, padding: '0 12px', width: 260 }} />
          <select style={{ height: 40, padding: '0 12px' }}><option>All sectors</option></select>
        </div>
        <div className="progress" style={{ maxWidth: 320 }}><span style={{ width: '81%' }} /></div>
        <div className="risk-note" style={{ marginTop: 12 }}><b>Risk disclosure style:</b> this is the standard callout used across browse, detail and checkout flows.</div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Type scale</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ font: '700 clamp(28px,3.2vw,40px)/1.15 var(--font-display)', color: 'var(--text-strong)' }}>Display XL — Aa 123</div>
          <div style={{ font: '700 22px/28px var(--font-display)', color: 'var(--text-strong)' }}>Heading 2 — Aa 123</div>
          <div style={{ font: '700 18px/24px var(--font-display)', color: 'var(--text-strong)' }}>Heading 3 — Aa 123</div>
          <div style={{ font: '400 14px/22px var(--font-body)' }}>Body — IBM Plex Sans, for reading and navigation.</div>
          <div className="tnum" style={{ font: '700 20px/24px var(--font-display)', color: 'var(--text-strong)' }}>$8.1M · tabular numerals</div>
        </div>
      </Card>
    </div>
  );
}
