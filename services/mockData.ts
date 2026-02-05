
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
  { id: 1, equipo: 'Desarrollo', group_id: 'GRP-DEV', plantilla: 'Equipo de Software core' },
  { id: 2, equipo: 'Ventas', group_id: 'GRP-SALES', plantilla: 'Fuerza de ventas regional' },
  { id: 3, equipo: 'Marketing', group_id: 'GRP-MKT', plantilla: 'Creativos y analistas' },
  { id: 4, equipo: 'Recursos Humanos', group_id: 'GRP-RRHH', plantilla: 'Gestión de talento' },
  { id: 5, equipo: 'Soporte', group_id: 'GRP-SUPP', plantilla: 'Atención al cliente 24/7' },
];

export const fetchUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(initialUsers), 800);
  });
};

export const fetchGroups = (): Promise<Group[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(initialGroups), 600);
  });
};
