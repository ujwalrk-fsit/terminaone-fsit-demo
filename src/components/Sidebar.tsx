import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Landmark, BookText, Users, ReceiptText, ShieldCheck,
  Newspaper, FolderKanban, FileText, PenLine, Settings, Building2,
  FolderOpen, Star, Briefcase, ArrowLeftRight, Bell,
} from 'lucide-react';
import type { RoleGroup } from '../types';

interface Item { to: string; label: string; icon: React.ReactNode; end?: boolean; kids?: Item[] }

const MAIN: Item[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/funds', label: 'Fund Offerings', icon: <Landmark size={17} /> },
  { to: '/ledger', label: 'Fund Ledger', icon: <BookText size={17} /> },
  { to: '/investors', label: 'Investors', icon: <Users size={17} /> },
  { to: '/transactions', label: 'Transactions', icon: <ReceiptText size={17} /> },
  { to: '/admin?tab=users', label: 'User Management', icon: <ShieldCheck size={17} /> },
  { to: '/admin?tab=cms', label: 'Content Hub', icon: <Newspaper size={17} /> },
  {
    to: '/documents', label: 'Document Studio', icon: <FolderKanban size={17} />,
    kids: [
      { to: '/documents', label: 'Templates', icon: <FileText size={15} /> },
      { to: '/signing', label: 'Signing Sessions', icon: <PenLine size={15} /> },
    ],
  },
  { to: '/settings', label: 'Settings', icon: <Settings size={17} /> },
];

const WORKSPACE: Item[] = [
  { to: '/opportunities', label: 'Explore', icon: <Building2 size={17} /> },
  { to: '/indications', label: 'Indications', icon: <ArrowLeftRight size={17} /> },
  { to: '/data-room', label: 'Data Room', icon: <FolderOpen size={17} /> },
  { to: '/watchlist', label: 'Watchlist', icon: <Star size={17} /> },
  { to: '/portfolio', label: 'Portfolio', icon: <Briefcase size={17} /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={17} /> },
];

export function sidebarSections(_role: RoleGroup): { title: string; items: Item[] }[] {
  void _role;
  return [
    { title: 'Manage', items: MAIN },
    { title: 'Workspace', items: WORKSPACE },
  ];
}

function NavItem({ it, mini }: { it: Item; mini: boolean }) {
  if (!it.kids) {
    return (
      <NavLink to={it.to} end={it.end} className={({ isActive }) => `side-item${isActive ? ' on' : ''}`} title={it.label}>
        {it.icon}<span className="lbl">{it.label}</span>
      </NavLink>
    );
  }
  return (
    <div>
      <NavLink to={it.to} className={({ isActive }) => `side-item${isActive ? ' on' : ''}`} title={it.label}>
        {it.icon}<span className="lbl">{it.label}</span>
      </NavLink>
      {!mini && (
        <div style={{ marginLeft: 18, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 6 }}>
          {it.kids.map((k) => (
            <NavLink key={k.to + k.label} to={k.to} className={({ isActive }) => `side-item${isActive ? ' on' : ''}`} title={k.label}>
              {k.icon}<span className="lbl">{k.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ role, mini, onToggle }: { role: RoleGroup; mini: boolean; onToggle: () => void }) {
  return (
    <aside className={`sidebar${mini ? ' mini' : ''}`} aria-label="Primary">
      {sidebarSections(role).map((s) => (
        <div key={s.title}>
          <div className="side-sec">{s.title}</div>
          {s.items.map((it) => <NavItem key={it.to + it.label} it={it} mini={mini} />)}
        </div>
      ))}
      <div className="side-foot">
        <button className="side-item" onClick={onToggle} aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'} style={{ width: '100%' }}>
          {mini ? <span>»</span> : <span>«</span>}<span className="lbl">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
