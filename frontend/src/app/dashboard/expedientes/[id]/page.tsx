'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Bot, FileText, Send, Calendar, FolderClock, UploadCloud, ChevronLeft, CheckCircle2, User, Loader2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../lib/api';

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface DocumentInfo {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
}

export default function ExpedienteDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const expedienteId = unwrappedParams.id;
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Asistente legal listo. ¿Qué necesitas consultar sobre los documentos de este expediente?' }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const { data } = await api.get(`/documents/expediente/${expedienteId}`);
      setDocuments(data);
    } catch (error) {
      console.error("Error cargando documentos", error);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [expedienteId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
        await api.post(`/documents/${expedienteId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Refrescar documentos
        await loadDocuments();
        
        // Informar en el chat
        setMessages(prev => [...prev, { 
            role: 'system', 
            content: `El documento "${file.name}" ha sido subido a la bóveda MinIO y enviado a la cola IA para su vectorización. Estará listo en breve.` 
        }]);

    } catch (err: any) {
        console.error("Error al subir evidencia:", err);
        alert("Ocurrió un error al subir el archivo.");
    } finally {
        setUploading(false);
        // Limpiar el inpu para poder subir el mismo arhivo luego si falla
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsTyping(true);
    
    try {
      const response = await api.post('/ai/chat', {
        query: userMessage,
        expedienteId: expedienteId
      });
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: response.data.answer
      }]);
    } catch (err) {
      console.error("Error al consultar la IA:", err);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: "Ocurrió un error al contactar al motor RAG de IA."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 max-w-[1600px] mx-auto pb-4">
      
      {/* Left Column: Expediente Data & Docs */}
      <div className="flex-1 flex flex-col gap-6 w-full lg:w-2/3 h-full overflow-y-auto pr-2">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-shrink-0">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium mb-6 w-max">
            <ChevronLeft className="w-4 h-4" /> Volver a Expedientes
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Expediente {expedienteId.substring(0,8)}</h2>
              <p className="text-slate-500 font-normal text-lg">Visor de Evidencia Documental</p>
            </div>
            <span className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Activo
            </span>
          </div>
        </div>

        {/* Documents Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex-1 flex flex-col min-h-0 relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Documentos Probatorios 
                <span className="bg-slate-100 text-slate-500 text-sm px-2 py-0.5 rounded-full">{documents.length}</span>
            </h3>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.txt"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all shadow-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4"/>} 
              {uploading ? 'Cargando MinIO...' : 'Subir Documento PDF'}
            </button>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {docsLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                    <FileText className="w-16 h-16 mb-4 text-slate-200" />
                    <p>No se encontraron evidencias. Sube un archivo PDF para vectorizar.</p>
                </div>
            ) : (
                documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border border-indigo-100 transition-colors ${doc.status === 'ERROR' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                            {doc.status === 'ERROR' ? <AlertCircle className="w-5 h-5"/> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-800 font-medium font-sans truncate max-w-[200px] md:max-w-xs">{doc.fileName}</span>
                            <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                        doc.status === 'READY' 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                            : doc.status === 'ERROR' 
                                ? 'text-red-700 bg-red-50 border-red-200' 
                                : 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse'
                    }`}>
                        {doc.status === 'READY' && <CheckCircle2 className="w-4 h-4" />}
                        {doc.status === 'PROCESSING' && <Clock className="w-4 h-4" />}
                        {doc.status === 'UPLOADED' && <Clock className="w-4 h-4" />}
                        {doc.status === 'ERROR' && <AlertCircle className="w-4 h-4" />}
                        {doc.status === 'READY' ? 'Integrado a IA' : doc.status}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: AI Chat Assistant */}
      <div className="w-full lg:w-[450px] xl:w-[500px] h-[500px] lg:h-full bg-slate-50 relative flex flex-col rounded-3xl border border-slate-200 shadow-md overflow-hidden flex-shrink-0 mt-6 lg:mt-0">
        
        <div className="bg-white p-6 border-b border-slate-200 flex items-center gap-4 z-10 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Copiloto RAG</h3>
            <p className="text-xs font-semibold text-blue-600 truncate max-w-[200px]">Auditor Semántico Inyectado</p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 text-[15px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
              }`}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="ml-2 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 self-end mb-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-2 items-center h-12">
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 z-10 rounded-b-3xl">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pregúntale al documento subido..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-normal shadow-inner"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!query.trim() || isTyping} 
              className="absolute right-3 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-sm"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
