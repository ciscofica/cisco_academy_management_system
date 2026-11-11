import Permission from "../../models/Permission.js";
// import notifications from "../../notifications.json" assert { type: "json" };
import fs from "fs";
import path from "path";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
import { Op } from "sequelize";
import { SYSTEM_PERMISSION_NAMES } from "../../config/systemPermissions.js";

export const addPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    // const { name, description, status } = req.body;
    const status = "Activo";
    const roleExists = await Permission.findOne({ where: { name } });
    if (roleExists) {
      return res.status(400).json({ message: notifications.permisos.p1 });
    }

    const newPermission = await Permission.create({
      name,
      description,
      status,
    });

    return res
      .status(201)
      .json({ message: notifications.permisos.p4, role: newPermission });
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const getPermission = async (req, res) => {
  try {
    const { search = "", limit: requestedLimit = 10, page: requestedPage = 1 } = req.body;
    const limit = Math.max(1, Math.min(1000, Number(requestedLimit) || 10));
    const page = Math.max(1, Number(requestedPage) || 1);
    const offset = (page - 1) * limit;

    const permissions = await Permission.findAndCountAll({
      where: {
        name: { [Op.in]: SYSTEM_PERMISSION_NAMES },
        status: "Activo",
        ...(String(search).trim() ? { [Op.or]: [
          { name: { [Op.like]: `%${String(search).trim()}%` } },
          { description: { [Op.like]: `%${String(search).trim()}%` } },
        ] } : {}),
      },
      order: [["permission_id", "ASC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      total: permissions.count,
      totalPages: Math.max(1, Math.ceil(permissions.count / limit)),
      permissions: permissions.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findOne({ where: { permission_id: id, name: { [Op.in]: SYSTEM_PERMISSION_NAMES }, status: "Activo" } });

    if (!permission) {
      return res.status(404).json({ message: notifications.permisos.p5 });
    }

    return res.status(200).json(permission);
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const inactivePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByPk(id);
    let status = "";
    if (!permission) {
      return res.status(404).json({ message: notifications.permisos.p5 });
    }

    if (permission.status == "Activo") {
      status = "Inactivo";
    } else {
      status = "Activo";
    }
    // Cambiar el estado a 'Inactivo'
    await permission.update({ status: status });

    return res
      .status(200)
      .json({ message: notifications.permisos.p3, permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({ message: notifications.permisos.p5 });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    const updatedFields = {};

    for (const field in req.body) {
      if (Permission.rawAttributes[field]) {
        updatedFields[field] = req.body[field];
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    await permission.update(updatedFields);

    return res
      .status(200)
      .json({ message: notifications.permisos.p2, permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};
