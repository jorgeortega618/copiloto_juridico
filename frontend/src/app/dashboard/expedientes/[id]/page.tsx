'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { Bot, FileText, Send, Calendar, FolderClock, UploadCloud, ChevronLeft, CheckCircle2, User, Loader2, Clock, AlertCircle, Wifi, WifiOff, Trash2, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../lib/api';
import { io, Socket } from 'socket.io-client';

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
  const [wsConnected, setWsConnected] = useState(false);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

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

  // Smart polling: auto-refresh while documents are being processed
  useEffect(() => {
    const hasPending = documents.some(d =>
      ['PENDING', 'PROCESSING', 'COMPLETED'].includes(d.status)
    );
    if (!hasPending || docsLoading) return;

    const interval = setInterval(() => {
      loadDocuments();
    }, 4000);

    return () => clearInterval(interval);
  }, [documents, docsLoading]);

  // WebSocket: real-time document status updates
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setWsConnected(true);
      // Join the room for this expediente
      socket.emit('join_expediente', expedienteId);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    // Listen for document ready events
    socket.on('document_ready', (payload: { documentId: string; status: string }) => {
      setDocuments(prev => prev.map(doc =>
        doc.id === payload.documentId ? { ...doc, status: 'READY' } : doc
      ));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `\u2705 Documento vectorizado e integrado a la IA. Ya puedes hacer preguntas sobre su contenido.`
      }]);
    });

    // Listen for document error events
    socket.on('document_error', (payload: { documentId: string; status: string; message?: string }) => {
      setDocuments(prev => prev.map(doc =>
        doc.id === payload.documentId ? { ...doc, status: 'ERROR' } : doc
      ));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `\u274c Error al procesar documento: ${payload.message || 'Error desconocido'}`
      }]);
    });

    // Listen for AI auto-rename events
    socket.on('document_renamed', (payload: { documentId: string; newName: string; status: string }) => {
      setDocuments(prev => prev.map(doc =>
        doc.id === payload.documentId ? { ...doc, fileName: payload.newName, status: payload.status } : doc
      ));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `\uD83C\uDFF7\uFE0F IA renombró el documento automáticamente: "${payload.newName}"`
      }]);
    });

    return () => {
      socket.disconnect();
    };
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

  const handleDeleteDoc = async (docId: string, fileName: string) => {
    if (!confirm(`¿Eliminar el documento "${fileName}"? Se borrarán sus vectores, texto extraído y el archivo de MinIO.`)) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Documento "${fileName}" eliminado correctamente del sistema.`
      }]);
    } catch (error) {
      console.error('Error eliminando documento', error);
      alert('Error al eliminar el documento.');
    }
  };

  const handleViewDoc = async (docId: string) => {
    try {
      const { data } = await api.get(`/documents/${docId}/url`);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error obteniendo URL', error);
    }
  };

  const handleAiRename = async (docId: string) => {
    setRenamingDocId(docId);
    try {
      const { data } = await api.post(`/documents/${docId}/ai-rename`);
      setDocuments(prev => prev.map(d =>
        d.id === docId ? { ...d, fileName: data.fileName } : d
      ));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `🏷️ IA renombró: "${data.previousName}" → "${data.fileName}"`
      }]);
    } catch (error: any) {
      console.error('Error renombrando', error);
      const msg = error?.response?.data?.message || 'Error al renombrar';
      alert(msg);
    } finally {
      setRenamingDocId(null);
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
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Expediente {expedienteId.substring(0, 8)}</h2>
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
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
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
                      {doc.status === 'ERROR' ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-800 font-medium font-sans truncate max-w-[200px] md:max-w-xs">{doc.fileName}</span>
                      <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(doc.status === 'COMPLETED' || doc.status === 'READY') && (
                      <button
                        onClick={() => handleAiRename(doc.id)}
                        disabled={renamingDocId === doc.id}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
                        title="Renombrar con IA"
                      >
                        {renamingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    )}
                    {(doc.status === 'COMPLETED' || doc.status === 'READY') && (
                      <button
                        onClick={() => handleViewDoc(doc.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Ver documento"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${doc.status === 'READY'
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
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-blue-600 truncate max-w-[160px]">Auditor Semántico Inyectado</p>
              {wsConnected ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 text-[15px] leading-relaxed shadow-sm ${m.role === 'user'
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
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
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
