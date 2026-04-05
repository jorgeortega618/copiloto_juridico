'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, X, Loader2, Gavel, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  expediente?: { id: string; title: string } | null;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function AgendaPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Form state
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '' });

  const loadEvents = async () => {
    try {
      const { data } = await api.get('/calendar');
      setEvents(data);
    } catch (error) {
      console.error('Error cargando eventos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Calendar grid calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0=Sun, 1=Mon, ..., 6=Sat)
    let startDay = firstDayOfMonth.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Convert to Mon=0

    const days: (Date | null)[] = [];

    // Fill leading empty days
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Fill actual days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate();
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const openNewEvent = (day?: Date) => {
    const target = day || new Date();
    const dateStr = target.toISOString().substring(0, 10);
    setForm({
      title: '',
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T10:00`
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      await api.post('/calendar', {
        title: form.title,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
      setShowModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Error guardando evento', error);
      alert('Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Eliminar este evento del calendario?')) return;
    try {
      await api.delete(`/calendar/${eventId}`);
      await loadEvents();
      setSelectedDay(null);
    } catch (error) {
      console.error('Error eliminando evento', error);
    }
  };

  const today = new Date();
  const isToday = (day: Date) =>
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear();

  // Upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(e => {
      const d = new Date(e.startTime);
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);
      return d >= now && d <= in7Days;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            Agenda Legal
          </h1>
          <p className="text-slate-500 mt-1 ml-[52px]">Audiencias, vencimientos y plazos procesales</p>
        </div>

        <button
          onClick={() => openNewEvent()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nuevo Evento
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Calendar Grid */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* Month Navigator */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={goToday} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-100 transition-colors">
                Hoy
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(day => (
              <div key={day} className="text-center py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-slate-50 bg-slate-50/50" />;

                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay &&
                  day.getDate() === selectedDay.getDate() &&
                  day.getMonth() === selectedDay.getMonth();

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[100px] border-b border-r border-slate-50 p-2 cursor-pointer transition-all hover:bg-blue-50/50 ${isSelected ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="text-[11px] bg-indigo-50 text-indigo-700 rounded-md px-1.5 py-0.5 truncate font-medium border border-indigo-100">
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-slate-400 font-semibold">+{dayEvents.length - 2} más</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Upcoming & Day Detail */}
        <div className="w-full lg:w-[340px] flex flex-col gap-6 flex-shrink-0">

          {/* Upcoming Events */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> Próximos 7 días
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin eventos próximos</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-amber-700">
                        {new Date(ev.startTime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(ev.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(ev.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.expediente && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100 mt-1 inline-block">
                          <Gavel className="w-2.5 h-2.5 inline mr-1" />{ev.expediente.title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Day Detail */}
          {selectedDay && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDay.getDate()} de {MONTHS[selectedDay.getMonth()]}
                </h3>
                <button
                  onClick={() => openNewEvent(selectedDay)}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Sin eventos este día</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDayEvents.map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 group relative">
                      <p className="font-semibold text-sm text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ev.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(ev.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Nuevo Evento
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción del Evento *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Audiencia preparatoria Exp. 2024-001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Inicio</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fin</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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
                disabled={!form.title.trim() || saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 rounded-xl transition-all shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Agendar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
