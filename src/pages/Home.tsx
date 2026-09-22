import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, CheckCircle2, Mail, Phone } from 'lucide-react';
import { useColl } from '../db';
import { fmtMoney, fmtPct } from '../format';
import type { FundOffering, Opportunity, Article, AppUser } from '../types';
import type { RootState } from '../store';
import { OppCard } from '../components/OppCard';

function HeroBadge() {
  return (
    <div className="badge-row">
      <span className="pill pill-success">
        <CheckCircle2 size={14} /> Full Access Approved
      </span>
    </div>
  );
}

function AdvisorCard({ adv }: { adv: AppUser }) {
  return (
    <aside className="advisor" aria-label="Primary advisor">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="advisor__avatar">{adv.firstName[0]}{adv.lastName[0]}</span>
        <div>
          <div style={{ font: '700 16px/22px var(--font-display)', color: '#fff' }}>{adv.firstName} {adv.lastName}</div>
          <span className="pill pill-brand" style={{ marginTop: 4 }}>Primary Advisor</span>
        </div>
      </div>
      <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,.18)', margin: '12px 0' }} />
      <div style={{ display: 'grid', gap: 8, font: '400 12px/18px var(--font-body)', color: '#fff' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> {adv.emailId}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +91 80 4719 0000</span>
      </div>
      <Link to="/settings" className="btn btn-inverse btn-block" style={{ marginTop: 16 }}>Contact Advisor</Link>
    </aside>
  );
}

function MarketAside() {
  const opportunities = useColl<Opportunity>('opportunities');
  const top = [...opportunities].sort((a, b) => a.rank - b.rank).slice(0, 5);
  return (
    <div>
      <h2 style={{ font: '700 20px/24px var(--font-display)', color: 'var(--text-strong)', textTransform: 'uppercase', letterSpacing: '.02em', margin: '0 0 8px' }}>
        Explore opportunities
      </h2>
      <p style={{ font: '400 12px/18px var(--font-body)', color: 'var(--text-muted)', margin: '0 0 16px' }}>
        We monitor a select, evolving list of mid- to late-stage companies for educational purposes only. Inclusion does not imply endorsement or investment advice.
      </p>
      <div className="pulse-panel">
        {top.map((o) => (
          <Link key={o._id} to={`/opportunities/${o._id}`} className="pulse-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span style={{ font: '700 18px/22px var(--font-display)', color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em' }}>{o.name}</span>
              <span className="tnum" style={{ font: '700 18px/24px var(--font-display)', color: '#fff' }}>
                {o.tsgPrice ? `$${o.tsgPrice.toFixed(2)}` : '—'}
              </span>
            </div>
            <div style={{ font: '400 12px/18px var(--font-body)', color: '#a9c3ec', marginTop: 4 }}>{o.sector}</div>
          </Link>
        ))}
        <Link to="/opportunities" className="btn btn-inverse btn-block" style={{ height: 48, fontSize: 16, marginTop: 8 }}>
          View all <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function Landing({ opportunities, funds, articles, users }: {
  opportunities: Opportunity[]; funds: FundOffering[]; articles: Article[]; users: AppUser[];
}) {
  const live = funds.filter((f) => f.status === 'live');
  const raised = funds.reduce((a, f) => a + (f.raised ?? 0), 0);
  const investors = users.filter((u) => u.roleGroup === 'investor').length;
  const top = [...opportunities].sort((a, b) => a.rank - b.rank).slice(0, 6);
  const liveFunds = live.slice(0, 3);
  const posts = articles.filter((a) => a.status === 'published').slice(0, 3);
  const money = fmtMoney;
  const activityPill = (a: string) =>
    a === 'High' ? 'pill-live' : a === 'Medium' ? 'pill-info' : 'pill-neutral';
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <section style={{ textAlign: 'center', padding: '40px 16px 8px', maxWidth: 860, margin: '0 auto' }}>
        <span className="pill pill-brand">Private markets, modernized</span>
        <h1 style={{ font: '600 clamp(30px,4.5vw,52px)/1.1 var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-strong)', margin: '16px 0 0' }}>
          Buy and sell pre-IPO shares with confidence
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
          Live pricing, curated funds and guided checkout across {opportunities.length} tracked companies.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/opportunities" className="btn btn-accent" style={{ height: 44, padding: '0 28px' }}>Browse opportunities</Link>
          <Link to="/auth/signup" className="btn btn-ghost" style={{ height: 44, padding: '0 28px' }}>Create account</Link>
        </div>
        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <div><div className="tnum" style={{ font: '600 24px var(--font-display)', color: 'var(--text-strong)' }}>{live.length}</div><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Live funds</div></div>
          <div><div className="tnum" style={{ font: '600 24px var(--font-display)', color: 'var(--text-strong)' }}>{opportunities.length}</div><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Tracked companies</div></div>
          <div><div className="tnum" style={{ font: '600 24px var(--font-display)', color: 'var(--text-strong)' }}>{money(raised)}</div><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Raised across funds</div></div>
          <div><div className="tnum" style={{ font: '600 24px var(--font-display)', color: 'var(--text-strong)' }}>{investors}</div><div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Registered investors</div></div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Top opportunities</h2>
          <Link to="/opportunities" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="dtable">
          <table className="grid" style={{ minWidth: 760 }}>
            <thead><tr><th>#</th><th>Company</th><th>Sector</th><th>TSG Price</th><th>1Y</th><th>Last Round</th><th>Valuation</th><th>Activity</th><th /></tr></thead>
            <tbody>
              {top.map((o) => (
                <tr key={o._id}>
                  <td className="tnum">{o.rank}</td>
                  <td><Link to={`/opportunities/${o._id}`} className="link-more" style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{o.name}</Link></td>
                  <td>{o.sector}</td>
                  <td className="tnum"><b>{o.tsgPrice ? `$${o.tsgPrice.toFixed(2)}` : 'N/A'}</b></td>
                  <td className={`tnum ${o.priceChange1Y != null && o.priceChange1Y >= 0 ? 'up' : 'down'}`}>{o.priceChange1Y != null ? fmtPct(o.priceChange1Y, 1) : '—'}</td>
                  <td>{o.lastRound?.round ?? '—'}</td>
                  <td className="tnum">{o.lastRound ? fmtMoney(o.lastRound.valuation) : '—'}</td>
                  <td><span className={`pill ${activityPill(o.activity)}`}>{o.activity}</span></td>
                  <td><Link to={`/opportunities/${o._id}`} className="link-more" style={{ fontSize: 12 }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Live fund offerings</h2>
          <Link to="/funds" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {liveFunds.map((f) => {
            const pct = f.raised && f.offeringSize ? Math.min(100, Math.round((f.raised / f.offeringSize) * 100)) : 0;
            return (
              <div key={f._id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '2 1 220px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{f.fundName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{f.sector} · min ${f.minimumInvestment.toLocaleString()}</div>
                </div>
                <div style={{ flex: '3 1 240px' }}>
                  <div className="progress" style={{ marginTop: 0 }}><span style={{ width: `${pct}%` }} /></div>
                  <div className="tnum" style={{ fontSize: 12, marginTop: 4 }}><strong style={{ color: 'var(--success-text)' }}>{money(f.raised ?? 0)}</strong> <span style={{ color: 'var(--text-subtle)' }}>of {money(f.offeringSize)} · {pct}%</span></div>
                </div>
                <Link to={`/indications/new?fund=${f._id}`} className="btn btn-accent" style={{ height: 34 }}>Express interest</Link>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Insights</h2>
          <Link to="/insights" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="grid-posts">
          {posts.map((a) => (
            <article key={a._id} className="post">
              <Link to={`/insights/${a._id}`} className="post__media" aria-label={a.title}>
                <span className="fill" aria-hidden="true">{a.title.charAt(0)}</span>
                <span className="pill pill-brand post__tag">{a.category}</span>
              </Link>
              <h3><Link to={`/insights/${a._id}`}>{a.title}</Link></h3>
              <p className="post__meta"><span>TSG Invest</span><span>{a.updatedAt}</span></p>
            </article>
          ))}
        </div>
      </section>

      <div className="risk-note"><b>Risk disclosure:</b> private-market interests are illiquid and may lose value. Figures shown are illustrative. Not investment advice.</div>
    </div>
  );
}

export default function Home() {
  const auth = useSelector((s: RootState) => s.auth);
  const first = auth.user ? auth.user.email.split('@')[0] : 'Drew';
  const funds = useColl<FundOffering>('funds');
  const opportunities = useColl<Opportunity>('opportunities');
  const articles = useColl<Article>('articles');
  const users = useColl<AppUser>('users');
  const liveCount = funds.filter((f) => f.status === 'live').length;
  const cards = opportunities.slice(0, 2).map((o) => ({
    opp: o,
    fund: funds.find((f) => f._id === o.fundId),
  }));
  const posts = articles.filter((a) => a.status === 'published').slice(0, 3);
  const adv = users.find((u) => u.roleGroup === 'advisor') ?? users[0];

  if (!auth.user) {
    return <Landing opportunities={opportunities} funds={funds} articles={articles} users={users} />;
  }

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section className="hero">
        {auth.user && <HeroBadge />}
        <div className="hero-grid">
          <div>
            <h1>Welcome back, {first}.<br />You&apos;re investment ready!</h1>
            <p className="sub">Explore opportunities and start investing today. {liveCount} live funds · {opportunities.length} tracked opportunities.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <Link to="/opportunities" className="btn btn-inverse" style={{ height: 36 }}>Explore opportunities</Link>
              {!auth.user && <Link to="/auth/login" className="btn btn-ghost" style={{ height: 36 }}>Log in</Link>}
            </div>
          </div>
          <div className="hide-lg"><AdvisorCard adv={adv} /></div>
        </div>
      </section>
      <div className="show-lg"><AdvisorCard adv={adv} /></div>

      <div className="layout-main">
        <section>
          <div className="section-head">
            <h2>Opportunities</h2>
            <Link to="/opportunities" className="btn btn-ghost">View all Opportunities <ArrowRight size={16} /></Link>
          </div>
          <div className="grid-opp">
            {cards.map(({ opp, fund }) => <OppCard key={opp._id} opp={opp} fund={fund} />)}
          </div>
        </section>
        <MarketAside />
      </div>

      <section>
        <div className="section-head">
          <h2>Updates</h2>
          <Link to="/insights" className="btn btn-ghost">View all Updates <ArrowRight size={16} /></Link>
        </div>
        <div className="grid-posts">
          {posts.map((a) => (
            <article key={a._id} className="post">
              <Link to={`/insights/${a._id}`} className="post__media" aria-label={a.title}>
                <span className="fill" aria-hidden="true">{a.title.charAt(0)}</span>
                <span className="pill pill-brand post__tag">{a.category}</span>
              </Link>
              <h3 style={{ font: '700 16px/22px var(--font-display)' }}><Link to={`/insights/${a._id}`}>{a.title}</Link></h3>
              <p className="post__meta"><span>TSG Invest</span><span>{a.updatedAt}</span></p>
              <Link to={`/insights/${a._id}`} className="link-more" style={{ marginTop: 12 }}>Read more <ArrowRight size={16} /></Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
