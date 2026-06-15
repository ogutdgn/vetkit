'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Content sections. Built incrementally through R3 — each type's entry is added
// as its CRUD ships.
const NAV = [
  { href: '/', label: 'Panel' },
  { href: '/services', label: 'Hizmetler' },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              active ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
