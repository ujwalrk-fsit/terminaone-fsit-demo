import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, PieChart, Landmark, SlidersHorizontal } from 'lucide-react';
import { login, loginAs } from '../store';
import { announce } from '../components/Live';
import { Field, focusFirstError } from '../components/Field';
import type { RoleGroup } from '../types';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type F = z.infer<typeof schema>;

const REM_KEY = 'tsg.remember';
function remembered(): string {
  try { return localStorage.getItem(REM_KEY) ?? 'investor@terminaone.com'; } catch { return 'investor@terminaone.com'; }
}

export function BrandPanel() {
  return (
    <div className="auth-brand">
      <h1>Welcome to your one-stop shop for private markets</h1>
      <div className="auth-prop">
        <span className="ic"><PieChart size={16} /></span>
        <span><b>Smart diversification</b><small>Gain broad exposure to private equity, real estate, private credit, and more, all in one place.</small></span>
      </div>
      <div className="auth-prop">
        <span className="ic"><Landmark size={16} /></span>
        <span><b>Prominent managers</b><small>Invest alongside some of the world&apos;s largest private markets sponsors.</small></span>
      </div>
      <div className="auth-prop">
        <span className="ic"><SlidersHorizontal size={16} /></span>
        <span><b>Invest your way</b><small>Build your own portfolio, or let our automated investing solution handle everything for you.</small></span>
      </div>
    </div>
  );
}

export function RoleSwitcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roles: RoleGroup[] = ['admin', 'advisor', 'affiliate', 'fund_manager', 'monitor', 'investor'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {roles.map((r) => (
        <button key={r} className="chip" onClick={() => { dispatch(loginAs(r)); navigate('/dashboard'); }}>{r}</button>
      ))}
    </div>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { email: remembered(), password: 'investor123' } });
  return (
    <div className="auth-split">
      <BrandPanel />
      <div className="auth-form">
        <div className="auth-card">
          <div className="auth-word" translate="no">TerminaOne</div>
          <div className="auth-sub">Log in</div>
          <form onSubmit={handleSubmit((v) => {
            try {
              dispatch(login(v));
              try {
                if (remember) localStorage.setItem(REM_KEY, v.email.toLowerCase());
                else localStorage.removeItem(REM_KEY);
              } catch { /* */ }
              navigate('/dashboard');
            } catch (e: unknown) {
              const m = e instanceof Error ? e.message : 'Login failed';
              setErr(m); announce(m);
            }
          }, () => focusFirstError())}>
            <div style={{ display: 'grid', gap: 10 }}>
              <Field label="Email" required error={errors.email?.message}>
                <input {...register('email')} placeholder="you@example.com" autoComplete="email" name="email" spellCheck={false} />
              </Field>
              <div>
                <label htmlFor="login-password" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 4 }}>
                  Password <span aria-hidden="true" style={{ color: 'var(--danger)' }}> *</span><span className="sr-only"> (required)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input {...register('password')} id="login-password" type={show ? 'text' : 'password'} placeholder="Password" autoComplete="current-password" name="password" aria-invalid={!!errors.password} style={{ paddingRight: 40, width: '100%' }} />
                  <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, top: 8 }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password?.message && <div role="alert" style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.password.message}</div>}
              </div>
            </div>
            {err && <div role="alert" style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>{err}</div>}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, margin: '2px 0 14px' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
              </label>
              <Link to="/auth/forgot" style={{ marginLeft: 'auto', textDecoration: 'underline', color: 'var(--text-default)' }}>Forgot password?</Link>
            </div>
            <button className="btn btn-accent btn-block" style={{ height: 44 }}>Log in</button>
          </form>
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 18, color: 'var(--text-muted)' }}>
            Log in with: investor@terminaone.com / investor123 · admin@terminaone.com / admin123
          </div>
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 8 }}>
            Don&apos;t have an account yet?<br /><Link to="/auth/signup" style={{ textDecoration: 'underline', color: 'var(--text-default)' }}>Create one today</Link>
          </div>
          <div style={{ marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 6, textAlign: 'center' }}>Switch role</div>
            <RoleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
