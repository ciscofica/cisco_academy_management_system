import { Op } from "sequelize";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { SYSTEM_PERMISSIONS, SYSTEM_PERMISSION_NAMES } from "../config/systemPermissions.js";

export async function synchronizeSystemPermissions() {
  let readPermission;
  for (const definition of SYSTEM_PERMISSIONS) {
    const [permission, created] = await Permission.findOrCreate({
      where: { name: definition.name },
      defaults: { ...definition, status: "Activo" },
    });

    if (!created && (permission.status !== "Activo" || permission.description !== definition.description)) {
      await permission.update({ ...definition, status: "Activo" });
    }
    if (definition.name === "Consultar información") readPermission = permission;
  }

  const legacyDashboardPermission = await Permission.findOne({ where: { name: "Consultar dashboard" } });
  if (legacyDashboardPermission && readPermission && legacyDashboardPermission.permission_id !== readPermission.permission_id) {
    const assignedRoles = await legacyDashboardPermission.getRoles();
    for (const role of assignedRoles) {
      await role.addPermission(readPermission);
      await role.removePermission(legacyDashboardPermission);
    }
  }

  const [administratorRole] = await Role.findOrCreate({
    where: { name: "Administrador" },
    defaults: { description: "Acceso completo al sistema.", status: "Activo" },
  });
  if (administratorRole.status !== "Activo") await administratorRole.update({ status: "Activo" });

  const [managerRole] = await Role.findOrCreate({
    where: { name: "Gestor" },
    defaults: { description: "Acceso completo a la gestión académica y de pagos, excepto usuarios y respaldos.", status: "Activo" },
  });
  const managerDescription = "Acceso completo a la gestión académica y de pagos, excepto usuarios y respaldos.";
  if (managerRole.status !== "Activo" || managerRole.description !== managerDescription) {
    await managerRole.update({ status: "Activo", description: managerDescription });
  }

  const [viewerRole] = await Role.findOrCreate({
    where: { name: "Visor" },
    defaults: { description: "Consulta cursos, participantes, usuarios, facturación e informes sin modificar datos.", status: "Activo" },
  });
  if (viewerRole.status !== "Activo" || viewerRole.description !== "Consulta cursos, participantes, usuarios, facturación e informes sin modificar datos.") {
    await viewerRole.update({ status: "Activo", description: "Consulta cursos, participantes, usuarios, facturación e informes sin modificar datos." });
  }

  const adminPermissions = await Permission.findAll({ where: { name: SYSTEM_PERMISSION_NAMES, status: "Activo" } });
  await administratorRole.setPermissions(adminPermissions);
  await managerRole.setPermissions(adminPermissions);
  await viewerRole.setPermissions(readPermission ? [readPermission] : []);

  const retiredRoles = await Role.findAll({ where: { name: { [Op.notIn]: ["Administrador", "Gestor", "Visor"] } } });
  for (const role of retiredRoles) {
    await User.update({ role_id: viewerRole.role_id }, { where: { role_id: role.role_id } });
    if (role.status !== "Inactivo") await role.update({ status: "Inactivo" });
  }
  await User.update({ role_id: viewerRole.role_id }, { where: { role_id: null } });

  await Permission.update(
    { status: "Inactivo" },
    { where: { name: { [Op.notIn]: SYSTEM_PERMISSION_NAMES } } },
  );
}
