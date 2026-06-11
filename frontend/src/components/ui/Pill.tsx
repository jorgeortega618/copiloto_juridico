import React from 'react';

type PillKind = 'laboral' | 'civil' | 'penal' | 'admin' | 'danger' | 'warning' | 'success' | 'info' | 'neutral';

interface PillProps {
  kind: PillKind;
  children: React.ReactNode;
  className?: string;
}

export function Pill({ kind, children, className = '' }: PillProps) {
  const kindStyles: Record<PillKind, string> = {
    laboral: 'bg-[var(--color-laboral-bg)] text-[var(--color-laboral-fg)]',
    civil: 'bg-[var(--color-civil-bg)] text-[var(--color-civil-fg)]',
    penal: 'bg-[var(--color-penal-bg)] text-[var(--color-penal-fg)]',
    admin: 'bg-[var(--color-admin-bg)] text-[var(--color-admin-fg)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)]',
    info: 'bg-[var(--color-info-bg)] text-[var(--color-info-fg)]',
    neutral: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral-fg)]',
  };

  const styles = kindStyles[kind] || kindStyles.neutral;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[10px] text-[11px] font-medium tracking-wide ${styles} ${className}`}>
      {children}
    </span>
  );
}

// Semantic Wrappers
export const PrioridadPill = ({ priority }: { priority: 'Crítico' | 'Urgente' | 'Normal' }) => {
  const map: Record<string, PillKind> = { 'Crítico': 'danger', 'Urgente': 'warning', 'Normal': 'neutral' };
  return <Pill kind={map[priority] || 'neutral'}>{priority}</Pill>;
};

export const EstadoPill = ({ status }: { status: 'Activo' | 'Completado' | 'Cerrado' }) => {
  const map: Record<string, PillKind> = { 'Activo': 'success', 'Completado': 'info', 'Cerrado': 'neutral' };
  return <Pill kind={map[status] || 'neutral'}>{status}</Pill>;
};

export const TipoPill = ({ type }: { type: 'Laboral' | 'Civil' | 'Penal' | 'Admin' }) => {
  const map: Record<string, PillKind> = { 'Laboral': 'laboral', 'Civil': 'civil', 'Penal': 'penal', 'Admin': 'admin' };
  return <Pill kind={map[type] || 'neutral'}>{type}</Pill>;
};
