'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { PrioridadPill, EstadoPill } from "@/components/ui/Pill";
import api from '@/lib/api';
import { Loader2, X } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      const { data } = await api.get('/expedientes');
      setExpedientes(data.slice(0, 5)); // Just the 5 most recent
    } catch (error) {
      console.error('Error cargando expedientes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      // 1. Fetch existing clients or create a default one
      const clientsRes = await api.get('/clients');
      let clientId = clientsRes.data[0]?.id;
      if (!clientId) {
        const newClient = await api.post('/clients', { name: 'Cliente Default', email: 'default@test.com' });
        clientId = newClient.data.id;
      }

      // 2. Create the expediente
      const { data } = await api.post('/expedientes', { title: formTitle, clientId });
      router.push(`/expedientes/${data.id}`);
    } catch (error) {
      console.error('Error creando expediente', error);
      alert('Error al crear el expediente. Revisa la consola.');
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display mb-1">Buenos días, Julio</h1>
          <p className="t-small">Hoy: lunes 20 de mayo, 2026 · Julio Pacheco · Asesores</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/equipo')}>Equipo</Button>
          <Button variant="secondary">Nuevo término</Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>Nuevo expediente</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Vencen hoy / mañana', value: '2', colorClass: 'text-[var(--color-danger-fg)]' },
          { label: 'Vencen en 7 días', value: '5', colorClass: 'text-[var(--color-warning-fg)]' },
          { label: 'Expedientes activos', value: '34', colorClass: 'text-[var(--color-brand-fg)]' },
          { label: 'Tareas completadas', value: '128', colorClass: 'text-[var(--color-success-fg)]' },
        ].map(metric => (
          <div key={metric.label} className="bg-[var(--color-background-secondary)] p-4 rounded-xl flex flex-col gap-1">
            <span className="t-label">{metric.label}</span>
            <span className={`text-[32px] font-medium leading-none tracking-tight ${metric.colorClass}`}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Vencimientos próximos */}
        <Card noPadding>
          <div className="p-[14px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between">
            <h3 className="h-h3">Vencimientos próximos</h3>
            <a href="#" className="t-small text-[var(--color-brand)] font-medium">Ver todos &rarr;</a>
          </div>
          <div className="flex flex-col">
            {[
              { title: 'Audiencia de conciliación', meta: 'EXP-2026-041', priority: 'Crítico' as const, dot: 'bg-[var(--color-danger)]' },
              { title: 'Contestación de demanda', meta: 'EXP-2026-038', priority: 'Urgente' as const, dot: 'bg-[var(--color-warning)]' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-[12px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.dot}`}></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-[13px]">{item.title}</span>
                    <span className="t-mono text-[11px] text-[var(--color-text-secondary)]">{item.meta}</span>
                  </div>
                </div>
                <PrioridadPill priority={item.priority} />
              </div>
            ))}
          </div>
        </Card>

        {/* Expedientes recientes */}
        <Card noPadding>
          <div className="p-[14px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between">
            <h3 className="h-h3">Expedientes recientes</h3>
            <a href="/expedientes" className="t-small text-[var(--color-brand)] font-medium">Ver todos &rarr;</a>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-tertiary)]" />
              </div>
            ) : expedientes.length === 0 ? (
              <div className="flex justify-center py-10 text-[13px] text-[var(--color-text-secondary)]">
                No hay expedientes creados
              </div>
            ) : (
              expedientes.map((exp) => (
                <div key={exp.id} onClick={() => router.push(`/expedientes/${exp.id}`)} className="flex flex-col gap-1 p-[12px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] last:border-0 hover:bg-[var(--color-background-secondary)] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="t-mono text-[11px] text-[var(--color-text-secondary)]">{exp.id.substring(0, 13)}</span>
                    <EstadoPill status={exp.status === 'ACTIVE' ? 'Activo' : 'Cerrado'} />
                  </div>
                  <span className="font-medium text-[13px]">{exp.title || 'Expediente Sin Título'}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Carga por abogado */}
        <Card>
          <CardHead title="Carga por abogado" />
          <div className="flex flex-col gap-4 mt-2">
            {[
              { name: 'Julio Pacheco', count: 18, pct: 80 },
              { name: 'Ana Mendoza', count: 12, pct: 50 },
              { name: 'Luis Silva', count: 4, pct: 20 },
            ].map((abogado, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[13px] w-[100px]">{abogado.name}</span>
                <div className="flex-1 h-6 bg-[var(--color-background-secondary)] rounded-sm overflow-hidden relative">
                  <div className="h-full bg-[var(--color-brand)]" style={{ width: `${abogado.pct}%` }}></div>
                </div>
                <span className="t-mono text-[12px] w-6 text-right">{abogado.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Mis tareas pendientes */}
        <Card noPadding>
          <div className="p-[14px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between">
            <h3 className="h-h3">Mis tareas pendientes</h3>
            <a href="#" className="t-small text-[var(--color-brand)] font-medium">Ver todas &rarr;</a>
          </div>
          <div className="flex flex-col">
            {[
              { title: 'Revisar antecedentes', meta: 'EXP-2026-041', status: 'Activo' as const },
              { title: 'Llamar al perito', meta: 'EXP-2026-038', status: 'Activo' as const },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-[12px_16px] border-b-[0.5px] border-[var(--color-border-tertiary)] last:border-0 hover:bg-[var(--color-background-secondary)] transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-[var(--color-border-secondary)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]" />
                <div className="flex flex-col">
                  <span className="font-medium text-[13px]">{item.title}</span>
                  <span className="t-mono text-[11px] text-[var(--color-text-secondary)]">{item.meta}</span>
                </div>
                <div className="ml-auto">
                  <EstadoPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal Nuevo Expediente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative border-[0.5px] border-[var(--color-border-secondary)]">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-black">
              <X size={20} />
            </button>
            <h2 className="h-h2 mb-4">Nuevo Expediente</h2>
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-[13px] font-medium">Título del Caso *</label>
              <input
                type="text"
                autoFocus
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Ej: Demanda laboral - Rivera vs TechCo"
                className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleCreate} disabled={!formTitle.trim() || saving}>
                {saving ? 'Creando...' : 'Crear Expediente'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
