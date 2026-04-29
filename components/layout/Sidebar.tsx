'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  Users,
  FileText,
  BookOpen,
  History,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/etablissement', label: 'Établissement', icon: School },
  { href: '/classes', label: 'Classes & Élèves', icon: Users },
  { href: '/modeles', label: 'Modèles de bulletins', icon: FileText },
  { href: '/historique', label: 'Historique', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #152c47 100%)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BulletinPro</p>
            <p className="text-blue-300 text-xs">Gestion scolaire</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-blue-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Notes rapides nav */}
      <div className="px-3 py-3 border-t border-white/10">
        <Link
          href="/classes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
        >
          <BookOpen size={16} />
          <span>Saisir des notes</span>
        </Link>
      </div>

      {/* Version */}
      <div className="px-6 py-3">
        <p className="text-blue-400 text-xs">v1.0.0 · 2024–2025</p>
      </div>
    </aside>
  );
}
