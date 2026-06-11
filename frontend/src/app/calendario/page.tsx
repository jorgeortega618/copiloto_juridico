'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import api from '@/lib/api';

type FilterType = 'ALL' | 'TASKS' | 'EVENTS';

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resTasks, resEvents] = await Promise.all([
        api.get('/tasks'),
        api.get('/calendar')
      ]);
      setTasks(resTasks.data);
      setEvents(resEvents.data);
    } catch (e) {
      console.error('Error loading calendar data', e);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 (Sun) to 6, offset so Monday is 0
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  
  // Build calendar grid array
  const gridCells = [];
  for (let i = 0; i < 42; i++) { // 6 rows of 7 days
    if (i < firstDay) {
      // Prev month
      gridCells.push({ day: daysInPrevMonth - firstDay + i + 1, currentMonth: false, date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDay + i + 1) });
    } else if (i < firstDay + daysInMonth) {
      // Current month
      gridCells.push({ day: i - firstDay + 1, currentMonth: true, date: new Date(currentYear, currentMonth, i - firstDay + 1) });
    } else {
      // Next month
      gridCells.push({ day: i - firstDay - daysInMonth + 1, currentMonth: false, date: new Date(currentYear, currentMonth + 1, i - firstDay - daysInMonth + 1) });
    }
  }

  // Filter items
  let displayItems: any[] = [];
  if (filter === 'ALL' || filter === 'TASKS') {
    tasks.forEach(t => {
      if (t.dueDate) {
        displayItems.push({ type: 'TASK', id: t.id, title: t.title, date: new Date(t.dueDate), status: t.status });
      }
    });
  }
  if (filter === 'ALL' || filter === 'EVENTS') {
    events.forEach(e => {
      if (e.startTime) {
        displayItems.push({ type: 'EVENT', id: e.id, title: e.title, date: new Date(e.startTime) });
      }
    });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="h-display">{monthNames[currentMonth]} {currentYear}</h1>
          <div className="flex items-center gap-1 bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-md p-0.5">
            <Button variant="ghost" className="px-2 py-1" onClick={handlePrevMonth}><IconChevronLeft size={16} /></Button>
            <Button variant="ghost" className="px-3 py-1 font-medium text-[13px]" onClick={handleToday}>Hoy</Button>
            <Button variant="ghost" className="px-2 py-1" onClick={handleNextMonth}><IconChevronRight size={16} /></Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 border-b-[0.5px] border-[var(--color-border-tertiary)] pb-4">
        <span className="text-[13px] font-medium text-[var(--color-text-secondary)] mr-2">Filtrar:</span>
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-full border-[0.5px] text-[12px] font-medium ${filter === 'ALL' ? 'bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-[var(--color-brand-fg)]' : 'bg-white border-[var(--color-border-secondary)] text-[var(--color-text-primary)]'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilter('TASKS')}
          className={`px-3 py-1.5 rounded-full border-[0.5px] text-[12px] font-medium flex items-center gap-1 ${filter === 'TASKS' ? 'bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] text-[var(--color-brand-fg)]' : 'bg-white border-[var(--color-border-secondary)] text-[var(--color-text-primary)]'}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]"></div> Tareas
        </button>
        <button 
          onClick={() => setFilter('EVENTS')}
          className={`px-3 py-1.5 rounded-full border-[0.5px] text-[12px] font-medium flex items-center gap-1 ${filter === 'EVENTS' ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] text-[var(--color-danger-fg)]' : 'bg-white border-[var(--color-border-secondary)] text-[var(--color-text-primary)]'}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]"></div> Términos
        </button>
      </div>

      {/* Grid Calendario */}
      <div className="bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)]">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="p-2 text-center text-[12px] font-medium text-[var(--color-text-secondary)]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 flex-1">
          {gridCells.map((cell, i) => {
            const isToday = cell.date.toDateString() === new Date().toDateString();
            const cellItems = displayItems.filter(item => item.date.toDateString() === cell.date.toDateString());

            return (
              <div key={i} className={`min-h-[120px] p-1 border-r-[0.5px] border-b-[0.5px] border-[var(--color-border-tertiary)] ${!cell.currentMonth ? 'bg-[var(--color-background-secondary)] opacity-60' : ''}`}>
                <div className={`text-[12px] font-medium mb-1 w-6 h-6 ml-auto flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--color-brand)] text-white' : (!cell.currentMonth ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]')}`}>
                  {cell.day}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {cellItems.map(item => (
                    <div 
                      key={item.id + item.type} 
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm truncate ${
                        item.type === 'TASK' 
                          ? (item.status === 'DONE' ? 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-l-2 border-l-[var(--color-success)] line-through' : 'bg-[var(--color-brand-bg)] text-[var(--color-brand-fg)] border-l-2 border-l-[var(--color-brand)]')
                          : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] border-l-2 border-l-[var(--color-danger)]'
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
