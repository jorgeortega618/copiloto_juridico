'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, X, Loader2, ChevronRight, FolderOpen, Calendar } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';

interface Expediente {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  client?: { id: string; name: string } | null;
  _count?: { documents: number };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Activo', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  CLOSED: { label: 'Cerrado', color: 'text-slate-500 bg-slate-100 border-slate-200' },
  ARCHIVED: { label: 'Archivado', color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState('');

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

  useEffect(() => {
    loadExpedientes();
  }, []);

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      await api.post('/expedientes', { title: formTitle });
      setFormTitle('');
      setShowModal(false);
      await loadExpedientes();
    } catch (error) {
      console.error('Error creando expediente', error);
      alert('Error al crear el expediente.');
    } finally {
      setSaving(false);
    }
  };

  const filteredExpedientes = expedientes.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Expedientes
          </h1>
          <p className="text-slate-500 mt-1 ml-[52px]">Casos, procesos y evidencia documental</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nuevo Expediente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 shadow-sm">
        <div className="flex items-center gap-3 px-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título o ID..."
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Expedientes</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{expedientes.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{expedientes.filter(e => e.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Cerrados</p>
          <p className="text-3xl font-bold text-slate-500 mt-1">{expedientes.filter(e => e.status === 'CLOSED').length}</p>
        </div>
      </div>

      {/* Expedientes List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : filteredExpedientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FolderOpen className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium">{searchTerm ? 'Sin resultados' : 'No hay expedientes creados'}</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Expediente" para iniciar uno.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredExpedientes.map((exp) => {
              const statusInfo = STATUS_MAP[exp.status] || STATUS_MAP.ACTIVE;
              return (
                <Link
                  key={exp.id}
                  href={`/dashboard/expedientes/${exp.id}`}
                  className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{exp.title || `Expediente ${exp.id.substring(0, 8)}`}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 font-mono">{exp.id.substring(0, 12)}...</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(exp.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Expediente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Nuevo Expediente
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título del Caso *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej: Proceso Ejecutivo — Banco Nacional vs. Pérez"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!formTitle.trim() || saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl transition-all shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
