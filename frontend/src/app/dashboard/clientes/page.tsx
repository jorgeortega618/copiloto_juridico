'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, FileText, Pencil, Trash2, X, Loader2, UserPlus, Building2 } from 'lucide-react';
import api from '../../../lib/api';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  documentId: string | null;
  createdAt: string;
  _count?: { expedientes: number };
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', documentId: '' });

  const loadClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data);
    } catch (error) {
      console.error('Error cargando clientes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openNewClientModal = () => {
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', documentId: '' });
    setShowModal(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      documentId: client.documentId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const payload: any = { name: form.name };
      if (form.email.trim()) payload.email = form.email;
      if (form.phone.trim()) payload.phone = form.phone;
      if (form.documentId.trim()) payload.documentId = form.documentId;

      if (editingClient) {
        await api.patch(`/clients/${editingClient.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }

      setShowModal(false);
      await loadClients();
    } catch (error) {
      console.error('Error guardando cliente', error);
      alert('Error al guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esto también eliminará sus expedientes asociados.')) return;
    try {
      await api.delete(`/clients/${clientId}`);
      await loadClients();
    } catch (error) {
      console.error('Error eliminando cliente', error);
      alert('Error al eliminar el cliente.');
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.documentId && c.documentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            Directorio de Clientes
          </h1>
          <p className="text-slate-500 mt-1 ml-[52px]">Gestiona la cartera de clientes del bufete</p>
        </div>

        <button
          onClick={openNewClientModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 shadow-sm">
        <div className="flex items-center gap-3 px-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Clientes</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Con Email</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{clients.filter(c => c.email).length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Con Teléfono</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{clients.filter(c => c.phone).length}</p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium">{searchTerm ? 'Sin resultados para esta búsqueda' : 'Aún no hay clientes registrados'}</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Cliente" para agregar el primero.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Documento</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Registro</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200/50">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                      {client.documentId || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      {client.email && (
                        <span className="text-sm text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{client.email}</span>
                      )}
                      {client.phone && (
                        <span className="text-sm text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{client.phone}</span>
                      )}
                      {!client.email && !client.phone && <span className="text-sm text-slate-300">Sin contacto</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-400">{new Date(client.createdAt).toLocaleDateString('es-ES')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditClientModal(client)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Create/Edit Client */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Juan Pérez González"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Documento de Identidad</label>
                <input
                  type="text"
                  value={form.documentId}
                  onChange={(e) => setForm({ ...form, documentId: e.target.value })}
                  placeholder="Ej: CC 1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-xl transition-all shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
