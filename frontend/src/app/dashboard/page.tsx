'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, FolderOpen, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface Expediente {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  client: { name: string };
}

export default function DashboardHome() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get('/expedientes');
        setExpedientes(data);
      } catch (err) {
        console.error("Error cargando expedientes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full">
      
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Mis Expedientes</h2>
          <p className="text-slate-500 font-normal">Gestiona tus procesos activos y visualiza analíticas en tiempo real.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar expediente..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-normal"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-6 py-3 font-medium transition-all shadow-sm hover:shadow-md">
            <Plus className="w-5 h-5"/> Nuevo
          </button>
        </div>
      </div>

      {/* Grid Iteration */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron expedientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expedientes.map(exp => (
            <Link href={`/dashboard/expedientes/${exp.id}`} key={exp.id}>
              <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                  exp.status === 'OPEN' ? 'bg-blue-500' :
                  exp.status === 'PENDING' ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}></div>

                <div className="flex-1 mt-2">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                      <FolderOpen className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      exp.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      exp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {exp.status || 'OPEN'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{exp.title}</h3>
                  <p className="text-slate-500 text-sm font-normal">Cliente: {exp.client?.name || 'Varios'}</p>
                </div>
                
                <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-6">
                  <span className="text-sm font-normal text-slate-400">
                    Act.: {new Date(exp.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Análisis IA <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
      
    </div>
  );
}
