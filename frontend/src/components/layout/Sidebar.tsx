"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconDashboard, IconFolder, IconCalendarEvent, IconRobot, IconSettings } from '@tabler/icons-react';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Tablero', icon: IconDashboard },
    { href: '/expedientes', label: 'Expedientes', icon: IconFolder },
    { href: '/calendario', label: 'Calendario', icon: IconCalendarEvent },
    { href: '/ia', label: 'Copiloto IA', icon: IconRobot },
  ];

  return (
    <>
      <div className="p-4 border-b-[0.5px] border-[var(--color-border-tertiary)]">
        <div className="font-[Outfit] font-bold text-[16px] tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          <div className="w-5 h-5 bg-[var(--color-brand)] rounded-[4px]"></div>
          ABOGIO
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href) && link.href !== '/';
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--color-brand-bg)] text-[var(--color-brand-fg)]' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Icon size={18} stroke={1.5} className={isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)]'} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 mt-auto border-t-[0.5px] border-[var(--color-border-tertiary)]">
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]">
          <IconSettings size={18} stroke={1.5} className="text-[var(--color-text-tertiary)]" />
          Ajustes
        </Link>
      </div>
    </>
  );
}
