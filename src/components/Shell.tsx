import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, type RootState } from '../store';

export function Shell({ children }: { children: React.ReactNode }) {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-extrabold tracking-tight text-[#0b3b8f]">TERMINAONE</Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link to="/opportunities">Marketplace</Link>
            <Link to="/insights">Insights</Link>
            {auth.user && <><Link to="/dashboard">Dashboard</Link><Link to="/portfolio">Portfolio</Link><Link to="/indications">Indications</Link><Link to="/documents">Documents</Link><Link to="/watchlist">Watchlist</Link></>}
            {(auth.user?.roleGroup === 'admin' || auth.user?.roleGroup === 'fund_manager' || auth.user?.roleGroup === 'monitor') && <Link to="/admin">Admin</Link>}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            {auth.user ? (
              <><span className="rounded bg-slate-100 px-2 py-1">{auth.user.roleGroup}</span>
              <button className="rounded border px-2 py-1" onClick={() => { dispatch(logout()); nav('/'); }}>Logout</button></>
            ) : (<><Link to="/auth/login">Login</Link><Link to="/auth/signup" className="rounded bg-[#0b3b8f] px-2 py-1 text-white">Sign up</Link></>)}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-slate-500">Mock reference — all figures synthetic. No real securities offered.</footer>
    </div>
  );
}

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">{children}</div>
);
export const Empty = ({ text }: { text: string }) => (
  <div className="rounded border border-dashed p-6 text-center text-sm text-slate-500">{text}</div>
);
export const Err = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div className="rounded border border-red-200 bg-red-50 p-4 text-sm">Error: {text} {onRetry && <button className="ml-2 underline" onClick={onRetry}>Retry</button>}</div>
);
export const Skeleton = () => <div className="animate-pulse rounded bg-slate-200 p-6">Loading…</div>;
