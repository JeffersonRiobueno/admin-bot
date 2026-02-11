
import React, { useState, useEffect } from 'react';
import { User, MONTHS, TEAMS } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  type FormState = {
    id: number;
    nombre: string;
    mes: number;
    dia: number;
    equipo: string;
    estado: boolean; // true = activo, false = inactivo
    id_empleado: string;
  };

  const emptyForm = (): FormState => ({
    id: Math.floor(Math.random() * 10000),
    nombre: '',
    mes: new Date().getMonth() + 1,
    dia: 1,
    equipo: TEAMS[0] || 'Desarrollo',
    estado: true,
    id_empleado: ''
  });

  const [formData, setFormData] = useState<FormState>(emptyForm);

  // normalize various representations to boolean
  const toBool = (s: any): boolean => {
    if (s === true || s === 1 || s === '1') return true;
    if (s === false || s === 0 || s === '0') return false;
    if (typeof s === 'string') {
      const low = s.toLowerCase();
      if (low === 'true' || low === 'activo' || low === 'activo') return true;
      return false;
    }
    return Boolean(s);
  };

  useEffect(() => {
    if (userToEdit) {
      // convert existing mes to numeric (1-12) if needed
      const toNum = (m: any): number => {
        if (m === null || m === undefined) return new Date().getMonth() + 1;
        if (typeof m === 'number') return m;
        const asNum = parseInt(String(m));
        if (!isNaN(asNum)) return asNum;
        const idx = MONTHS.indexOf(String(m));
        if (idx >= 0) return idx + 1;
        return new Date().getMonth() + 1;
      };

      setFormData({
        id: userToEdit.id,
        nombre: userToEdit.nombre || '',
        mes: toNum(userToEdit.mes),
        dia: userToEdit.dia || 1,
        equipo: userToEdit.equipo || (TEAMS[0] || 'Desarrollo'),
        estado: toBool(userToEdit.estado),
        // If the existing record has no id_empleado, keep it blank (do not auto-generate)
        id_empleado: userToEdit.id_empleado ?? ''
      });
    } else {
      setFormData(emptyForm());
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'dia' ? parseInt(value) || 1 : (name === 'mes' ? parseInt(value) || new Date().getMonth() + 1 : value) 
    } as any));
  };

  const handleEstadoChange = (val: boolean) => {
    setFormData(prev => ({ ...prev, estado: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // build User compatible object (estado as boolean allowed by types)
    const user: User = {
      id: formData.id,
      nombre: formData.nombre,
      mes: formData.mes,
      dia: formData.dia,
      equipo: formData.equipo,
      estado: formData.estado as any,
      id_empleado: formData.id_empleado
    };
    onSave(user);
    // reset form to avoid stale data if modal remains open
    setFormData(emptyForm());
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400 appearance-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {userToEdit ? 'Editar Registro' : 'Nuevo Colaborador'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Completa la información del perfil</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Nombre Completo</label>
              <input
                required
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">ID Empleado</label>
              <input
                type="text"
                name="id_empleado"
                value={formData.id_empleado}
                onChange={handleChange}
                className={inputClasses}
                placeholder="EMP-XXX"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Equipo</label>
              <div className="relative">
                <select
                  name="equipo"
                  value={formData.equipo}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Mes Cumple</label>
              <div className="relative">
                <select
                  name="mes"
                  value={String(formData.mes)}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {MONTHS.map((m, idx) => <option key={m} value={String(idx + 1)}>{m}</option>)}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Día Cumple</label>
              <input
                type="number"
                name="dia"
                min="1"
                max="31"
                value={formData.dia}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Estado de Colaborador</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="estado"
                    value="true"
                    checked={formData.estado === true}
                    onChange={() => handleEstadoChange(true)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all cursor-pointer"
                  />
                  <span className={`text-sm font-bold transition-all ${formData.estado === true ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>Activo</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="estado"
                    value="false"
                    checked={formData.estado === false}
                    onChange={() => handleEstadoChange(false)}
                    className="w-5 h-5 text-rose-600 focus:ring-rose-500 border-slate-300 transition-all cursor-pointer"
                  />
                  <span className={`text-sm font-bold transition-all ${formData.estado === false ? 'text-rose-600' : 'text-slate-500 group-hover:text-slate-700'}`}>Inactivo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
