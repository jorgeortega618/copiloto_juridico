'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { IconUserPlus, IconUser } from "@tabler/icons-react";
import { Loader2, X } from "lucide-react";
import api from '@/lib/api';

export default function EquipoPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data } = await api.get('/organizations/team');
      setTeam(data);
    } catch (error) {
      console.error('Error cargando equipo', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      await api.post('/organizations/team', { email, firstName, lastName });
      setEmail('');
      setFirstName('');
      setLastName('');
      setShowModal(false);
      loadTeam();
    } catch (error: any) {
      console.error('Error agregando miembro', error);
      alert(error.response?.data?.message || 'Error al agregar miembro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display mb-1">Equipo de Trabajo</h1>
          <p className="t-small">Gestiona los usuarios de tu organización</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <IconUserPlus size={16} className="mr-2" />
          Nuevo miembro
        </Button>
      </div>

      <Card>
        <CardHead title="Miembros actuales" icon={IconUser} />
        <div className="flex flex-col border-t-[0.5px] border-[var(--color-border-tertiary)] -mx-4 -mb-3 mt-3">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--color-text-tertiary)]" /></div>
          ) : team.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--color-text-secondary)]">No hay miembros registrados.</div>
          ) : (
            team.map(member => (
              <div key={member.id} className="p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between hover:bg-[var(--color-background-secondary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-medium text-[13px]">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium">{member.firstName} {member.lastName}</span>
                    <span className="t-small">{member.email}</span>
                  </div>
                </div>
                <div className="t-label bg-[var(--color-background-secondary)] px-2 py-1 rounded">Activo</div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal Nuevo Miembro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative border-[0.5px] border-[var(--color-border-secondary)]">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-black">
              <X size={20} />
            </button>
            <h2 className="h-h2 mb-4">Agregar miembro</h2>
            <p className="t-small mb-6 text-[var(--color-text-secondary)]">
              El usuario será creado y podrá acceder con la contraseña por defecto.
            </p>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Nombre *</label>
                <input
                  type="text"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Laura"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Apellido *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Martínez"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: laura@ejemplo.com"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleCreateMember} disabled={!email.trim() || !firstName.trim() || !lastName.trim() || saving}>
                {saving ? 'Agregando...' : 'Agregar miembro'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
