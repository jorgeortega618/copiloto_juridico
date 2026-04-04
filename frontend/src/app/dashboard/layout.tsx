import Link from 'next/link';
import { Home, Users, Calendar, Settings, Gavel, FileText, Bell, Search } from 'lucide-react';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar - White Modern Corporate */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center gap-3 px-8">
          <Gavel className="w-7 h-7 text-red-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Status<span className="font-light text-slate-500">Law</span>
          </h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Principal</p>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 bg-red-50 font-medium transition-colors border-l-4 border-red-600">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/dashboard/expedientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border-l-4 border-transparent">
            <FileText className="w-5 h-5" /> Expedientes
          </Link>
          <Link href="/dashboard/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border-l-4 border-transparent">
            <Users className="w-5 h-5" /> Clientes
          </Link>
          <Link href="/dashboard/agenda" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border-l-4 border-transparent">
            <Calendar className="w-5 h-5" /> Calendar
          </Link>

          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Configuración</p>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border-l-4 border-transparent text-left">
            <Settings className="w-5 h-5" /> Opciones de Firma
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-400 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar en expedientes, clientes..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700">Dr. Erick Rowan</span>
                <span className="text-xs text-slate-400">Socio Principal</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold">
                ER
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
