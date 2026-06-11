"use client";

import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActive?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, defaultActive, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultActive || tabs[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    if (onChange) onChange(id);
  };

  return (
    <div className="flex items-center gap-6 border-b-[0.5px] border-[var(--color-border-secondary)]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`flex items-center gap-2 pb-2.5 pt-1 text-[13px] font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`t-mono px-1.5 py-0.5 rounded text-[10px] ${
                isActive ? 'bg-[var(--color-brand-bg)] text-[var(--color-brand)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
