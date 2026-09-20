import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, Building2, LayoutGrid, Star, Landmark, FolderOpen,
  Briefcase, ArrowLeftRight, Repeat, ReceiptText, FileCheck2,
  Moon, ShieldCheck, LogOut,
} from 'lucide-react';
import { logout, type RootState } from '../store';
import { Menu } from './Menu';
import SearchBox from './SearchBox';
import Sidebar from './Sidebar';
import { toggleTheme, useTheme } from '../theme';

function initials(email: string) {
  const name = email.split('@')[0];
  const parts = name.split(/[._-]+/);
  return ((parts[0]?.[0] ?? 'T') + (parts[1]?.[0] ?? 'O')).toUpperCase();
}

const icon = (el: React.ReactNode) => <span style={{ display: 'inline-flex' }}>{el}</span>;
const SIDE_KEY = 'tsg.side';
function loadMini() {
  try { const v = localStorage.getItem(SIDE_KEY); return v === null ? true : v === '1'; } catch { return true; }
}

export function Shell({ children }: { children: React.ReactNode }) {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [mini, setMini] = useState(loadMini);
  const railed = !!auth.user && auth.user.roleGroup !== 'investor';

  const flipMini = () => {
    setMini((m) => {
      try { localStorage.setItem(SIDE_KEY, m ? '0' : '1'); } catch { /* */ }
      return !m;
    });
  };

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
        <div className="t-container" style={{ height: 56, display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" style={{ font: '700 17px var(--font-display)', color: 'var(--text-strong)', textDecoration: 'none', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--sentinel-purple)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14 }}>T</span>
            TERMINAONE
          </Link>
          <div className="hide-md"><SearchBox /></div>
          {!railed && (
            <nav className="t-nav hide-md">
              {auth.user ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
                  <Menu label="Explore" items={exploreItems} active={location.pathname.startsWith('/opportunities') || location.pathname.startsWith('/funds')} />
                  <Menu label="My Activity" items={activityItems} active={location.pathname.startsWith('/indications') || location.pathname.startsWith('/portfolio')} />
                </>
              ) : (
                <>
                  <Menu label="Explore" items={[exploreItems[0], exploreItems[1], exploreItems[3]]} />
                  <NavLink to="/insights" className={({ isActive }) => (isActive ? 'active' : '')}>Insights</NavLink>
                </>
              )}
            </nav>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {auth.user ? (
              <>
                {!railed && <Link to="/indications/new" className="btn btn-outline hide-md" style={{ height: 34 }}>Buy Or Sell</Link>}
                <Link to="/notifications" className="t-iconbtn" aria-label="Notifications">
                  <Bell size={16} />
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
                    { icon: icon(<LogOut size={16} />), title: 'Log out', onClick: () => { dispatch(logout()); navigate('/'); } },
                  ]}
                />
              </>
            ) : (
              <>
                <NavLink to="/auth/login" className="link-more hide-md">Log In</NavLink>
                <Link to="/auth/login" className="btn btn-primary" style={{ height: 34 }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {railed && auth.user ? (
        <div className="t-container app-shell">
          <Sidebar role={auth.user.roleGroup} mini={mini} onToggle={flipMini} />
          <div className="content"><main>{children}</main></div>
        </div>
      ) : (
        <main className="t-container" style={{ paddingTop: 16, paddingBottom: 28 }}>{children}</main>
      )}

      <footer className="t-footer">
        <div className="t-container" style={{ padding: '14px 16px 16px', fontSize: 11, color: 'var(--text-subtle)' }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
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
  <div style={{ border: '1px dashed var(--border-default)', borderRadius: 10, padding: 18, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>{text}</div>
);
export const Err = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div style={{ border: '1px solid var(--danger)', background: 'var(--warn-bg)', borderRadius: 8, padding: 12, fontSize: 12 }}>Error: {text} {onRetry && <button style={{ textDecoration: 'underline' }} onClick={onRetry}>Retry</button>}</div>
);
export const Skeleton = () => (
  <div className="card" style={{ color: 'var(--text-subtle)' }}>Loading…</div>
);
