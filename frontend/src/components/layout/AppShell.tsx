import React from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      {/* Sidebar Fijo de 168px */}
      <aside className="fixed top-0 left-0 bottom-0 w-[168px] bg-white border-r-[0.5px] border-[var(--color-border-tertiary)] flex flex-col z-10">
        <Sidebar />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 ml-[168px] flex flex-col min-h-screen relative">
        {/* Topbar 44px */}
        <header className="h-[44px] flex items-center px-[16px] bg-[var(--color-background-secondary)] z-10 sticky top-0">
          <div className="ml-auto flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-[var(--color-brand-bg)] text-[var(--color-brand)] flex items-center justify-center text-[10px] font-medium border-[0.5px] border-[var(--color-brand-border)]">
              JP
            </div>
          </div>
        </header>

        {/* Content con max-width 1280px */}
        <main className="flex-1 p-[16px]">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
