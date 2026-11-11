export const SYSTEM_PERMISSIONS = [
  {
    name: "Gestionar cursos",
    description: "Crear y administrar el catálogo, ediciones, planificación y reportes académicos de cursos.",
  },
  {
    name: "Gestionar pagos",
    description: "Consultar y administrar pagos, comprobantes y reportes de facturación.",
  },
  {
    name: "Consultar información",
    description: "Consultar cursos, participantes, usuarios del sistema, facturación y dashboard, sin modificar registros.",
  },
];

export const SYSTEM_PERMISSION_NAMES = SYSTEM_PERMISSIONS.map(({ name }) => name);

export const isActivePermission = (permission) =>
  ["activo", "1"].includes(String(permission?.status || "").toLowerCase());

export const getActivePermissionNames = (role) =>
  (role?.Permissions || [])
    .filter(isActivePermission)
    .map((permission) => permission.name);
