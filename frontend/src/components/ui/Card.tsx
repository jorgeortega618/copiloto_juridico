import React from 'react';
import { Icon } from '@tabler/icons-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl ${noPadding ? '' : 'p-[14px_16px]'} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeadProps {
  icon?: any;
  title: string;
  action?: React.ReactNode;
}

export function CardHead({ icon: IconComponent, title, action }: CardHeadProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent size={16} className="text-[var(--color-text-secondary)]" />}
        <h3 className="h-h3 m-0">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
