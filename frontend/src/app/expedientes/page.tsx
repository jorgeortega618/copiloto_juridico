'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EstadoPill } from "@/components/ui/Pill";
import { Loader2, X, Search } from "lucide-react";
import api from '@/lib/api';

export default function ExpedientesPage() {
  const router = useRouter();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      const { data } = await api.get('/expedientes');
      setExpedientes(data);
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
      const clientsRes = await api.get('/clients');
      let clientId = clientsRes.data[0]?.id;
      if (!clientId) {
        const newClient = await api.post('/clients', { name: 'Cliente Default', email: 'default@test.com' });
        clientId = newClient.data.id;
      }

      const { data } = await api.post('/expedientes', { title: formTitle, clientId });
      router.push(`/expedientes/${data.id}`);
    } catch (error) {
      console.error('Error creando expediente', error);
      alert('Error al crear el expediente. Revisa la consola.');
      setSaving(false);
    }
  };

  const filteredExpedientes = expedientes.filter(exp => {
    const q = search.toLowerCase();
    return (
      (exp.title && exp.title.toLowerCase().includes(q)) ||
      (exp.id && exp.id.toLowerCase().includes(q)) ||
      (exp.client?.name && exp.client.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display mb-1">Directorio de Expedientes</h1>
          <p className="t-small">Gestiona y busca todos tus asuntos legales</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nuevo expediente
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between bg-white rounded-t-xl">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por título, ID o cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          <div className="t-small text-[var(--color-text-secondary)] font-medium">
            {filteredExpedientes.length} Expedientes
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : filteredExpedientes.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-[var(--color-text-secondary)]">
            No se encontraron expedientes.
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_2fr_1.5fr_100px_100px] gap-4 p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] text-[12px] font-medium text-[var(--color-text-secondary)]">
              <div>ID / Ref</div>
              <div>Título del Caso</div>
              <div>Cliente</div>
              <div>Fecha</div>
              <div>Estado</div>
            </div>
            {filteredExpedientes.map(exp => (
              <div 
                key={exp.id} 
                onClick={() => router.push(`/expedientes/${exp.id}`)}
                className="grid grid-cols-[1fr_2fr_1.5fr_100px_100px] gap-4 p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] hover:bg-[var(--color-background-secondary)] transition-colors cursor-pointer items-center last:border-0"
              >
                <div className="t-mono text-[11px] text-[var(--color-text-secondary)] truncate">
                  {exp.id.substring(0, 13)}
                </div>
                <div className="text-[13px] font-medium truncate">
                  {exp.title || 'Sin Título'}
                </div>
                <div className="text-[13px] text-[var(--color-text-secondary)] truncate">
                  {exp.client?.name || '--'}
                </div>
                <div className="t-mono text-[11px] text-[var(--color-text-secondary)]">
                  {new Date(exp.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div>
                  <EstadoPill status={exp.status === 'ACTIVE' ? 'Activo' : 'Cerrado'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
