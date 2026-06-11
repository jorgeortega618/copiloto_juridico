import React from 'react';
import { IconAlertCircle, IconInfoCircle, IconCheck } from '@tabler/icons-react';

interface BannerProps {
  kind: 'warn' | 'info' | 'success';
  children: React.ReactNode;
  className?: string;
}

export function Banner({ kind, children, className = '' }: BannerProps) {
  const styles = {
    warn: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] border-[var(--color-warning-border)]',
    info: 'bg-[var(--color-info-bg, #E6F1FB)] text-[var(--color-brand-fg)] border-[var(--color-brand-border)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-[var(--color-success-border)]',
  };

  const icons = {
    warn: IconAlertCircle,
    info: IconInfoCircle,
    success: IconCheck,
  };

  const IconComponent = icons[kind];

  return (
    <div className={`flex items-start gap-2 p-3 border-[0.5px] rounded-lg text-sm ${styles[kind]} ${className}`}>
      <IconComponent size={18} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
