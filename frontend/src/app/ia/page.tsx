'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { IconRobot, IconBriefcase, IconAlignBoxLeftTop, IconListSearch, IconTimelineEvent, IconWritingSign } from "@tabler/icons-react";
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIPanel() {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<string>('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExpedientes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadExpedientes = async () => {
    try {
      const { data } = await api.get('/expedientes');
      setExpedientes(data);
      if (data.length > 0) {
        setSelectedExpedienteId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim() || !selectedExpedienteId) return;

    if (!customQuery) setQuery('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: textToSend }]);
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { 
        query: textToSend, 
        expedienteId: selectedExpedienteId 
      });
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: res.data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: 'Lo siento, ha ocurrido un error de conexión.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const tools = [
    { icon: IconAlignBoxLeftTop, title: 'Resumir expediente', desc: 'Sintetiza documentos y estado actual', prompt: 'Haz un resumen completo de los documentos de este expediente.' },
    { icon: IconListSearch, title: 'Extraer hechos', desc: 'Identifica entidades, fechas y montos', prompt: 'Extrae los hechos principales, fechas clave y entidades de los documentos de este expediente.' },
    { icon: IconTimelineEvent, title: 'Cronología', desc: 'Línea de tiempo de eventos detectados', prompt: 'Genera una cronología ordenada de todos los eventos relevantes encontrados en este expediente.' },
    { icon: IconWritingSign, title: 'Generar borrador', desc: 'Redacta a partir de plantillas', prompt: 'Genera un borrador general de contestación o avance legal basado en los documentos.' },
  ];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-[var(--color-brand)] text-white flex items-center justify-center">
          <IconRobot size={20} />
        </div>
        <h1 className="h-display m-0">Copiloto IA</h1>
        <Pill kind="info">Revisión humana obligatoria</Pill>
      </div>

      {/* Strip de contexto activo */}
      <div className="bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          <span className="t-label shrink-0">Contexto Activo</span>
          <div className="flex items-center gap-2 flex-1">
            <IconBriefcase size={16} className="text-[var(--color-text-secondary)]" />
            <select 
              value={selectedExpedienteId}
              onChange={(e) => setSelectedExpedienteId(e.target.value)}
              className="bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-md px-3 py-1.5 text-[13px] font-medium outline-none flex-1 max-w-xl"
            >
              <option value="" disabled>-- Selecciona un Expediente --</option>
              {expedientes.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.id.substring(0,13)} - {exp.title || 'Sin Título'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-[300px_1fr] gap-6 flex-1 min-h-0">
        
        {/* Menú de herramientas */}
        <div className="flex flex-col gap-3">
          <span className="t-label mb-1">Acciones Rápidas</span>
          {tools.map(tool => (
            <div 
              key={tool.title} 
              onClick={() => handleSend(tool.prompt)}
              className={`p-4 rounded-xl border-[0.5px] cursor-pointer transition-colors flex items-start gap-3 bg-white border-[var(--color-border-tertiary)] hover:bg-[var(--color-background-secondary)]`}
            >
              <tool.icon size={20} className="shrink-0 text-[var(--color-text-secondary)]" />
              <div className="flex flex-col">
                <span className="font-medium text-[13px]">{tool.title}</span>
                <span className="text-[12px] text-[var(--color-text-secondary)]">{tool.desc}</span>
              </div>
            </div>
          ))}

          {/* Cuota */}
          <div className="mt-auto p-4 border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl bg-white flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px] font-medium">
              <span>Uso mensual</span>
              <span className="t-mono">42 / 100</span>
            </div>
            <div className="h-1.5 bg-[var(--color-background-secondary)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-brand)] w-[42%]"></div>
            </div>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">Límite mensual por organización</span>
          </div>
        </div>

        {/* Output Column (Chat) */}
        <div className="bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl flex flex-col overflow-hidden">
          <Banner kind="warn" className="m-4 mb-0 shrink-0">
            <strong>Aviso Legal:</strong> La IA puede generar información incorrecta o incompleta. Es su responsabilidad como abogado revisar y verificar toda información.
          </Banner>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-tertiary)]">
                <IconRobot size={48} className="opacity-20 mb-4" />
                <p className="text-[13px]">Selecciona un expediente y escribe tu consulta o elige una acción rápida.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[var(--color-brand)] text-white rounded-tr-sm' 
                      : 'bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] rounded-tl-sm border-[0.5px] border-[var(--color-border-secondary)]'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[12px] text-[var(--color-text-secondary)] font-medium ml-2">Analizando expediente...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-[0.5px] border-[var(--color-border-tertiary)] p-4 bg-white flex items-center gap-3">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping || !selectedExpedienteId}
              placeholder={selectedExpedienteId ? "Pregunta algo sobre el expediente..." : "Selecciona un expediente primero..."}
              className="flex-1 bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[var(--color-brand)] disabled:opacity-50"
            />
            <Button variant="primary" onClick={() => handleSend()} disabled={isTyping || !query.trim() || !selectedExpedienteId}>
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : 'Enviar'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
