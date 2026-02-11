
import React, { useState, useEffect } from 'react';
import { Group } from '../types';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Group) => void;
  groupToEdit: Group | null;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSave, groupToEdit }) => {
  const [formData, setFormData] = useState<Group>({
    id: 0,
    name: '',
    sku: '',
    group_id: '',
    path_url: '',
    status: true
  });

  useEffect(() => {
    if (groupToEdit) {
      setFormData(groupToEdit);
    } else {
      setFormData({
        id: Math.floor(Math.random() * 10000),
        name: '',
        sku: '',
        group_id: `GRP-${Math.floor(Math.random() * 1000)}`,
        path_url: '',
        status: true
      });
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as any));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // normalize status to boolean
    const payload = { ...formData, status: (formData as any).status ? 1 : 0 } as any;
    onSave(payload);
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white text-slate-800 font-medium placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {groupToEdit ? 'Editar Grupo' : 'Nuevo Grupo'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Configuración de equipo corporativo</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Nombre del Equipo</label>
              <input
                required
                type="text"
                name="name"
                value={(formData as any).name}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Ej. Operaciones Digitales"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={(formData as any).sku}
                onChange={handleChange}
                className={inputClasses}
                placeholder="BCP"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">ID de Grupo</label>
              <input
                required
                type="text"
                name="group_id"
                value={(formData as any).group_id}
                onChange={handleChange}
                className={inputClasses}
                placeholder="GRP-XXXX"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Path URL</label>
              <input
                type="text"
                name="path_url"
                value={(formData as any).path_url}
                onChange={handleChange}
                className={inputClasses}
                placeholder="cumples_bcp"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Activo</label>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="status" checked={(formData as any).status === true || (formData as any).status === 'True' || (formData as any).status === '1' || (formData as any).status === 1} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked } as any))} />
                <span className="text-sm text-slate-600">Marcar como activo</span>
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

export default GroupModal;
