
import { User, Group } from '../types';

export const initialUsers: User[] = [
  { id: 1, nombre: 'Alejandro García', mes: 'Marzo', dia: 15, equipo: 'Desarrollo', estado: 'Activo', id_empleado: 'EMP-001' },
  { id: 2, nombre: 'Beatriz Soler', mes: 'Enero', dia: 22, equipo: 'Marketing', estado: 'Activo', id_empleado: 'EMP-002' },
  { id: 3, nombre: 'Carlos Ruiz', mes: 'Junio', dia: 5, equipo: 'Ventas', estado: 'Inactivo', id_empleado: 'EMP-003' },
  { id: 4, nombre: 'Diana Mendoza', mes: 'Diciembre', dia: 10, equipo: 'Recursos Humanos', estado: 'Activo', id_empleado: 'EMP-004' },
  { id: 5, nombre: 'Eduardo López', mes: 'Mayo', dia: 30, equipo: 'Soporte', estado: 'Licencia', id_empleado: 'EMP-005' },
  { id: 6, nombre: 'Fernanda Ortiz', mes: 'Agosto', dia: 12, equipo: 'Desarrollo', estado: 'Activo', id_empleado: 'EMP-006' },
  { id: 7, nombre: 'Gabriel Vaca', mes: 'Febrero', dia: 28, equipo: 'Operaciones', estado: 'Activo', id_empleado: 'EMP-007' },
  { id: 8, nombre: 'Héctor Silva', mes: 'Septiembre', dia: 18, equipo: 'Marketing', estado: 'Inactivo', id_empleado: 'EMP-008' },
  { id: 9, nombre: 'Isabel Torres', mes: 'Noviembre', dia: 3, equipo: 'Ventas', estado: 'Activo', id_empleado: 'EMP-009' },
  { id: 10, nombre: 'Javier Domínguez', mes: 'Abril', dia: 25, equipo: 'Soporte', estado: 'Activo', id_empleado: 'EMP-010' },
];

export const initialGroups: Group[] = [
  { id: 1, name: 'Desarrollo', sku: 'DEV', group_id: 'GRP-DEV', path_url: 'desarrollo', status: true },
  { id: 2, name: 'Ventas', sku: 'SALES', group_id: 'GRP-SALES', path_url: 'ventas', status: true },
  { id: 3, name: 'Marketing', sku: 'MKT', group_id: 'GRP-MKT', path_url: 'marketing', status: true },
  { id: 4, name: 'Recursos Humanos', sku: 'RRHH', group_id: 'GRP-RRHH', path_url: 'rrhh', status: true },
  { id: 5, name: 'Soporte', sku: 'SUPP', group_id: 'GRP-SUPP', path_url: 'soporte', status: false },
];

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/users', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data as User[];
  } catch (err) {
    console.warn('Fetch users failed, falling back to mock data', err);
    return new Promise((resolve) => setTimeout(() => resolve(initialUsers), 300));
  }
};

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/groups', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data as Group[];
  } catch (err) {
    console.warn('Fetch groups failed, falling back to mock data', err);
    return new Promise((resolve) => setTimeout(() => resolve(initialGroups), 300));
  }
};

export const createGroup = async (group: Partial<Group>): Promise<{ id?: number; error?: string }> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/groups', { method: 'POST', headers, body: JSON.stringify(group) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('createGroup error', err);
    return { error: String(err) };
  }
};

export const updateGroup = async (id: number, group: Partial<Group>): Promise<{ updated?: boolean; error?: string }> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers, body: JSON.stringify(group) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('updateGroup error', err);
    return { error: String(err) };
  }
};

export const deleteGroup = async (id: number): Promise<{ deleted?: boolean; error?: string }> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('deleteGroup error', err);
    return { error: String(err) };
  }
};

export const createUser = async (user: Partial<User>): Promise<{ id?: number; error?: string }> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(user) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('createUser error', err);
    return { error: String(err) };
  }
};

export const updateUser = async (id: number, user: Partial<User>): Promise<{ updated?: boolean; error?: string }> => {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers, body: JSON.stringify(user) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('updateUser error', err);
    return { error: String(err) };
  }
};

export const login = async (user: string, pass: string): Promise<{ token?: string; user?: any; error?: string }> => {
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, pass }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('login error', err);
    return { error: String(err.message || err) };
  }
};

export const logout = async (): Promise<{ ok?: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/logout', { method: 'POST', headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('logout error', err);
    return { error: String(err) };
  }
};

export const me = async (): Promise<{ user?: any; error?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/me', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('me error', err);
    return { error: String(err) };
  }
};

export const changePassword = async (user: string, currentPass: string, newPass: string): Promise<{ ok?: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, currentPass, newPass }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('changePassword error', err);
    return { error: String(err.message || err) };
  }
};
