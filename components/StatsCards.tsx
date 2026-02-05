
import React from 'react';
import { User, MONTHS } from '../types';

interface StatsProps {
  users: User[];
}

const StatsCards: React.FC<StatsProps> = ({ users }) => {
  const currentMonthName = MONTHS[new Date().getMonth()];
  
  const total = users.length;
  const birthdaysThisMonth = users.filter(u => u.mes === currentMonthName).length;
  const activeCount = users.filter(u => u.estado === 'Activo').length;

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
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between ring-2 ring-pink-50 ring-offset-2">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Cumpleaños en {currentMonthName}</p>
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
