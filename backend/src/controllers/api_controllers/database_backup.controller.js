import {
  createDatabaseBackup,
  getDatabaseBackupPath,
  getDatabaseBackupSettings,
  listDatabaseBackups,
  restoreDatabaseBackup,
  updateDatabaseBackupSettings,
} from "../../services/databaseBackupService.js";

export const getBackups = async (req, res) => {
  try {
    return res.json({ backups: await listDatabaseBackups(), settings: getDatabaseBackupSettings() });
  } catch (error) {
    console.error("Error listando respaldos:", error.message);
    return res.status(500).json({ message: "No se pudieron consultar los respaldos." });
  }
};

export const createBackup = async (req, res) => {
  try {
    const backup = await createDatabaseBackup("manual");
    return res.status(201).json({ message: "Respaldo creado correctamente.", backup });
  } catch (error) {
    const status = /operación.*en curso/i.test(error.message) ? 409 : 500;
    console.error("Error creando respaldo:", error.message);
    return res.status(status).json({ message: error.message || "No se pudo crear el respaldo." });
  }
};

export const downloadBackup = async (req, res) => {
  try {
    const fullPath = await getDatabaseBackupPath(req.params.filename);
    return res.download(fullPath, req.params.filename, (error) => {
      if (error && !res.headersSent) res.status(error.statusCode || 500).json({ message: "No se pudo descargar el respaldo." });
    });
  } catch (error) {
    return res.status(404).json({ message: "El archivo de respaldo no existe o no es válido." });
  }
};

export const restoreBackup = async (req, res) => {
  if (req.body?.confirmRestore !== true || req.body?.confirmationText !== "RESTAURAR") {
    return res.status(400).json({ message: "Confirme la restauración escribiendo RESTAURAR." });
  }
  try {
    const result = await restoreDatabaseBackup(req.params.filename);
    return res.json({ message: "Base de datos restaurada. Se creó un respaldo de seguridad previo.", ...result });
  } catch (error) {
    const status = /operación.*en curso/i.test(error.message) ? 409 : 500;
    console.error("Error restaurando respaldo:", error.message);
    return res.status(status).json({ message: error.message || "No se pudo restaurar el respaldo." });
  }
};

export const updateBackupSettings = async (req, res) => {
  try {
    const settings = await updateDatabaseBackupSettings(req.body);
    return res.json({ message: "Configuración de respaldos actualizada.", settings });
  } catch (error) {
    return res.status(400).json({ message: error.message || "No se pudo actualizar la configuración." });
  }
};
