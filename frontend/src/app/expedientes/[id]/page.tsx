'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Button } from "@/components/ui/Button";
import { PrioridadPill, EstadoPill, TipoPill } from "@/components/ui/Pill";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardHead } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { IconDotsVertical, IconCheck, IconFile, IconCalendarEvent, IconRobot, IconUser, IconSend, IconSparkles, IconTrash } from "@tabler/icons-react";
import { Loader2, X } from "lucide-react";
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  role: 'system' | 'user';
  content: string;
}

export default function ExpedienteDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const expedienteId = unwrappedParams.id;

  const [expediente, setExpediente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Chat
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Asistente legal listo. ¿En qué te puedo ayudar con este expediente?' }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);

  const [team, setTeam] = useState<any[]>([]);

  // Tasks & Events Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      const payload: any = { title: taskTitle, expedienteId };
      if (taskDueDate) payload.dueDate = new Date(taskDueDate).toISOString();
      if (taskAssigneeId) payload.assigneeId = taskAssigneeId;

      await api.post('/tasks', payload);
      setTaskTitle('');
      setTaskDueDate('');
      setTaskAssigneeId('');
      setShowTaskModal(false);
      loadExpediente(); // Reload to fetch new task
    } catch(e) {
      alert("Error al crear tarea");
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setExpediente((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
      }));
    } catch (e) {
      alert("Error al actualizar tarea");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setExpediente((prev: any) => ({
        ...prev,
        tasks: prev.tasks.filter((t: any) => t.id !== taskId)
      }));
    } catch (e) {
      alert("Error al eliminar tarea");
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDate) return;
    setSavingEvent(true);
    try {
      const startTime = new Date(eventDate).toISOString();
      const endTime = new Date(new Date(eventDate).getTime() + 3600000).toISOString(); // +1 hour
      await api.post('/calendar', { title: eventTitle, startTime, endTime, expedienteId });
      setEventTitle('');
      setEventDate('');
      setShowEventModal(false);
      loadExpediente(); // Reload to fetch new event
    } catch(e) {
      alert("Error al crear término");
    } finally {
      setSavingEvent(false);
    }
  };

  useEffect(() => {
    loadExpediente();
    loadDocuments();
    loadTeam();
    setupWebSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [expedienteId]);

  const loadTeam = async () => {
    try {
      const { data } = await api.get('/organizations/team');
      setTeam(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadExpediente = async () => {
    try {
      const { data } = await api.get(`/expedientes/${expedienteId}`);
      setExpediente(data);
    } catch (error) {
      console.error('Error cargando expediente', error);
    } finally {
      setLoading(false);
    }
  };

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

  const setupWebSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_expediente', expedienteId);
    });

    socket.on('document_ready', (payload: { documentId: string; status: string }) => {
      setDocuments(prev => prev.map(doc => doc.id === payload.documentId ? { ...doc, status: 'READY' } : doc));
      setMessages(prev => [...prev, { role: 'system', content: `✅ Documento vectorizado e integrado a la IA. Ya puedes consultarlo.` }]);
    });

    socket.on('document_error', (payload: { documentId: string; message?: string }) => {
      setDocuments(prev => prev.map(doc => doc.id === payload.documentId ? { ...doc, status: 'ERROR' } : doc));
    });

    socket.on('document_renamed', (payload: { documentId: string; newName: string }) => {
      setDocuments(prev => prev.map(doc => doc.id === payload.documentId ? { ...doc, fileName: payload.newName } : doc));
    });
  };

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
      await loadDocuments();
      setMessages(prev => [...prev, { role: 'system', content: `El documento "${file.name}" ha sido enviado a la IA para su análisis. Te avisaré cuando esté listo.` }]);
    } catch (err) {
      console.error("Error al subir evidencia:", err);
      alert("Ocurrió un error al subir el archivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        content: `🏷️ La IA renombró el archivo: "${data.previousName}" → "${data.fileName}"`
      }]);
    } catch (error: any) {
      console.error('Error renombrando', error);
      alert(error?.response?.data?.message || 'Error al renombrar el documento.');
    } finally {
      setRenamingDocId(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', { query: userMessage, expedienteId });
      setMessages(prev => [...prev, { role: 'system', content: response.data.answer }]);
    } catch (error: any) {
      console.error('Error en el chat', error);
      const errorMsg = error.response?.data?.message || "Ocurrió un error al contactar al motor de IA.";
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${errorMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-tertiary)]" /></div>;
  }

  if (!expediente) {
    return <div className="flex justify-center py-20">Expediente no encontrado</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--color-background-secondary)] px-2 py-1 rounded text-[14px] t-mono font-medium">{expediente.id.substring(0, 13)}</div>
              <PrioridadPill priority="Crítico" />
              <EstadoPill status={expediente.status === 'ACTIVE' ? 'Activo' : 'Cerrado'} />
              <TipoPill type="Laboral" />
            </div>
            <h1 className="h-h1">{expediente.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Editar</Button>
            <Button variant="ghost" className="px-2"><IconDotsVertical size={18} /></Button>
          </div>
        </div>

        <div className="flex items-center gap-8 mt-2">
          <div className="flex flex-col">
            <span className="t-label">Responsable</span>
            <span className="font-medium text-[13px]">Julio Pacheco</span>
          </div>
          <div className="flex flex-col">
            <span className="t-label">Apertura</span>
            <span className="font-medium text-[13px]">{new Date(expediente.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <Tabs tabs={[
        { id: 'resumen', label: 'Resumen' },
        { id: 'tareas', label: 'Tareas', count: expediente.tasks?.length || 0 },
        { id: 'docs', label: 'Documentos', count: documents.length },
        { id: 'terminos', label: 'Términos', count: expediente.events?.length || 0 },
        { id: 'bitacora', label: 'Bitácora' },
      ]} defaultActive="resumen" />

      {/* Grid 1fr 360px */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        
        {/* Columna Principal */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHead 
              icon={IconFile} 
              title="Documentos" 
              action={
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt" />
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Cargando...' : 'Cargar PDF'}
                  </Button>
                </>
              } 
            />
            <div className="flex flex-col border-t-[0.5px] border-[var(--color-border-tertiary)] -mx-4 -mb-3 mt-3">
              {docsLoading ? (
                <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--color-text-tertiary)]" /></div>
              ) : documents.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[var(--color-text-secondary)]">No hay documentos cargados.</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-3 px-4 border-b-[0.5px] border-[var(--color-border-tertiary)] flex justify-between items-center hover:bg-[var(--color-background-secondary)] group">
                    <div className="flex items-center gap-3">
                      <IconFile size={16} className={doc.status === 'ERROR' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'} />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium max-w-[250px] truncate">{doc.fileName}</span>
                        <span className="t-small">{doc.status === 'READY' ? 'Integrado a IA' : doc.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(doc.status === 'COMPLETED' || doc.status === 'READY') && (
                        <button
                          onClick={() => handleAiRename(doc.id)}
                          disabled={renamingDocId === doc.id}
                          className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-warning)] rounded transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
                          title="Renombrar con IA"
                        >
                          {renamingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-warning)]" /> : <IconSparkles size={16} />}
                        </button>
                      )}
                      <span className="t-small w-[80px] text-right">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHead 
              icon={IconCheck} 
              title="Tareas" 
              action={<Button variant="secondary" size="sm" onClick={() => setShowTaskModal(true)}>Nueva tarea</Button>} 
            />
            <div className="flex flex-col border-t-[0.5px] border-[var(--color-border-tertiary)] -mx-4 -mb-3 mt-3">
              {!expediente.tasks || expediente.tasks.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[var(--color-text-secondary)]">No hay tareas registradas.</div>
              ) : (
                expediente.tasks.map((task: any) => (
                  <div key={task.id} className="p-3 px-4 border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between hover:bg-[var(--color-background-secondary)] group">
                    <div className="flex items-center gap-3 flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'DONE'} 
                        onChange={() => handleToggleTaskStatus(task.id, task.status)}
                        className="w-4 h-4 rounded text-[var(--color-brand)] border-[var(--color-border-secondary)] cursor-pointer focus:ring-[var(--color-brand)]" 
                      />
                      <div className="flex flex-col">
                        <span className={`text-[13px] ${task.status === 'DONE' ? 'line-through text-[var(--color-text-tertiary)]' : ''}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.assignee && (
                            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
                              <IconUser size={12} /> {task.assignee.firstName}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 text-[11px] ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                              <IconCalendarEvent size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar tarea"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHead 
              icon={IconCalendarEvent} 
              title="Términos y vencimientos" 
              action={<Button variant="secondary" size="sm" onClick={() => setShowEventModal(true)}>Nuevo término</Button>} 
            />
             <div className="flex flex-col border-t-[0.5px] border-[var(--color-border-tertiary)] -mx-4 -mb-3 mt-3">
              {!expediente.events || expediente.events.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[var(--color-text-secondary)]">No hay términos próximos.</div>
              ) : (
                expediente.events.map((ev: any) => (
                  <div key={ev.id} className="p-3 px-4 flex justify-between items-center hover:bg-[var(--color-background-secondary)] border-b-[0.5px] border-[var(--color-border-tertiary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]"></div>
                      <span className="text-[13px] font-medium">{ev.title}</span>
                    </div>
                    <span className="t-small">{new Date(ev.startTime).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Columna Lateral */}
        <div className="flex flex-col gap-6">
          <Card noPadding className="flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] shrink-0 flex items-center gap-2">
              <IconRobot size={18} className="text-[var(--color-brand)]" />
              <h3 className="h-h3 m-0">Asistente IA</h3>
            </div>
            
            <Banner kind="warn" className="m-4 mb-0 shrink-0">
              La IA puede cometer errores. Verifique los hechos antes de usarlos.
            </Banner>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'system' && <div className="w-6 h-6 rounded bg-[var(--color-brand)] text-white flex items-center justify-center shrink-0 mr-2 mt-1"><IconRobot size={14} /></div>}
                  <div className={`p-3 text-[13px] rounded-xl max-w-[85%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] rounded-tr-sm' : 'border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-primary)] rounded-tl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start">
                  <div className="w-6 h-6 rounded bg-[var(--color-brand)] text-white flex items-center justify-center shrink-0 mr-2 mt-1"><IconRobot size={14} /></div>
                  <div className="p-3 text-[13px] border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl rounded-tl-sm text-[var(--color-text-tertiary)]">
                    Analizando documentos...
                  </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] shrink-0">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Pregúntale al expediente..."
                  className="w-full bg-white border-[0.5px] border-[var(--color-border-secondary)] rounded-lg pl-3 pr-10 py-2.5 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isTyping}
                  className="absolute right-2 p-1.5 text-[var(--color-brand)] disabled:text-[var(--color-text-tertiary)] rounded-md hover:bg-[var(--color-background-secondary)] transition-colors"
                >
                  <IconSend size={16} />
                </button>
              </form>
            </div>
          </Card>
        </div>

      </div>

      {/* Modal Nueva Tarea */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative border-[0.5px] border-[var(--color-border-secondary)]">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-black">
              <X size={20} />
            </button>
            <h2 className="h-h2 mb-4">Nueva Tarea</h2>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Descripción de la tarea *</label>
                <input
                  type="text"
                  autoFocus
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej: Revisar borrador"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Vencimiento (Opcional)</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Responsable (Opcional)</label>
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                >
                  <option value="">-- Sin asignar --</option>
                  {team.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleCreateTask} disabled={!taskTitle.trim() || savingTask}>
                {savingTask ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Término */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative border-[0.5px] border-[var(--color-border-secondary)]">
            <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-black">
              <X size={20} />
            </button>
            <h2 className="h-h2 mb-4">Nuevo Término</h2>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Nombre del término *</label>
                <input
                  type="text"
                  autoFocus
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej: Audiencia inicial"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">Fecha *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowEventModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleCreateEvent} disabled={!eventTitle.trim() || !eventDate || savingEvent}>
                {savingEvent ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
