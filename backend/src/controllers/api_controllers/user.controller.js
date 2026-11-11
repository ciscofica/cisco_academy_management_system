import User from "../../models/User.js";
// import notifications from "../../notifications.json" assert { type: "json" };
import fs from "fs";
import path from "path";
import Role from "../../models/Role.js";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
import bcrypt from "bcryptjs";
import { createAccessToken } from "../../libs/jwt.js";
import { Op } from "sequelize";

export const register = async (req, res) => {
  try {
    const { email, password, name, address, status } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: notifications.usuarios.u1 });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const defaultRole = await Role.findOne({ where: { name: "Visor", status: "Activo" } });

    if (!defaultRole) {
      return res.status(400).json({
        message: ["No existe el rol Visor. Contacte al administrador del sistema."],
      });
    }

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      address,
      status: "1",
      role_id: defaultRole.role_id,
    });

    // const token = await createAccessToken({user : newUser});
    // res.cookie('token',token);

    return res
      .status(201)
      .json({ message: notifications.usuarios.u4, user: { id: newUser.id, name: newUser.name, email: newUser.email, status: newUser.status, role_id: newUser.role_id } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: notifications.principal.p1 });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const attributes = req.currentUser?.Role?.name === "Administrador"
      ? ["id", "name", "email", "address", "status", "role_id"]
      : ["id", "name", "email", "status", "role_id"];
    const users = await User.findAll({ attributes, include: [{ model: Role, attributes: ["role_id", "name"] }], order: [["name", "ASC"]] });
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener los usuarios", error });
  }
};

export const createManagedUser = async (req, res) => {
  try {
    const { name, email, address, password, role_id } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !role_id) return res.status(400).json({ message: "Nombre, correo, contraseña y rol son obligatorios." });
    const existing = await User.findOne({ where: { email: email.trim() } });
    if (existing) return res.status(409).json({ message: "Ya existe una cuenta con ese correo." });
    const role = await Role.findOne({ where: { role_id, status: "Activo" } });
    if (!role) return res.status(400).json({ message: "Seleccione un rol activo." });
    const created = await User.create({ name: name.trim(), email: email.trim(), address: address || null, password: await bcrypt.hash(password, 10), role_id: role.role_id, status: "1" });
    return res.status(201).json({ message: "Usuario creado.", user: { id: created.id, name: created.name, email: created.email, status: created.status, role_id: created.role_id } });
  } catch (error) { return res.status(500).json({ message: "No se pudo crear el usuario." }); }
};

export const updateManagedUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
    if (Number(user.id) === Number(req.user.user.id) && req.body.status === "0") return res.status(400).json({ message: "No puede desactivar su propia cuenta." });
    const { name, email, address, role_id, status, password } = req.body;
    if (email && await User.findOne({ where: { email: email.trim(), id: { [Op.ne]: user.id } } })) return res.status(409).json({ message: "Ese correo ya está en uso." });
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim();
    if (address !== undefined) updates.address = address || null;
    if (status !== undefined) updates.status = String(status);
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (role_id !== undefined) {
      const role = await Role.findOne({ where: { role_id, status: "Activo" } });
      if (!role) return res.status(400).json({ message: "Seleccione un rol activo." });
      if (Number(user.id) === Number(req.user.user.id) && role.name !== "Administrador") return res.status(400).json({ message: "No puede quitarse a sí mismo el rol Administrador." });
      updates.role_id = role.role_id;
    }
    await user.update(updates);
    return res.json({ message: "Usuario actualizado." });
  } catch (error) { return res.status(500).json({ message: "No se pudo actualizar el usuario." }); }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el usuario", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await user.destroy();

    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al eliminar el usuario", error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // Tomamos el ID del usuario desde los parámetros de la URL
    const user = await User.findByPk(id); // Buscamos al usuario por ID

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si no hay datos para actualizar
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron campos para actualizar" });
    }

    const updatedFields = {}; // Para almacenar los campos válidos a actualizar

    // Iterar sobre los campos en req.body
    for (const field in req.body) {
      if (User.rawAttributes[field]) {
        // Verificar si el campo existe en el modelo
        if (field === "password") {
          // Si se pasa una nueva contraseña, la encriptamos antes de guardarla
          const hashedPassword = await bcrypt.hash(req.body[field], 10);
          updatedFields[field] = hashedPassword;
        } else {
          // Si es otro campo, simplemente lo añadimos al objeto updatedFields
          updatedFields[field] = req.body[field];
        }
      }
    }

    // Si no se encontraron campos válidos
    if (Object.keys(updatedFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No se encontraron campos válidos para actualizar" });
    }

    // Actualizamos el usuario solo con los campos que han sido enviados y que son válidos
    await user.update(updatedFields);

    return res
      .status(200)
      .json({ message: "Usuario actualizado exitosamente", user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario", error });
  }
};


// // ! funcion compleja de busqueda
// import { Op } from "sequelize";

// export const getPaginatedRecordsWithRelations = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, filters = {}, or } = req.body;
//     const offset = (page - 1) * limit;

//     let whereCondition = {};

//     // Buscar en todas las columnas de la tabla `users` y sus relaciones
//     if (or) {
//       const userColumns = Object.keys(User.rawAttributes);
//       const roleColumns = Object.keys(Role.rawAttributes);
//       const permissionColumns = Object.keys(Permission.rawAttributes);

//       whereCondition = {
//         [Op.or]: [
//           ...userColumns.map((col) => ({
//             [`User.${col}`]: { [Op.like]: `%${or}%` },
//           })),
//           ...roleColumns.map((col) => ({
//             [`Role.${col}`]: { [Op.like]: `%${or}%` },
//           })),
//           ...permissionColumns.map((col) => ({
//             [`Permission.${col}`]: { [Op.like]: `%${or}%` },
//           })),
//         ],
//       };
//     }

//     if (Object.keys(filters).length) {
//       whereCondition = {
//         [Op.and]: [
//           whereCondition,
//           Object.entries(filters).reduce((acc, [key, value]) => {
//             acc[key] = { [Op.like]: `%${value}%` };
//             return acc;
//           }, {}),
//         ],
//       };
//     }

//     // Realizar la consulta con relaciones
//     const { count, rows } = await User.findAndCountAll({
//       where: whereCondition,
//       include: [
//         {
//           model: Role,
//           include: [
//             {
//               model: Permission,
//               through: { attributes: [] }, // Excluye la tabla intermedia
//             },
//           ],
//           through: { attributes: [] }, // Excluye la tabla intermedia
//         },
//       ],
//       limit,
//       offset,
//     });

//     return res.status(200).json({
//       data: rows,
//       totalItems: count,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error al obtener los registros con relaciones",
//       error,
//     });
//   }
// };
