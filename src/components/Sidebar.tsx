import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Landmark, FolderOpen, Star,
  ArrowLeftRight, FileText, ReceiptText, Briefcase, Bell,
  ShieldCheck, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import type { RoleGroup } from '../types';

interface Item { to: string; label: string; icon: React.ReactNode; end?: boolean }

const OVERVIEW: Item[] = [{ to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true }];
const MARKET: Item[] = [
  { to: '/opportunities', label: 'Explore', icon: <Building2 size={17} /> },
  { to: '/funds', label: 'Fund Offerings', icon: <Landmark size={17} /> },
  { to: '/data-room', label: 'Data Room', icon: <FolderOpen size={17} /> },
  { to: '/watchlist', label: 'Watchlist', icon: <Star size={17} /> },
];
const ACTIVITY: Item[] = [
  { to: '/indications', label: 'Indications', icon: <ArrowLeftRight size={17} /> },
  { to: '/documents', label: 'Documents', icon: <FileText size={17} /> },
  { to: '/transactions', label: 'Transfers', icon: <ReceiptText size={17} /> },
  { to: '/portfolio', label: 'Portfolio', icon: <Briefcase size={17} /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={17} /> },
];
const ADMIN: Item[] = [{ to: '/admin', label: 'Admin Console', icon: <ShieldCheck size={17} /> }];

export function sidebarSections(role: RoleGroup): { title: string; items: Item[] }[] {
  const sections = [
    { title: 'Overview', items: OVERVIEW },
    { title: 'Market', items: MARKET },
    { title: 'Activity', items: role === 'affiliate' ? ACTIVITY.filter((i) => i.to !== '/portfolio' && i.to !== '/transactions') : ACTIVITY },
  ];
  if (role === 'admin' || role === 'fund_manager' || role === 'monitor') {
    sections.push({ title: 'Back Office', items: ADMIN });
  }
  return sections;
}

export default function Sidebar({ role, mini, onToggle }: { role: RoleGroup; mini: boolean; onToggle: () => void }) {
  return (
    <aside className={`sidebar${mini ? ' mini' : ''}`} aria-label="Primary">
      {sidebarSections(role).map((s) => (
        <div key={s.title}>
          <div className="side-sec">{s.title}</div>
          {s.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `side-item${isActive ? ' on' : ''}`} title={it.label}>
              {it.icon}<span className="lbl">{it.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
      <div className="side-foot">
        <button className="side-item" onClick={onToggle} aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'} style={{ width: '100%' }}>
          {mini ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}<span className="lbl">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
