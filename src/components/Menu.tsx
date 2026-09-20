import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export interface MenuItemDef {
  icon?: ReactNode;
  title: ReactNode;
  desc?: string;
  to?: string;
  onClick?: () => void;
}

export function Menu({ label, items, align = 'left', active }: { label: ReactNode; items: MenuItemDef[]; align?: 'left' | 'right'; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open ]);

  return (
    <div className="menu" ref={ref}>
      <button className="menu-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}
        style={active ? { color: 'var(--text-strong)', fontWeight: 700 } : undefined}>
        {label} <ChevronDown size={14} />
      </button>
      {open && (
        <div className={`menu-panel${align === 'right' ? ' right' : ''}`} role="menu">
          {items.map((it, i) =>
            it.to ? (
              <Link key={i} to={it.to} className="menu-item" role="menuitem" onClick={() => setOpen(false)}>
                {it.icon}<span><b>{it.title}</b>{it.desc && <small>{it.desc}</small>}</span>
              </Link>
            ) : (
              <button key={i} className="menu-item" role="menuitem" style={{ width: '100%', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}
                onClick={() => { setOpen(false); it.onClick?.(); }}>
                {it.icon}<span><b>{it.title}</b>{it.desc && <small>{it.desc}</small>}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
