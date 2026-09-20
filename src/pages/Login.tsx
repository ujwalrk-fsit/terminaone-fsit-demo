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
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => (
        <button key={r} className="rounded border px-2 py-1 text-xs" onClick={() => { dispatch(loginAs(r)); nav('/dashboard'); }}>{r}</button>
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
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-extrabold">Login (mock native JWT)</h1>
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit((v) => {
          try { dispatch(login(v)); nav('/dashboard'); } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Login failed'); }
        })}>
          <input {...register('email')} className="w-full rounded border p-2 text-sm" placeholder="email" />
          <input {...register('password')} type="password" className="w-full rounded border p-2 text-sm" placeholder="password" />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="w-full rounded bg-[#0b3b8f] py-2 text-sm text-white">Login</button>
        </form>
        <div className="mt-3 text-xs">Demo: investor@demo.local / investor123 · admin@demo.local / admin123</div>
        <div className="mt-2 text-sm"><Link to="/auth/forgot" className="underline">Forgot password?</Link> · <Link to="/auth/signup" className="underline">Sign up</Link></div>
      </Card>
      <Card><div className="mb-2 text-sm font-bold">One-click role switch (dev reference)</div><RoleSwitcher /></Card>
    </div>
  );
}
