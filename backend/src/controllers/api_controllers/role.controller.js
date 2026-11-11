import Role from "../../models/Role.js";
import Permission from "../../models/Permission.js";
import User from "../../models/User.js";
// import notifications from "../../notifications.json" assert { type: "json" };
import fs from "fs";
import path from "path";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
import { Op } from "sequelize";
import { SYSTEM_PERMISSION_NAMES } from "../../config/systemPermissions.js";

const resolvePermissionIds = async (permissionIds = []) => {
  if (!Array.isArray(permissionIds)) throw new Error("Los permisos del rol deben enviarse como una lista.");
  const ids = [...new Set(permissionIds.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) throw new Error("La lista contiene un permiso inválido.");
  const permissions = ids.length
    ? await Permission.findAll({ where: { permission_id: { [Op.in]: ids }, name: { [Op.in]: SYSTEM_PERMISSION_NAMES }, status: "Activo" } })
    : [];
  if (permissions.length !== ids.length) throw new Error("El rol contiene permisos que ya no están disponibles en el sistema.");
  return ids;
};

export const addRole = async (req, res) => {
  return res.status(403).json({ message: "El sistema admite únicamente los roles base Administrador, Gestor y Visor." });
};

export const getRoles = async (req, res) => {
  try {
    const { search = "", limit = 10, page = 1 } = req.body; // Recibiendo search, limit y page
    const offset = (page - 1) * limit; // Cálculo de offset para paginación

    const roles = await Role.findAndCountAll({
      where: {
        name: { [Op.in]: ["Administrador", "Gestor", "Visor"] },
        [Op.and]: [{
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
          // Puedes agregar más columnas aquí si es necesario
        ],
        }],
      },
      include: [{ model: Permission, attributes: ["permission_id", "name", "description", "status"], where: { name: { [Op.in]: SYSTEM_PERMISSION_NAMES }, status: "Activo" }, required: false, through: { attributes: [] } }],
      distinct: true,
      limit: limit, // Tamaño de la página
      offset: offset, // Desplazamiento para la paginación
    });

    return res.status(200).json({
      total: roles.count, // Total de resultados
      totalPages: Math.ceil(roles.count / limit), // Total de páginas
      roles: roles.rows, // Resultados de permisos
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: notifications.principal.p1, error: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id, { include: [{ model: Permission, attributes: ["permission_id", "name", "description", "status"], where: { name: { [Op.in]: SYSTEM_PERMISSION_NAMES }, status: "Activo" }, required: false, through: { attributes: [] } }] });

    if (!role) {
      return res.status(404).json({ message: notifications.roles.r5 });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const inactiveRole = async (req, res) => {
  try {
    const { id } = req.params;
    let status = "";
    // Buscar y eliminar el usuario
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: notifications.roles.r5 });
    }
    if (["Administrador", "Gestor", "Visor"].includes(role.name)) return res.status(400).json({ message: "Los roles base del sistema no se pueden desactivar." });
    if (role.status == "Activo") {
      status = "Inactivo";
    } else {
      status = "Activo";
    }
    if (status === "Inactivo" && await User.count({ where: { role_id: role.role_id, status: "1" } })) return res.status(400).json({ message: "No se puede desactivar un rol asignado a cuentas activas." });
    await role.update({ status: status });

    return res.status(200).json({ message: notifications.roles.r3 });
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params; // Tomamos el ID del rol desde los parámetros de la URL
    const role = await Role.findByPk(id); // Buscamos el rol por ID (debe ser role_id)

    if (!role) {
      return res.status(404).json({ message: notifications.roles.r5 });
    }

    // Si no hay datos para actualizar
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    const { permission_ids } = req.body;
    let validPermissionIds;
    if (Array.isArray(permission_ids)) {
      try { validPermissionIds = await resolvePermissionIds(permission_ids); }
      catch (error) { return res.status(400).json({ message: error.message }); }
    }
    if (["Administrador", "Gestor", "Visor"].includes(role.name) && req.body.name && req.body.name !== role.name) return res.status(400).json({ message: "El nombre de este rol base es fijo para mantener la seguridad del sistema." });
    if (["Administrador", "Gestor", "Visor"].includes(role.name) && req.body.status && req.body.status !== "Activo") return res.status(400).json({ message: "Los roles base del sistema no se pueden desactivar." });
    if (role.name === "Visor" && Array.isArray(req.body.permission_ids)) return res.status(400).json({ message: "El rol Visor solo puede consultar información; sus permisos son fijos." });
    if (["Administrador", "Gestor"].includes(role.name) && Array.isArray(req.body.permission_ids)) return res.status(400).json({ message: `El rol ${role.name} conserva los permisos definidos por el sistema.` });
    const updatedFields = {};

    // Iterar sobre los campos en req.body
    for (const field in req.body) {
      if (Role.rawAttributes[field]) {
        // Asegúrate de usar Role.rawAttributes
        updatedFields[field] = req.body[field]; // Añadir el campo válido al objeto
      }
    }

    if (Object.keys(updatedFields).length === 0 && !Array.isArray(permission_ids)) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    if (Object.keys(updatedFields).length > 0) await role.update(updatedFields);
    if (validPermissionIds) await role.setPermissions(validPermissionIds);

    const updatedRole = await Role.findByPk(id, { include: [{ model: Permission, attributes: ["permission_id", "name", "description", "status"], where: { name: { [Op.in]: SYSTEM_PERMISSION_NAMES }, status: "Activo" }, required: false, through: { attributes: [] } }] });
    return res.status(200).json({ message: notifications.roles.r2, role: updatedRole });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};
