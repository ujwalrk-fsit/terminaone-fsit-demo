import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { RoleGroup } from '../types';

export function useAuth() { return useSelector((s: RootState) => s.auth); }
export function canAccess(role: RoleGroup | undefined, allowed?: RoleGroup[]) {
  if (!allowed || allowed.length === 0) return true;
  if (!role) return false;
  return allowed.includes(role);
}
