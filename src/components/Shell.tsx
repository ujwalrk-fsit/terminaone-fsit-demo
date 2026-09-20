import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, Search, Building2, LayoutGrid, Star, Landmark, FolderOpen,
  Briefcase, ArrowLeftRight, Repeat, ReceiptText, FileCheck2,
  Moon, ShieldCheck, LogOut,
} from 'lucide-react';
import { logout, type RootState } from '../store';
import { Menu } from './Menu';
import { toggleTheme, useTheme } from '../theme';

function initials(email: string) {
  const name = email.split('@')[0];
  const parts = name.split(/[._-]+/);
  return ((parts[0]?.[0] ?? 'T') + (parts[1]?.[0] ?? 'O')).toUpperCase();
}

const icon = (el: React.ReactNode) => <span style={{ display: 'inline-flex' }}>{el}</span>;

export function Shell({ children }: { children: React.ReactNode }) {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const theme = useTheme();
  const isAdmin = auth.user && ['admin', 'fund_manager', 'monitor'].includes(auth.user.roleGroup);
  const exploring = loc.pathname.startsWith('/opportunities') || loc.pathname.startsWith('/funds') || loc.pathname === '/watchlist';
  const active = loc.pathname.startsWith('/indications') || loc.pathname.startsWith('/portfolio') || loc.pathname.startsWith('/transactions') || loc.pathname.startsWith('/documents');

  const exploreItems = [
    { icon: icon(<LayoutGrid size={18} />), title: 'Market Opportunities', desc: 'Find active opportunities to invest in', to: '/opportunities' },
    { icon: icon(<Building2 size={18} />), title: 'Browse Companies', desc: 'Explore our curated list of private companies', to: '/opportunities' },
    { icon: icon(<Star size={18} />), title: 'Watchlist', desc: 'Track the private companies that matter to you', to: '/watchlist' },
    { icon: icon(<Landmark size={18} />), title: 'Fund Offerings', desc: 'See current opportunities to buy funds', to: '/funds' },
    { icon: icon(<FolderOpen size={18} />), title: 'Data Room', desc: 'Diligence documents, versions and access per fund', to: '/data-room' },
  ];
  const activityItems = [
    { icon: icon(<Briefcase size={18} />), title: 'My Holdings', desc: 'View and manage your holdings', to: '/portfolio' },
    { icon: icon(<ArrowLeftRight size={18} />), title: 'My Bids & Asks', desc: 'View and manage your active bids and asks', to: '/indications' },
    { icon: icon(<Repeat size={18} />), title: 'My Counter Offers', desc: 'Review all counter offers you\u2019ve received or submitted', to: '/indications' },
    { icon: icon(<ReceiptText size={18} />), title: 'My Trades', desc: 'Monitor progress and history across all your transactions', to: '/transactions' },
    { icon: icon(<FileCheck2 size={18} />), title: 'My Offerings', desc: 'View offering activity and updates', to: '/documents' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="t-header">
        <div className="t-container" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={{ font: '700 18px var(--font-display)', color: 'var(--text-strong)', textDecoration: 'none', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--sentinel-purple)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15 }}>T</span>
            TERMINAONE
          </Link>
          <div className="t-search-wrap hide-md">
            <Search size={16} />
            <input className="t-search" placeholder="Search for companies" aria-label="Search" />
          </div>
          <nav className="t-nav hide-md">
            {auth.user ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
                <Menu label="Explore" items={exploreItems} active={exploring} />
                <Menu label="My Activity" items={activityItems} active={active} />
                {isAdmin && <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>Admin</NavLink>}
              </>
            ) : (
              <>
                <Menu label="Explore" items={exploreItems.slice(0, 2).concat(exploreItems.slice(3))} />
                <NavLink to="/insights" className={({ isActive }) => (isActive ? 'active' : '')}>Insights</NavLink>
              </>
            )}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {auth.user ? (
              <>
                <Link to="/indications/new" className="btn btn-outline hide-md" style={{ height: 36 }}>Buy Or Sell</Link>
                <Link to="/notifications" className="t-iconbtn" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="t-dot" />
                </Link>
                <Menu
                  align="right"
                  label={<span className="t-avatar">{initials(auth.user.email)}</span>}
                  items={[
                    {
                      title: (
                        <span>
                          <span style={{ display: 'block', color: 'var(--text-strong)' }}>{auth.user.email.split('@')[0]}</span>
                          <span style={{ display: 'block', font: '400 12px var(--font-body)', color: 'var(--text-muted)' }}>{auth.user.email} · {auth.user.roleGroup}</span>
                          <span className="btn btn-ghost btn-block" style={{ marginTop: 8, pointerEvents: 'none' }}>Manage My Profile</span>
                        </span>
                      ),
                      to: '/settings',
                    },
                    { icon: icon(<Moon size={16} />), title: theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode', onClick: toggleTheme },
                    { icon: icon(<ShieldCheck size={16} />), title: 'Security center', to: '/settings' },
                    { icon: icon(<LogOut size={16} />), title: 'Log out', onClick: () => { dispatch(logout()); nav('/'); } },
                  ]}
                />
              </>
            ) : (
              <>
                <NavLink to="/auth/login" className="link-more hide-md">Log In</NavLink>
                <Link to="/auth/login" className="btn btn-primary" style={{ height: 36 }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="t-container" style={{ paddingTop: 32, paddingBottom: 48 }}>{children}</main>
      <footer className="t-footer">
        <div className="t-container" style={{ padding: '20px 24px 24px', fontSize: 11, color: 'var(--text-subtle)' }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <Link to="/insights">Terms of Use</Link>
            <Link to="/insights">Privacy Policy</Link>
            <Link to="/insights">Disclosures</Link>
            <Link to="/ui-kit">UI kit</Link>
            <Link to="/insights">Insights</Link>
          </div>
          <p style={{ margin: 0, textAlign: 'center', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
            TerminaOne is a design-reference build. All prices, valuations and company data are illustrative sample data,
            not offers or investment advice. Secondary transactions are subject to transfer restrictions, consents and
            applicable securities regulations. © 2026 TerminaOne.
          </p>
        </div>
      </footer>
    </div>
  );
}

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card">{children}</div>
);
export const Empty = ({ text }: { text: string }) => (
  <div style={{ border: '1px dashed var(--border-default)', borderRadius: 12, padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>{text}</div>
);
export const Err = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div style={{ border: '1px solid var(--danger)', background: 'var(--warn-bg)', borderRadius: 8, padding: 16, fontSize: 13 }}>Error: {text} {onRetry && <button style={{ textDecoration: 'underline' }} onClick={onRetry}>Retry</button>}</div>
);
export const Skeleton = () => (
  <div className="card" style={{ color: 'var(--text-subtle)' }}>Loading…</div>
);
