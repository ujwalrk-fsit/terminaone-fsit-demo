import { ArrowRight } from 'lucide-react';
import { Menu } from '../components/Menu';
import { Card } from '../components/Shell';
import { useTheme, toggleTheme } from '../theme';

// Decision aid: v2 tokens + core components on one screen. Point at anything
// here and tell me what to change (color, radius, spacing, copy).
const swatches: [string, string][] = [
  ['Primary (black pill)', 'var(--primary)'],
  ['Brand blue', 'var(--brand-blue)'],
  ['Brand deep', 'var(--brand-blue-deep)'],
  ['Canvas', 'var(--bg-canvas)'],
  ['Surface', 'var(--surface-2)'],
  ['Ink', 'var(--text-strong)'],
  ['Stone', 'var(--text-subtle)'],
  ['Gain', 'var(--positive)'],
  ['Gain text (AA)', 'var(--success-text)'],
  ['Loss', 'var(--negative)'],
  ['Warning', 'var(--warning)'],
  ['Warning text (AA)', 'var(--warning-text)'],
  ['Pending', 'var(--pending)'],
  ['Hairline', 'var(--border-default)'],
];

const chartPalette = ['#3772cf', '#1ba673', '#c37d0d', '#5a5fc7', '#0f6f8c', '#9c4dcc'];

export default function UiKit() {
  const theme = useTheme();
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>UI kit <span className="page-h sub">: v2 tokens and components for review</span></h2>
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
        <h3 style={{ margin: '16px 0 8px', color: 'var(--text-strong)' }}>Chart palette (series 1 to 6)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chartPalette.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 9999, background: c }} />{c}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Buttons</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary">Black pill</button>
          <button className="btn btn-accent">Accent blue</button>
          <button className="btn btn-outline">Buy Or Sell</button>
          <button className="btn btn-ghost">Ghost <ArrowRight size={16} /></button>
          <button className="btn" disabled>Disabled</button>
          <a className="link-more" href="#/ui-kit">Text link <ArrowRight size={16} /></a>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>Black pill = selection and secondary CTAs · Accent blue (white on deep, 6.7:1) = primary money actions · Green and red text uses AA-graded text tokens: blue is never a gain signal.</div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Pills & deltas</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="pill pill-live">Live</span>
          <span className="pill pill-success">Funded</span>
          <span className="pill pill-info">Upcoming</span>
          <span className="pill pill-neutral">Closed</span>
          <span className="pill pill-warn">Warning</span>
          <span className="delta-pos">+12.4%</span>
          <span className="delta-neg">−3.1%</span>
          <span className="delta-neu">0.0%</span>
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Filter chips, menus, inputs</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="chip on">Active</button>
          <button className="chip">Inactive</button>
          <Menu label="Explore" items={[
            { title: 'Market Opportunities', desc: 'Find active opportunities to invest in' },
            { title: 'Watchlist', desc: 'Track companies that matter to you' },
          ]} />
          <input placeholder="Search for companies" style={{ height: 36, padding: '0 12px', width: 240 }} />
          <select style={{ height: 36, padding: '0 12px' }}><option>All sectors</option></select>
        </div>
        <div className="progress" style={{ maxWidth: 320 }}><span style={{ width: '81%' }} /></div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Dense tables</h3>
        <div className="dtable">
          <table className="grid">
            <thead><tr><th>Company ▲▼</th><th className="num">Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><b>Anduril</b></td><td className="num">$34.80</td><td><span className="pill pill-live">Live</span></td><td><a className="link-more" style={{ fontSize: 12 }} href="#/ui-kit">Update</a></td></tr>
              <tr><td><b>Ripple</b></td><td className="num">$11.20</td><td><span className="sp-fail">Failed</span></td><td><a className="link-more" style={{ fontSize: 12 }} href="#/ui-kit">Update</a></td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>Rules: uppercase micro headers on tinted row, Geist Mono right-aligned numerics, row hover, inline status + actions.</div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-strong)' }}>Type scale</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ font: '600 28px/34px var(--font-display)', color: 'var(--text-strong)' }}>Heading: Inter 600</div>
          <div style={{ font: '400 14px/21px var(--font-body)' }}>Body: Inter, for labels, headers and prose.</div>
          <div style={{ font: '500 14px/21px var(--font-body)' }}>Body medium: Inter 500 for emphasis.</div>
          <div className="tnum" style={{ fontSize: 32, color: 'var(--text-strong)' }}>$8,140,128: Geist Mono figures</div>
          <div className="tnum" style={{ fontSize: 13, color: 'var(--text-muted)' }}>$289.16 · table numerics align on decimals</div>
        </div>
      </Card>
    </div>
  );
}
