import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JwtPayload, RoleGroup } from '../types';
import { users } from '../data/sample';

const LS_AUTH = 'tsg.auth';
const LS_WATCH = 'tsg.watchlist';
const LS_TIMEOUT = 'VITE_SESSION_TIMEOUT_MIN';

export function permissionsFor(role: RoleGroup) {
  if (role === 'admin') return [{ module: '*', actions: ['*'] }];
  if (role === 'fund_manager') return [{ module: 'FUND_OFFERINGS', actions: ['READ', 'UPDATE'] }, { module: 'INDICATIONS', actions: ['READ', 'UPDATE'] }];
  if (role === 'advisor') return [{ module: 'INDICATIONS', actions: ['READ'] }, { module: 'CLIENTS', actions: ['READ'] }];
  if (role === 'monitor') return [{ module: '*', actions: ['READ'] }];
  return [{ module: 'MARKETPLACE', actions: ['READ'] }];
}

interface AuthState { user: JwtPayload | null; email: string | null; lastActive: number; }
function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { user: null, email: null, lastActive: Date.now() };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuth() as AuthState,
  reducers: {
    login(state, a: PayloadAction<{ email: string; password: string }>) {
      const u = users.find((x) => x.emailId === a.payload.email.toLowerCase() && x.password === a.payload.password);
      if (!u) throw new Error('Invalid credentials. Try the sample logins on this page.');
      const payload: JwtPayload = { sub: u._id, email: u.emailId, roleGroup: u.roleGroup, permissions: permissionsFor(u.roleGroup) };
      state.user = payload; state.email = u.emailId; state.lastActive = Date.now();
      localStorage.setItem(LS_AUTH, JSON.stringify(state));
    },
    loginAs(state, a: PayloadAction<RoleGroup>) {
      const u = users.find((x) => x.roleGroup === a.payload) ?? users[0];
      const payload: JwtPayload = { sub: u._id, email: u.emailId, roleGroup: u.roleGroup, permissions: permissionsFor(u.roleGroup) };
      state.user = payload; state.email = u.emailId; state.lastActive = Date.now();
      localStorage.setItem(LS_AUTH, JSON.stringify(state));
    },
    logout(state) { state.user = null; state.email = null; localStorage.removeItem(LS_AUTH); },
    touch(state) { state.lastActive = Date.now(); localStorage.setItem(LS_AUTH, JSON.stringify(state)); },
  },
});

interface WatchState { ids: string[]; }
function loadWatch(): WatchState {
  try { const raw = localStorage.getItem(LS_WATCH); if (raw) return JSON.parse(raw); } catch { /* */ }
  return { ids: ['o_anthropic', 'o_anduril'] };
}
const watchSlice = createSlice({
  name: 'watch', initialState: loadWatch() as WatchState,
  reducers: {
    toggle(state, a: PayloadAction<string>) {
      state.ids = state.ids.includes(a.payload) ? state.ids.filter((x) => x !== a.payload) : [...state.ids, a.payload];
      localStorage.setItem(LS_WATCH, JSON.stringify(state));
    },
  },
});

export const store = configureStore({ reducer: { auth: authSlice.reducer, watch: watchSlice.reducer } });
export const { login, loginAs, logout, touch } = authSlice.actions;
export const { toggle } = watchSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export const sessionTimeoutMin = Number(import.meta.env.VITE_SESSION_TIMEOUT_MIN ?? 15);
export const lsKeys = { auth: LS_AUTH, watch: LS_WATCH, timeout: LS_TIMEOUT };
