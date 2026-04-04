import Link from "next/link";
import { Gavel, ChevronRight, FileSearch, Database, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-8 text-center overflow-hidden bg-white text-slate-900">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-10 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl p-10 md:p-16 flex flex-col items-center gap-8 bg-white/70 backdrop-blur-2xl border border-slate-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        
        <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm">
          <Gavel className="w-16 h-16 text-red-600" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          Copiloto Jurídico
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-3xl font-light">
          La plataforma definitiva para firmas modernas. Gestión de expedientes de clase mundial asistida con <span className="font-medium text-slate-800">IA Documental RAG</span> y resguardo estricto.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
          <Link href="/dashboard" className="flex items-center justify-center gap-3 py-4 px-10 text-lg font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto">
            Ingresar al Panel <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 w-full border-t border-slate-100 pt-16">
          
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
              <FileSearch className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">RAG Vectorial</span>
            <span className="text-base text-slate-500">Interroga tus documentos legales instantáneamente mediante modelo semántico especializado.</span>
          </div>
          
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
              <Database className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">Storage Aislado</span>
            <span className="text-base text-slate-500">Cada evidencia subida al ecosistema recae bajo buckets inmutables en MinIO Object Storage.</span>
          </div>
          
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
              <Shield className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">Multi-tenant Segregado</span>
            <span className="text-base text-slate-500">Infranqueabilidad de expedientes. Autenticación estricta y llaves maestras por organización.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
