
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'users', label: 'Gestión de Equipo', icon: '👥' },
    { id: 'groups', label: 'Configuración Grupos', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen hidden md:flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          AdminPro
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">HR Management</p>
      </div>
      
      <nav className="mt-8 px-4 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl mb-3 border border-slate-700/50">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-inner">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-slate-100">Juan Delgado</p>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">Administrador</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-3 rounded-xl transition-all border border-rose-500/10 hover:border-rose-500/30">
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
