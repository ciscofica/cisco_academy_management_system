import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createGzip, createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import db from "../database/db.js";

const timeZone = process.env.DB_BACKUP_TIME_ZONE || "America/Guayaquil";
const backupDirectory = process.env.DB_BACKUP_DIR || path.join(process.env.LOCALAPPDATA || os.homedir(), "UTN_CISCO", "backups");
const settingsPath = path.join(backupDirectory, "backup-settings.json");
let scheduleTime = process.env.DB_BACKUP_TIME || "02:00";
let retentionDays = Math.max(1, Number(process.env.DB_BACKUP_RETENTION_DAYS) || 30);
const databaseName = db.sequelize.config.database;
let operationInProgress = false;
let schedulerTimer = null;
let schedulerStarted = false;
const backupFilenamePattern = /^utn_cms_(manual|automatic|pre_restore)_\d{8}T\d{9}Z\.sql\.gz$/;

function getSqlExecutables() {
  const dumpPath = process.env.MYSQLDUMP_PATH || (process.platform === "win32"
    ? "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"
    : "mysqldump");
  const mysqlPath = process.env.MYSQL_PATH || (path.isAbsolute(dumpPath)
    ? path.join(path.dirname(dumpPath), process.platform === "win32" ? "mysql.exe" : "mysql")
    : "mysql");
  return { dumpPath, mysqlPath };
}

function escapeOption(value) {
  return "\"" + String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "\"";
}

async function withClientOptions(callback) {
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  if (process.platform !== "win32") await fs.promises.chmod(backupDirectory, 0o700);
  const configPath = path.join(backupDirectory, ".mysql-client-" + crypto.randomUUID() + ".cnf");
  const config = db.sequelize.config;
  const content = "[client]\nhost=" + escapeOption(config.host) + "\nport=" + (Number(config.port) || 3306) +
    "\nuser=" + escapeOption(config.username) + "\npassword=" + escapeOption(config.password) + "\nprotocol=tcp\n";
  await fs.promises.writeFile(configPath, content, { mode: 0o600, flag: "wx" });
  try { return await callback(configPath); }
  finally { await fs.promises.rm(configPath, { force: true }).catch(() => {}); }
}

function timestamp() {
  return new Date().toISOString().replace(/[-:.]/g, "");
}

function safePath(filename) {
  if (typeof filename !== "string" || !backupFilenamePattern.test(filename)) {
    throw new Error("Nombre de respaldo inválido.");
  }
  const fullPath = path.resolve(backupDirectory, filename);
  if (path.dirname(fullPath) !== path.resolve(backupDirectory)) throw new Error("Ruta de respaldo inválida.");
  return fullPath;
}

function captureStderr(stream) {
  let output = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => { if (output.length < 10000) output += chunk.slice(0, 10000 - output.length); });
  return () => output.trim();
}

function waitForSuccess(child, commandName, getStderr) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => code === 0
      ? resolve()
      : reject(new Error(commandName + " terminó con código " + code + ": " + (getStderr() || "sin detalle"))));
  });
}

async function writeBackupFile(type) {
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const filename = "utn_cms_" + type + "_" + timestamp() + ".sql.gz";
  const outputPath = safePath(filename);
  const partialPath = outputPath + ".partial";
  const { dumpPath } = getSqlExecutables();
  let published = false;
  try {
    await withClientOptions(async (configPath) => {
      const args = ["--defaults-extra-file=" + configPath, "--single-transaction", "--quick", "--routines",
        "--triggers", "--events", "--hex-blob", "--default-character-set=utf8mb4",
        "--add-drop-database", "--databases", databaseName];
      const child = spawn(dumpPath, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      const getStderr = captureStderr(child.stderr);
      const output = fs.createWriteStream(partialPath, { flags: "wx", mode: 0o600 });
      await Promise.all([
        pipeline(child.stdout, createGzip({ level: 6 }), output),
        waitForSuccess(child, "mysqldump", getStderr),
      ]);
    });
    await fs.promises.rename(partialPath, outputPath);
    published = true;
    const stat = await fs.promises.stat(outputPath);
    return { filename, type, createdAt: stat.mtime.toISOString(), sizeBytes: stat.size };
  } catch (error) {
    await fs.promises.rm(partialPath, { force: true }).catch(() => {});
    if (published) await fs.promises.rm(outputPath, { force: true }).catch(() => {});
    if (error.code === "ENOENT") throw new Error("No se encontró mysqldump. Configure MYSQLDUMP_PATH con su ubicación.");
    throw error;
  }
}

async function withOperationLock(callback) {
  if (operationInProgress) throw new Error("Ya hay una operación de respaldo o restauración en curso.");
  operationInProgress = true;
  try { return await callback(); }
  finally { operationInProgress = false; }
}

async function pruneExpiredBackups() {
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const entries = await fs.promises.readdir(backupDirectory, { withFileTypes: true });
  await Promise.all(entries.filter((entry) => entry.isFile() && backupFilenamePattern.test(entry.name)).map(async (entry) => {
    const fullPath = safePath(entry.name);
    if ((await fs.promises.stat(fullPath)).mtimeMs < cutoff) await fs.promises.rm(fullPath, { force: true });
  }));
}

export async function createDatabaseBackup(type = "manual") {
  if (!["manual", "automatic"].includes(type)) throw new Error("Tipo de respaldo no permitido.");
  return withOperationLock(async () => {
    const backup = await writeBackupFile(type);
    await pruneExpiredBackups();
    return backup;
  });
}

export async function listDatabaseBackups() {
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const entries = await fs.promises.readdir(backupDirectory, { withFileTypes: true });
  const backups = await Promise.all(entries.filter((entry) => entry.isFile() && backupFilenamePattern.test(entry.name)).map(async (entry) => {
    const stat = await fs.promises.stat(safePath(entry.name));
    const match = entry.name.match(/^utn_cms_(manual|automatic|pre_restore)_/);
    return { filename: entry.name, type: match?.[1] || "manual", createdAt: stat.mtime.toISOString(), sizeBytes: stat.size };
  }));
  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDatabaseBackupPath(filename) {
  const fullPath = safePath(filename);
  const stat = await fs.promises.stat(fullPath);
  if (!stat.isFile()) throw new Error("El respaldo solicitado no existe.");
  return fullPath;
}

export async function restoreDatabaseBackup(filename) {
  const sourcePath = await getDatabaseBackupPath(filename);
  return withOperationLock(async () => {
    const safetyBackup = await writeBackupFile("pre_restore");
    const { mysqlPath } = getSqlExecutables();
    try {
      await withClientOptions(async (configPath) => {
        const child = spawn(mysqlPath, ["--defaults-extra-file=" + configPath, "--default-character-set=utf8mb4"],
          { windowsHide: true, stdio: ["pipe", "ignore", "pipe"] });
        const getStderr = captureStderr(child.stderr);
        await Promise.all([
          pipeline(fs.createReadStream(sourcePath), createGunzip(), child.stdin),
          waitForSuccess(child, "mysql", getStderr),
        ]);
      });
    } catch (error) {
      if (error.code === "ENOENT") throw new Error("No se encontró mysql.exe junto a mysqldump.exe. Configure MYSQL_PATH.");
      throw error;
    }
    await pruneExpiredBackups();
    return { restored: filename, safetyBackup: safetyBackup.filename };
  });
}

function delayUntilNextBackup() {
  const now = new Date();
  const localNow = new Date(now.toLocaleString("en-US", { timeZone }));
  const match = scheduleTime.match(/^(\d{2}):(\d{2})$/);
  const next = new Date(localNow);
  next.setHours(match ? Number(match[1]) : 2, match ? Number(match[2]) : 0, 0, 0);
  if (next <= localNow) next.setDate(next.getDate() + 1);
  return Math.max(1000, next.getTime() - localNow.getTime());
}

async function loadBackupSettings() {
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  try {
    const stored = JSON.parse(await fs.promises.readFile(settingsPath, "utf8"));
    if (/^\d{2}:\d{2}$/.test(stored.scheduleTime || "") && Number(stored.scheduleTime.slice(0, 2)) < 24 && Number(stored.scheduleTime.slice(3, 5)) < 60) scheduleTime = stored.scheduleTime;
    if (Number.isInteger(stored.retentionDays) && stored.retentionDays >= 1 && stored.retentionDays <= 365) retentionDays = stored.retentionDays;
  } catch (error) { if (error.code !== "ENOENT") console.error("No se pudo leer la configuración de respaldos."); }
}

export async function updateDatabaseBackupSettings(settings) {
  const newTime = String(settings?.scheduleTime || "");
  const newRetention = Number(settings?.retentionDays);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime)) throw new Error("Ingrese una hora válida en formato HH:mm.");
  if (!Number.isInteger(newRetention) || newRetention < 1 || newRetention > 365) throw new Error("La retención debe estar entre 1 y 365 días.");
  await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const tempSettings = settingsPath + ".partial";
  await fs.promises.writeFile(tempSettings, JSON.stringify({ scheduleTime: newTime, retentionDays: newRetention }, null, 2), { mode: 0o600 });
  await fs.promises.rename(tempSettings, settingsPath);
  scheduleTime = newTime;
  retentionDays = newRetention;
  await pruneExpiredBackups();
  if (schedulerStarted) {
    clearTimeout(schedulerTimer);
    scheduleNextBackup();
  }
  return getDatabaseBackupSettings();
}

function scheduleNextBackup() {
  schedulerTimer = setTimeout(async () => {
    schedulerTimer = null;
    try {
      await createDatabaseBackup("automatic");
      console.info("Respaldo diario de base de datos completado.");
    } catch (error) {
      console.error("Falló el respaldo diario:", error.message);
    } finally { if (schedulerStarted) scheduleNextBackup(); }
  }, delayUntilNextBackup());
  schedulerTimer.unref?.();
}

export async function startDatabaseBackupScheduler() {
  await loadBackupSettings();
  if (schedulerStarted) return;
  schedulerStarted = true;
  scheduleNextBackup();
  console.info("Respaldos diarios: " + scheduleTime + " (" + timeZone + "), retención: " + retentionDays + " días.");
}

export function getDatabaseBackupSettings() {
  return { schedule: "Diario " + scheduleTime, timeZone, retentionDays };
}
