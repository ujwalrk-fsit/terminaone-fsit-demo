import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Search } from 'lucide-react';
import { logout, type RootState } from '../store';

function initials(email: string) {
  const name = email.split('@')[0];
  const parts = name.split(/[._-]+/);
  return ((parts[0]?.[0] ?? 'T') + (parts[1]?.[0] ?? 'O')).toUpperCase();
}

export function Shell({ children }: { children: React.ReactNode }) {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const isAdmin = auth.user && ['admin', 'fund_manager', 'monitor'].includes(auth.user.roleGroup);
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="t-header">
        <div className="t-container" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={{ font: '800 18px var(--font-display)', color: '#fff', textDecoration: 'none', letterSpacing: '.04em' }}>
            TERMINA<span style={{ color: 'var(--primary-400)' }}>ONE</span>
          </Link>
          <div style={{ position: 'relative' }} className="hide-md">
            <Search size={16} color="#fff" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input className="t-search" placeholder="Search funds, investments, etc." aria-label="Search" />
          </div>
          <nav className="t-nav hide-md" style={{ display: 'flex', gap: 32 }}>
            {auth.user ? (
              <>
                <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
                <NavLink to="/opportunities" className={link}>Explore</NavLink>
                <NavLink to="/indications" className={link}>Activities</NavLink>
                {isAdmin && <NavLink to="/admin" className={link}>Admin</NavLink>}
              </>
            ) : (
              <>
                <NavLink to="/opportunities" className={link}>Explore</NavLink>
                <NavLink to="/insights" className={link}>Insights</NavLink>
                <NavLink to="/auth/login" className={link}>Log In</NavLink>
              </>
            )}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {auth.user ? (
              <>
                <Link to="/notifications" className="t-iconbtn" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="t-dot" />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="t-avatar">{initials(auth.user.email)}</span>
                  <span style={{ lineHeight: 1.3 }}>
                    <span style={{ display: 'block', font: '700 12px/16px var(--font-display)', color: '#fff' }}>
                      {auth.user.email.split('@')[0]}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '400 11px/14px var(--font-body)', color: 'var(--text-subtle)' }}>
                      <span style={{ color: '#fff' }}>★</span> {auth.user.roleGroup}
                    </span>
                  </span>
                </div>
                <button className="btn btn-ghost" style={{ height: 36 }} onClick={() => { dispatch(logout()); nav('/'); }}>Logout</button>
              </>
            ) : (
              <Link to="/auth/login" className="btn btn-primary" style={{ height: 36 }}>Sign up</Link>
            )}
          </div>
        </div>
      </header>
      <main className="t-container" style={{ paddingTop: 32, paddingBottom: 48 }}>{children}</main>
      <footer className="t-footer">
        <div className="t-container" style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--text-subtle)' }}>
          Mock reference — all figures synthetic. No real securities offered.
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
  <div style={{ border: '1px solid rgba(255,77,106,.35)', background: 'rgba(255,77,106,.12)', borderRadius: 8, padding: 16, fontSize: 13 }}>Error: {text} {onRetry && <button style={{ textDecoration: 'underline' }} onClick={onRetry}>Retry</button>}</div>
);
export const Skeleton = () => (
  <div className="card" style={{ color: 'var(--text-subtle)' }}>Loading…</div>
);
