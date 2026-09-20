import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, CheckCircle2, Mail, Phone } from 'lucide-react';
import { funds, opportunities, articles, users } from '../mocks/seed';
import type { RootState } from '../store';
import { OppCard } from '../components/OppCard';

function HeroBadge() {
  return (
    <span className="pill pill-success badge">
      <CheckCircle2 size={14} /> Full Access Approved
    </span>
  );
}

function AdvisorCard() {
  const adv = users.find((u) => u.roleGroup === 'advisor')!;
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
      <p style={{ margin: 0, font: '700 12px/18px var(--font-display)', color: '#fff' }}>Hi there,</p>
      <p style={{ margin: '4px 0 0', font: '400 12px/18px var(--font-body)', color: 'var(--primary-100)' }}>
        I&apos;m your dedicated advisor — here to help with onboarding, reviewing opportunities, or answering investment questions.
      </p>
      <div style={{ display: 'grid', gap: 8, marginTop: 12, font: '400 12px/18px var(--font-body)', color: '#fff' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> {adv.emailId}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +91 80 4719 0000</span>
      </div>
      <Link to="/settings" className="btn btn-inverse btn-block" style={{ marginTop: 16 }}>Contact Advisor</Link>
    </aside>
  );
}

function MarketAside() {
  const top = [...opportunities].sort((a, b) => a.rank - b.rank).slice(0, 5);
  return (
    <div>
      <h2 style={{ font: '700 20px/24px var(--font-display)', color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', margin: '0 0 8px' }}>
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
            <div style={{ font: '400 12px/18px var(--font-body)', color: 'var(--primary-200)', marginTop: 4 }}>{o.sector}</div>
          </Link>
        ))}
        <Link to="/opportunities" className="btn btn-inverse btn-block" style={{ height: 48, fontSize: 16, marginTop: 8 }}>
          View all <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const auth = useSelector((s: RootState) => s.auth);
  const first = auth.user ? auth.user.email.split('@')[0] : 'Drew';
  const liveCount = funds.filter((f) => f.status === 'live').length;
  const cards = opportunities.slice(0, 4).map((o) => ({
    opp: o,
    fund: funds.find((f) => f._id === o.fundId),
  }));
  const posts = articles.filter((a) => a.status === 'published');

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section className="hero">
        <svg className="hero__rays" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ray" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".6" stopColor="#fff" stopOpacity=".55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="url(#ray)" fill="none" strokeLinecap="round">
            <path d="M300 300 L800 70" strokeWidth="1.5" />
            <path d="M380 300 L800 110" strokeWidth="1" />
            <path d="M460 300 L800 150" strokeWidth="2" opacity=".7" />
            <path d="M540 300 L800 190" strokeWidth="1" opacity=".5" />
          </g>
        </svg>
        {auth.user && <HeroBadge />}
        <div className="hero-grid">
          <div>
            <h1>Welcome back, {first}.<br />You&apos;re investment ready!</h1>
            <p className="sub">Explore opportunities and start investing today. {liveCount} live funds · {opportunities.length} tracked opportunities (mock).</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link to="/opportunities" className="btn btn-inverse">Explore opportunities</Link>
              {!auth.user && <Link to="/auth/login" className="btn btn-ghost">Log in</Link>}
            </div>
          </div>
          <div className="hide-lg"><AdvisorCard /></div>
        </div>
      </section>
      <div className="show-lg"><AdvisorCard /></div>

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
