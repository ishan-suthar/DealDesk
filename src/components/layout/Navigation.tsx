'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoBanner } from './DemoBanner';
import { Search, BookOpen, Trash2, Settings as SettingsIcon, Compass } from 'lucide-react';

export function Navigation({ isDemoMode = true }: { isDemoMode?: boolean }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/research', label: 'Research', icon: Compass },
    { href: '/notebook', label: 'Notebook', icon: BookOpen },
    { href: '/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {isDemoMode && <DemoBanner />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-teal-900 transition-colors">
                DD
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                Deal Desk
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Booth MBA Recruiting
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
