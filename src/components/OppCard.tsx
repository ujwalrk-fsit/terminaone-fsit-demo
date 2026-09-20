import { Link } from 'react-router-dom';
import type { FundOffering, FundStatus, Opportunity } from '../types';

export function tagClass(t: string) {
  if (t === 'Top Gainer') return 'tag tag-hot';
  if (t === 'Unicorn') return 'tag tag-uni';
  return 'tag tag-new';
}

export function StatusPill({ status }: { status: FundStatus }) {
  if (status === 'live') return <span className="pill pill-live">Live</span>;
  if (status === 'upcoming') return <span className="pill pill-info">Upcoming</span>;
  return <span className="pill pill-neutral">{status === 'draft' ? 'Draft' : 'Closed'}</span>;
}

import { fmtMoney } from '../format';
export { fmtMoney };

export function OppCard({ opp, fund }: { opp: Opportunity; fund?: FundOffering }) {
  const f = fund;
  const pct = f?.raised && f.offeringSize ? Math.min(100, Math.round((f.raised / f.offeringSize) * 100)) : 0;
  return (
    <article className="opp-card">
      <div className="opp-card__media" aria-hidden="true">{opp.name.charAt(0)}</div>
      <header className="opp-card__head">
        <div>
          <h3><Link to={`/opportunities/${opp._id}`}>{opp.name}</Link></h3>
          <p className="opp-card__type">{f?.fundType === 'debt' ? 'Debt' : f?.fundType === 'real_estate' ? 'Real Estate' : 'Venture Capital'}</p>
        </div>
        {f ? <StatusPill status={f.status} /> : <span className="pill pill-neutral">{opp.activity}</span>}
      </header>
      <p className="opp-card__desc">{opp.description}</p>
      {opp.tags && opp.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {opp.tags.slice(0, 2).map((t) => <span key={t} className={tagClass(t)}>{t}</span>)}
        </div>
      )}
      <hr />
      <dl className="opp-card__stats">
        <div><dt>Minimum Investment</dt><dd>{f ? `$${f.minimumInvestment.toLocaleString()}` : '—'}</dd></div>
        <div><dt>Offer Price per Unit</dt><dd>{f ? `$${f.offerPricePerUnit.toFixed(2)}` : opp.tsgPrice ? `$${opp.tsgPrice.toFixed(2)}` : '—'}</dd></div>
      </dl>
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${opp.name} funding progress`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="opp-card__funding">
        <div><strong className="raised">{f?.raised ? fmtMoney(f.raised) : '—'}</strong><small>raised</small></div>
        <div className="right"><strong>{f ? fmtMoney(f.offeringSize) : '—'}</strong><small>Offering Size</small></div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {f?.status === 'closed' ? (
          <button className="btn btn-block" disabled>Closed</button>
        ) : (
          <Link to={`/opportunities/${opp._id}`} className="btn btn-accent btn-block">View opportunity</Link>
        )}
      </div>
    </article>
  );
}
