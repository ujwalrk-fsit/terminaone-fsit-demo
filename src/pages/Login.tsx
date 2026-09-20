import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, loginAs } from '../store';
import { Card } from '../components/Shell';
import type { RoleGroup } from '../types';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type F = z.infer<typeof schema>;

export function RoleSwitcher() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const roles: RoleGroup[] = ['admin', 'advisor', 'affiliate', 'fund_manager', 'monitor', 'investor'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {roles.map((r) => (
        <button key={r} className="chip" onClick={() => { dispatch(loginAs(r)); nav('/dashboard'); }}>{r}</button>
      ))}
    </div>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const { register, handleSubmit } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { email: 'investor@demo.local', password: 'investor123' } });
  return (
    <div style={{ maxWidth: 440, margin: '40px auto', display: 'grid', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ font: '800 22px var(--font-display)', color: 'var(--text-strong)', letterSpacing: '.04em' }}>TERMINA<span style={{ color: 'var(--primary-600)' }}>ONE</span></div>
        <h1 style={{ font: '700 20px/26px var(--font-display)', color: 'var(--text-strong)', margin: '12px 0 0' }}>Log in</h1>
      </div>
      <Card>
        <form style={{ display: 'grid', gap: 12 }} onSubmit={handleSubmit((v) => {
          try { dispatch(login(v)); nav('/dashboard'); } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Login failed'); }
        })}>
          <input {...register('email')} style={{ padding: 10 }} placeholder="email" aria-label="Email" />
          <input {...register('password')} type="password" style={{ padding: 10 }} placeholder="password" aria-label="Password" />
          {err && <div style={{ fontSize: 13, color: 'var(--danger)' }}>{err}</div>}
          <button className="btn btn-primary btn-block">Login</button>
        </form>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-subtle)' }}>Sample logins: investor@demo.local / investor123 · admin@demo.local / admin123</div>
        <div style={{ marginTop: 8, fontSize: 13 }}><Link to="/auth/forgot" className="link-more">Forgot password?</Link> · <Link to="/auth/signup" className="link-more">Sign up</Link></div>
      </Card>
      <Card><div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>Switch role</div><RoleSwitcher /></Card>
    </div>
  );
}
