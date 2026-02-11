
export type UserStatus = 'Activo' | 'Inactivo' | 'Licencia' | boolean;

export interface User {
  id: number;
  nombre: string;
  mes: number | string;
  dia: number;
  equipo: string;
  estado: UserStatus;
  id_empleado: string;
}

export interface Group {
  id: number;
  name: string;
  sku: string;
  group_id: string;
  path_url: string;
  status: boolean | string;
}

export interface AppState {
  users: User[];
  groups: Group[];
  isLoading: boolean;
  filterTeam: string;
  searchQuery: string;
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_MAP: Record<string, number> = {
  'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
  'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
};

export const TEAMS = [
  'BCP', 'BCP-DEV', '-'
];

export const STATUSES: UserStatus[] = ['Activo', 'Inactivo', 'Licencia'];
