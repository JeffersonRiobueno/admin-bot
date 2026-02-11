
import React from 'react';
import { User, MONTHS } from '../types';

interface StatsProps {
  users: User[];
  onMonthClick?: (monthNumber: number | null) => void;
}

const StatsCards: React.FC<StatsProps> = ({ users, onMonthClick }) => {
  const currentMonthIndex = new Date().getMonth();
  const currentMonthNumber = currentMonthIndex + 1;
  const total = users.length;
  const toMonthNumber = (m: any): number | null => {
    if (m === null || m === undefined) return null;
    if (typeof m === 'number') return m;
    const asNum = parseInt(String(m));
    if (!isNaN(asNum)) return asNum;
    // try mapping month name
    const idx = MONTHS.indexOf(String(m));
    if (idx >= 0) return idx + 1;
    return null;
  };

  const birthdaysThisMonth = users.filter(u => toMonthNumber(u.mes) === currentMonthNumber).length;
  const isActive = (s: any) => {
    if (s === true || s === 1 || s === '1') return true;
    if (typeof s === 'string') {
      const low = s.toLowerCase();
      if (low === 'true' || low === 'activo' || low === 'act') return true;
      return false;
    }
    return false;
  };

  const activeCount = users.filter(u => isActive(u.estado)).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Total Plantilla</p>
          <h3 className="text-3xl font-bold text-slate-800">{total}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
          👥
        </div>
      </div>
      
      <div onClick={() => onMonthClick && onMonthClick(currentMonthNumber)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between ring-2 ring-pink-50 ring-offset-2 cursor-pointer">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Cumpleaños del mes</p>
          <h3 className="text-3xl font-bold text-pink-600">{birthdaysThisMonth}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl animate-pulse">
          🎂
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Colaboradores Activos</p>
          <h3 className="text-3xl font-bold text-emerald-600">{activeCount}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
          ⚡
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
