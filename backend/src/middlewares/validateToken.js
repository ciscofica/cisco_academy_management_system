import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config/config.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { getActivePermissionNames } from "../config/systemPermissions.js";
// import notifications from "../notifications.json" assert { type: "json" };

import fs from "fs";
import path from "path";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

export const authRequired = (req, res, next) => {
  const { token } = req.cookies;
  if (!token)
    return res.status(401).json({ message: notifications.principal.p3 });

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: notifications.principal.p3 });
    req.user = user;
    next();
  });
};

export const adminRequired = async (req, res, next) => {
  try {
    const id = req.user?.user?.id;
    const user = id ? await User.findByPk(id, { include: [{ model: Role, attributes: ["name", "status"], include: [{ model: Permission, attributes: ["name", "status"], through: { attributes: [] } }] }] }) : null;
    if (!user || String(user.status) !== "1") return res.status(401).json({ message: "La cuenta no está activa." });
    const permissionNames = getActivePermissionNames(user.Role);
    const canReadInformation = isReadOnlyInformationRoute(req.method, req.path || req.originalUrl)
      && (permissionNames.includes("Consultar información") || permissionNames.includes("Consultar dashboard"));
    if (user.Role?.status !== "Activo" || (user.Role?.name !== "Administrador" && !canReadInformation)) return res.status(403).json({ message: "Se requiere el rol Administrador o el permiso de consulta para esta vista." });
    req.currentUser = user;
    next();
  } catch (error) { return res.status(500).json({ message: "No se pudo validar el permiso de administración." }); }
};


const normalizeApiPath = (routePath = "") =>
  String(routePath).split("?")[0].replace(/^\/api(?=\/)/, "").replace(/\/+$/, "") || "/";

const isReadOnlyInformationRoute = (method, routePath) => {
  const normalizedPath = normalizeApiPath(routePath);
  const readPostRoutes = ["/courses", "/participants", "/payments"];
  if (method === "POST") return readPostRoutes.includes(normalizedPath);
  if (method !== "GET" && method !== "HEAD") return false;

  return [
    /^\/courses-dropdown$/,
    /^\/courses\/report$/,
    /^\/courses-certificate\/\d+$/,
    /^\/course\/templates$/,
    /^\/course\/template\/\d+$/,
    /^\/course\/\d+$/,
    /^\/course\/\d+\/(?:expedient|participants-report|payments|payments\/export\.xlsx|participants\/export\.xlsx)$/,
    /^\/course\/\d+\/document\/[^/]+\/docx$/,
    /^\/payment-dropdown$/,
    /^\/payment\/\d+$/,
    /^\/participants-dropdown$/,
  ].some((pattern) => pattern.test(normalizedPath));
};

export const userDirectoryReadRequired = async (req, res, next) => {
  try {
    const id = req.user?.user?.id;
    const user = id ? await User.findByPk(id, { include: [{ model: Role, attributes: ["name", "status"], include: [{ model: Permission, attributes: ["name", "status"], through: { attributes: [] } }] }] }) : null;
    if (!user || String(user.status) !== "1") return res.status(401).json({ message: "La cuenta no está activa." });
    if (user.Role?.status !== "Activo") return res.status(403).json({ message: "El rol de la cuenta está inactivo." });
    const permissionNames = getActivePermissionNames(user.Role);
    const canReadUsers = user.Role?.name === "Administrador" || permissionNames.includes("Consultar información") || permissionNames.includes("Consultar dashboard");
    if (!canReadUsers) return res.status(403).json({ message: "No tiene permiso para consultar usuarios." });
    req.currentUser = user;
    next();
  } catch (error) { return res.status(500).json({ message: "No se pudo validar el acceso a usuarios." }); }
};

export const staffRequired = async (req, res, next) => {
  try {
    const id = req.user?.user?.id;
    const user = id ? await User.findByPk(id, { include: [{ model: Role, attributes: ["name", "status"], include: [{ model: Permission, attributes: ["name", "status"], through: { attributes: [] } }] }] }) : null;
    if (!user || String(user.status) !== "1") return res.status(401).json({ message: "La cuenta no está activa." });
    const permissionNames = getActivePermissionNames(user.Role);
    const routePath = normalizeApiPath(req.path || req.originalUrl);
    const informationReadOnly = isReadOnlyInformationRoute(req.method, routePath)
      && (permissionNames.includes("Consultar información") || permissionNames.includes("Consultar dashboard"));
    const paymentTypeDropdownForCourses = req.method === "GET" && routePath === "/payment-type-dropdown";
    const requiredPermission = /payment|payments|factur/i.test(routePath) && !paymentTypeDropdownForCourses ? "Gestionar pagos" : "Gestionar cursos";
    const roleHasModulePermission = permissionNames.includes(requiredPermission);
    if (!user.Role || user.Role.status !== "Activo" || (user.Role.name !== "Administrador" && !informationReadOnly && !roleHasModulePermission)) return res.status(403).json({ message: "No tiene el permiso requerido para esta función." });
    req.currentUser = user;
    next();
  } catch (error) { return res.status(500).json({ message: "No se pudo validar el acceso." }); }
};
