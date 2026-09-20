import { useEffect, useState, type ReactElement } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Shell } from './components/Shell';
import { logout, touch, sessionTimeoutMin, type RootState } from './store';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import { Indications, IndicationNew } from './pages/Indications';
import { Documents, Transfers, Notifications, Settings } from './pages/AppPages';
import Watchlist from './pages/Watchlist';
import Admin from './pages/Admin';
import Funds from './pages/Funds';
import UiKit from './pages/UiKit';
import { Insights, InsightDetail, SimpleAuth } from './pages/Misc';

function RequireAuth({ children }: { children: ReactElement }) {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function InsightById() { const { id } = useParams(); return <InsightDetail id={id ?? ''} />; }

function SessionGuard() {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const [warn, setWarn] = useState(false);
  useEffect(() => {
    const onAct = () => dispatch(touch());
    window.addEventListener('pointerdown', onAct);
    window.addEventListener('keydown', onAct);
    return () => { window.removeEventListener('pointerdown', onAct); window.removeEventListener('keydown', onAct); };
  }, [dispatch]);
  useEffect(() => {
    if (!auth.user) return;
    const t = setInterval(() => {
      const idleMin = (Date.now() - auth.lastActive) / 60000;
      if (idleMin > sessionTimeoutMin) { dispatch(logout()); setWarn(false); }
      else if (idleMin > sessionTimeoutMin - 1) setWarn(true);
    }, 15000);
    return () => clearInterval(t);
  }, [auth, dispatch]);
  useEffect(() => {
    const h = () => dispatch(logout());
    window.addEventListener('tsg:unauthorized', h);
    return () => window.removeEventListener('tsg:unauthorized', h);
  }, [dispatch]);
  if (!warn || !auth.user) return null;
  return (
    <div className="card" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50, fontSize: 13, boxShadow: 'var(--elev-2)' }}>
      Session expiring in ~1 min. <button className="btn btn-primary" style={{ height: 32, marginLeft: 8 }} onClick={() => { dispatch(touch()); setWarn(false); }}>Stay</button>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <SessionGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/funds" element={<Funds />} />
        <Route path="/ui-kit" element={<UiKit />} />
        {/* legacy alias: /marketplace -> /opportunities */}
        <Route path="/marketplace" element={<Navigate to="/opportunities" replace />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:id" element={<InsightById />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<SimpleAuth title="Sign up" text="Create an account to start investing. Or use log in with a sample profile." />} />
        <Route path="/auth/forgot" element={<SimpleAuth title="Reset password" text="Enter your email and we'll send you a reset link." />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
        <Route path="/indications" element={<RequireAuth><Indications /></RequireAuth>} />
        <Route path="/indications/new" element={<RequireAuth><IndicationNew /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><Documents /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><Transfers /></RequireAuth>} />
        <Route path="/watchlist" element={<RequireAuth><Watchlist /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="*" element={<div>404 — route not found (edge case). <a href="/" className="underline">Home</a></div>} />
      </Routes>
    </Shell>
  );
}
