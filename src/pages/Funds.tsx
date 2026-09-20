import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { funds } from '../data/sample';
import { StatusPill, fmtMoney } from '../components/OppCard';
import { Empty } from '../components/Shell';

export default function Funds() {
  const vis = funds.filter((f) => f.status !== 'draft');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="section-head" style={{ margin: 0 }}>
        <h2>Fund Offerings</h2>
        <span className="pill pill-neutral">{vis.length} current</span>
      </div>
      {vis.length === 0 ? <Empty text="No current offerings." /> : (
        <div className="grid-posts">
          {vis.map((f) => {
            const pct = f.raised && f.offeringSize ? Math.min(100, Math.round((f.raised / f.offeringSize) * 100)) : 0;
            return (
              <article key={f._id} className="opp-card">
                <header className="opp-card__head" style={{ marginTop: 0 }}>
                  <div>
                    <h3>{f.fundName}</h3>
                    <p className="opp-card__type">{f.sector} / {f.subSector}</p>
                  </div>
                  <StatusPill status={f.status} />
                </header>
                <hr />
                <dl className="opp-card__stats">
                  <div><dt>Minimum Investment</dt><dd>${f.minimumInvestment.toLocaleString()}</dd></div>
                  <div><dt>Offer Price per Unit</dt><dd>${f.offerPricePerUnit.toFixed(2)}</dd></div>
                </dl>
                <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${f.fundName} funding progress`}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="opp-card__funding">
                  <div><strong className="raised">{f.raised ? fmtMoney(f.raised) : '—'}</strong><small>raised</small></div>
                  <div className="right"><strong>{fmtMoney(f.offeringSize)}</strong><small>Offering Size</small></div>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  Bank details {f.bankDetails ? `${f.bankDetails.bankName} ✓` : 'to be published'}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link to={`/indications/new?fund=${f._id}`} className="btn btn-primary btn-block">
                    Express interest <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="risk-note"><b>Risk disclosure:</b> private-market interests are illiquid and may lose value. Figures shown are illustrative — not investment advice.</div>
    </div>
  );
}
