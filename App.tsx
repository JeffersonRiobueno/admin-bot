
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import UserModal from './components/UserModal';
import GroupModal from './components/GroupModal';
import { User, Group, TEAMS, MONTHS } from './types';
import { fetchUsers, fetchGroups } from './services/mockData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [userData, groupData] = await Promise.all([fetchUsers(), fetchGroups()]);
        setUsers(userData);
        setGroups(groupData);
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesTeam = filterTeam === 'Todos' || user.equipo === filterTeam;
      const matchesSearch = user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           user.id_empleado.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [users, filterTeam, searchQuery]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      return group.equipo.toLowerCase().includes(searchQuery.toLowerCase()) || 
             group.group_id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [groups, searchQuery]);

  // User CRUD
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleDeactivateUser = (id: number) => {
    if (confirm('¿Está seguro de desactivar este registro?')) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, estado: 'Inactivo' } : u));
      showNotification('Registro marcado como Inactivo', 'info');
    }
  };

  const handleSaveUser = (userData: User) => {
    if (userToEdit) {
      setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
      showNotification('Cambios guardados con éxito', 'success');
    } else {
      setUsers(prev => [...prev, userData]);
      showNotification('Nuevo colaborador registrado', 'success');
    }
    setIsModalOpen(false);
  };

  // Group CRUD
  const handleEditGroup = (group: Group) => {
    setGroupToEdit(group);
    setIsGroupModalOpen(true);
  };

  const handleAddGroup = () => {
    setGroupToEdit(null);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (id: number) => {
    if (confirm('¿Está seguro de eliminar este grupo?')) {
      setGroups(prev => prev.filter(g => g.id !== id));
      showNotification('Grupo eliminado', 'info');
    }
  };

  const handleSaveGroup = (groupData: Group) => {
    if (groupToEdit) {
      setGroups(prev => prev.map(g => g.id === groupData.id ? groupData : g));
      showNotification('Grupo actualizado', 'success');
    } else {
      setGroups(prev => [...prev, groupData]);
      showNotification('Nuevo grupo creado', 'success');
    }
    setIsGroupModalOpen(false);
  };

  const showNotification = (message: string, type: 'success' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const isBirthdaySoon = (user: User) => {
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const currentDay = now.getDate();
    return user.mes === currentMonth && (user.dia >= currentDay && user.dia <= currentDay + 7);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Activo': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Inactivo': 'bg-rose-50 text-rose-600 border-rose-100',
      'Licencia': 'bg-amber-50 text-amber-600 border-amber-100',
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles['Activo']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden relative font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 transition-all transform animate-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
          <span>{notification.type === 'success' ? '✨' : 'ℹ️'}</span>
          {notification.message}
        </div>
      )}

      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'users' ? 'Gestión de Equipos' : 'Configuración de Grupos'}
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              {activeTab === 'users' 
                ? 'Monitoreo de perfiles, equipos y aniversarios.' 
                : 'Administración de la estructura de grupos y plantillas.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={activeTab === 'users' ? handleAddUser : handleAddGroup}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <span className="text-xl">+</span> {activeTab === 'users' ? 'Nuevo Registro' : 'Nuevo Grupo'}
            </button>
          </div>
        </header>

        {activeTab === 'users' && <StatsCards users={users} />}

        {/* Data Controls & Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white sticky top-0 z-10">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={activeTab === 'users' ? "Buscar colaborador o ID..." : "Buscar grupo o ID de grupo..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800"
              />
              <span className="absolute left-4 top-4 text-slate-400 font-bold">🔍</span>
            </div>

            {activeTab === 'users' && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Filtrar:</span>
                <select 
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold text-slate-700 min-w-[200px] cursor-pointer appearance-none"
                >
                  <option value="Todos">Todos los Equipos</option>
                  {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Colaborador</th>
                    <th className="px-8 py-5">Equipo</th>
                    <th className="px-8 py-5">Mes Cumple</th>
                    <th className="px-8 py-5 text-center">Día</th>
                    <th className="px-8 py-5">Estado</th>
                    <th className="px-8 py-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-8 py-8 h-20 bg-slate-50/30"></td>
                      </tr>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const birthdayAlert = isBirthdaySoon(user);
                      return (
                        <tr key={user.id} className={`hover:bg-slate-50/50 transition-all group ${birthdayAlert ? 'bg-pink-50/10' : ''}`}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${birthdayAlert ? 'bg-gradient-to-tr from-pink-500 to-rose-400' : 'bg-slate-200 text-slate-500'}`}>
                                {user.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{user.nombre}</p>
                                <p className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">ID {user.id_empleado}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[11px] font-black uppercase tracking-tighter text-slate-600 px-3 py-1.5 bg-slate-100 rounded-xl">{user.equipo}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-sm font-bold ${birthdayAlert ? 'text-pink-600' : 'text-slate-700'}`}>
                              {user.mes}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center font-black text-sm">
                             <span className={`inline-block w-8 py-1 rounded-lg ${birthdayAlert ? 'bg-pink-100 text-pink-700' : 'text-slate-800'}`}>{user.dia}</span>
                          </td>
                          <td className="px-8 py-5">
                            {getStatusBadge(user.estado)}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex justify-center items-center gap-3">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                                title="Editar Perfil"
                              >
                                <span className="text-lg">✏️</span>
                              </button>
                              <button 
                                onClick={() => handleDeactivateUser(user.id)}
                                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-90 ${user.estado === 'Inactivo' ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'}`}
                                disabled={user.estado === 'Inactivo'}
                                title="Desactivar"
                              >
                                <span className="text-lg">🗑️</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                             <span className="text-4xl opacity-40">📂</span>
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Sin resultados encontrados</p>
                          <button onClick={() => {setFilterTeam('Todos'); setSearchQuery('');}} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-xs transition-all">LIMPIAR BÚSQUEDA</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // Groups View
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Equipo</th>
                    <th className="px-8 py-5">Group ID</th>
                    <th className="px-8 py-5">Plantilla / Descripción</th>
                    <th className="px-8 py-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-8 py-8 h-20 bg-slate-50/30"></td>
                      </tr>
                    ))
                  ) : filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-110 bg-indigo-500">
                              {group.equipo.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-800 leading-tight">{group.equipo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[11px] font-mono font-bold text-slate-400">{group.group_id}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm text-slate-600 max-w-xs truncate" title={group.plantilla}>{group.plantilla}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center items-center gap-3">
                            <button 
                              onClick={() => handleEditGroup(group)}
                              className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                              title="Editar Grupo"
                            >
                              <span className="text-lg">✏️</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteGroup(group.id)}
                              className="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                              title="Eliminar Grupo"
                            >
                              <span className="text-lg">🗑️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                             <span className="text-4xl opacity-40">📂</span>
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No hay grupos configurados</p>
                          <button onClick={() => setSearchQuery('')} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-xs transition-all">LIMPIAR BÚSQUEDA</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mostrando <span className="text-slate-900">{activeTab === 'users' ? filteredUsers.length : filteredGroups.length}</span> registros.
            </p>
            <div className="flex gap-3">
              <button disabled className="px-6 py-2.5 rounded-xl border border-slate-100 bg-white text-slate-300 cursor-not-allowed text-[10px] font-black uppercase tracking-widest">Anterior</button>
              <button disabled className="px-6 py-2.5 rounded-xl border border-slate-100 bg-white text-slate-300 cursor-not-allowed text-[10px] font-black uppercase tracking-widest">Siguiente</button>
            </div>
          </div>
        </div>
      </main>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />

      <GroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        onSave={handleSaveGroup}
        groupToEdit={groupToEdit}
      />
    </div>
  );
};

export default App;
