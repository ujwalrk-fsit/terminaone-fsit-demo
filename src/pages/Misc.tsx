import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useColl, upsert } from '../db';
import type { Article, AppUser, RoleGroup } from '../types';
import { login } from '../store';
import { Card } from '../components/Shell';
import { Markdown } from '../components/Markdown';
import { BrandPanel } from './Login';

export function Insights() {
  const articles = useColl<Article>('articles');
  const pub = articles.filter((a) => a.status === 'published');
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="section-head" style={{ margin: 0 }}><h2>Insights</h2><span className="pill pill-neutral">{pub.length} published</span></div>
      <div className="grid-posts">
        {pub.map((a) => (
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
    </div>
  );
}

export function InsightDetail({ id }: { id: string }) {
  const articles = useColl<Article>('articles');
  const a = articles.find((x) => x._id === id && x.status === 'published');
  if (!a) return <div>Article not found.</div>;
  return (
    <div style={{ maxWidth: 720, display: 'grid', gap: 10 }}>
      <span className="pill pill-brand" style={{ justifySelf: 'start' }}>{a.category}</span>
      <h1 className="page-h" style={{ fontSize: 28 }}>{a.title}</h1>
      <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>TSG Invest · {a.updatedAt}</div>
      <Card><Markdown text={a.bodyMarkdown} /></Card>
    </div>
  );
}

const signupSchema = z.object({
  firstName: z.string().min(1, 'Required'), lastName: z.string().min(1, 'Required'),
  email: z.string().email(), password: z.string().min(6, 'Min 6 characters'),
});
type SignupF = z.infer<typeof signupSchema>;

export function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useColl<AppUser>('users');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupF>({ resolver: zodResolver(signupSchema) });
  return (
    <div className="auth-split">
      <BrandPanel />
      <div className="auth-form">
        <div className="auth-card">
          <div className="auth-word">TerminaOne</div>
          <div className="auth-sub">Create account</div>
          <form onSubmit={handleSubmit((v) => {
            if (users.some((u) => u.emailId === v.email.toLowerCase())) { setErr('An account with this email already exists.'); return; }
            upsert('users', {
              _id: `u_${Date.now()}`, firstName: v.firstName, lastName: v.lastName,
              emailId: v.email.toLowerCase(), roleGroup: 'investor' as RoleGroup, roleId: 'r_investor',
              status: 'pending', investorStatus: 'PENDING_ONBOARDING', password: v.password,
            });
            try { dispatch(login({ email: v.email, password: v.password })); } catch { setErr('Account created. Please log in.'); return; }
            navigate('/onboarding');
          })}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div className="auth-field"><input {...register('firstName')} placeholder="First name" aria-label="First name" /></div>
              <div className="auth-field"><input {...register('lastName')} placeholder="Last name" aria-label="Last name" /></div>
            </div>
            <div className="auth-field"><input {...register('email')} placeholder="Email" aria-label="Email" /></div>
            <div className="auth-field">
              <input {...register('password')} type={show ? 'text' : 'password'} placeholder="Password (min 6)" aria-label="Password" style={{ paddingRight: 40 }} />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {(errors.firstName || errors.lastName || errors.email || errors.password) && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 8 }}>Please complete all fields correctly.</div>
            )}
            {err && <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>{err}</div>}
            <button className="btn btn-accent btn-block" style={{ height: 44 }}>Create account</button>
          </form>
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 18 }}>
            Have an account?<br /><Link to="/auth/login" style={{ textDecoration: 'underline', color: 'var(--text-default)' }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Forgot() {
  const users = useColl<AppUser>('users');
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const CODE = '123456';
  return (
    <div className="auth-split">
      <BrandPanel />
      <div className="auth-form">
        <div className="auth-card">
          <div className="auth-word">TerminaOne</div>
          <div className="auth-sub">Reset password</div>
          {step === 0 && (
            <div>
              <div className="auth-field"><input placeholder="Account email" aria-label="Account email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              {err && <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>{err}</div>}
              <button className="btn btn-accent btn-block" style={{ height: 44 }} onClick={() => {
                if (!users.some((u) => u.emailId === email.toLowerCase())) { setErr('No account found for this email.'); return; }
                setErr(''); setStep(1);
              }}>Send code</button>
            </div>
          )}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>Enter the 6-digit code sent to <b>{email}</b>. (Reference build code: <b className="tnum">{CODE}</b>)</div>
              <div className="auth-field"><input placeholder="123456" aria-label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} /></div>
              <div className="auth-field">
                <input type={show ? 'text' : 'password'} placeholder="New password (min 6)" aria-label="New password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err && <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>{err}</div>}
              <button className="btn btn-accent btn-block" style={{ height: 44 }} onClick={() => {
                const u = users.find((x) => x.emailId === email.toLowerCase());
                if (!u) { setErr('No account found for this email.'); return; }
                if (code.trim() !== CODE) { setErr('Incorrect code.'); return; }
                if (pw.length < 6) { setErr('Password needs at least 6 characters.'); return; }
                upsert('users', { ...u, password: pw });
                navigate('/auth/login');
              }}>Reset password</button>
            </div>
          )}
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 18 }}>
            <Link to="/auth/login" style={{ textDecoration: 'underline', color: 'var(--text-default)' }}>Back to log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
