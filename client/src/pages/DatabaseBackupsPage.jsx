import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  createDatabaseBackupRequest,
  downloadDatabaseBackupRequest,
  getDatabaseBackupsRequest,
  restoreDatabaseBackupRequest,
  updateDatabaseBackupSettingsRequest,
} from "../api/database_backup";

const formatSize = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

export default function DatabaseBackupsPage() {
  const [backups, setBackups] = useState([]);
  const [settings, setSettings] = useState({ schedule: "Diario 02:00", timeZone: "America/Guayaquil", retentionDays: 30 });
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [retentionDays, setRetentionDays] = useState("30");
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringFile, setRestoringFile] = useState("");

  const loadBackups = useCallback(async () => {
    const response = await getDatabaseBackupsRequest();
    setBackups(response.data?.backups || []);
    const current = response.data?.settings;
    if (current) {
      setSettings(current);
      setScheduleTime(current.schedule?.replace(/^Diario\s+/, "") || "02:00");
      setRetentionDays(String(current.retentionDays || 30));
    }
  }, []);

  useEffect(() => {
    loadBackups().catch((error) => Swal.fire("Error", error.response?.data?.message || "No se pudieron cargar los respaldos.", "error")).finally(() => setLoading(false));
  }, [loadBackups]);

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await createDatabaseBackupRequest();
      await loadBackups();
      await Swal.fire("Respaldo creado", response.data?.backup?.filename || "La copia está lista para descargar.", "success");
    } catch (error) {
      Swal.fire("No se pudo crear el respaldo", error.response?.data?.message || "Verifique la configuración de MySQL y vuelva a intentarlo.", "error");
    } finally { setCreatingBackup(false); }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const response = await updateDatabaseBackupSettingsRequest({ scheduleTime, retentionDays: Number(retentionDays) });
      setSettings(response.data.settings);
      Swal.fire("Configuración guardada", "El horario diario y la retención se actualizaron.", "success");
    } catch (error) {
      Swal.fire("No se pudo guardar", error.response?.data?.message || "Revise la hora y el periodo de retención.", "error");
    } finally { setSavingSettings(false); }
  };

  const downloadBackup = async (backup) => {
    try {
      const response = await downloadDatabaseBackupRequest(backup.filename);
      const objectUrl = URL.createObjectURL(new Blob([response.data], { type: "application/gzip" }));
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      Swal.fire("No se pudo descargar", error.response?.data?.message || "Inténtelo nuevamente.", "error");
    }
  };

  const restoreBackup = async (backup) => {
    const result = await Swal.fire({
      title: "Restaurar este respaldo",
      html: `<p class="mb-3 text-sm">La restauración reemplazará los datos actuales de la base. Antes se generará una copia de seguridad del estado actual.</p><p class="mb-2 text-left text-xs font-semibold">Escriba <strong>RESTAURAR</strong> para confirmar:</p><input id="backup-restore-confirmation" class="swal2-input" autocomplete="off" />`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Restaurar base de datos",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b91c1c",
      preConfirm: () => {
        const value = document.getElementById("backup-restore-confirmation")?.value;
        if (value !== "RESTAURAR") { Swal.showValidationMessage("Escriba exactamente RESTAURAR para continuar."); return false; }
        return value;
      },
    });
    if (!result.isConfirmed) return;

    setRestoringFile(backup.filename);
    try {
      const response = await restoreDatabaseBackupRequest(backup.filename, result.value);
      await loadBackups();
      await Swal.fire("Base restaurada", `Se restauró ${backup.filename}. Copia previa: ${response.data.safetyBackup}.`, "success");
    } catch (error) {
      Swal.fire("No se pudo completar la restauración", error.response?.data?.message || "La copia previa se conserva si alcanzó a generarse.", "error");
      await loadBackups().catch(() => {});
    } finally { setRestoringFile(""); }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">Respaldos de la base de datos</h1>
          <p className="mt-1 text-sm text-slate-500">Cree, descargue y restaure copias de seguridad. Solo los administradores pueden acceder.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-bold text-slate-800">Respaldo automático</h2><p className="text-sm text-slate-500">Se ejecuta diariamente en la zona horaria de Ecuador.</p></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{settings.schedule} · conservar {settings.retentionDays} días</span>
          </div>
          <form onSubmit={saveSettings} className="flex flex-wrap items-end gap-4">
            <label className="text-sm font-medium text-slate-700">Hora local<input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2" required /></label>
            <label className="text-sm font-medium text-slate-700">Retención (días)<input type="number" min="1" max="365" value={retentionDays} onChange={(event) => setRetentionDays(event.target.value)} className="mt-1 block w-36 rounded-lg border border-slate-300 px-3 py-2" required /></label>
            <button disabled={savingSettings} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50">{savingSettings ? "Guardando…" : "Guardar programación"}</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div><h2 className="font-bold text-slate-800">Copias disponibles</h2><p className="text-sm text-slate-500">Los archivos se guardan en una carpeta privada del equipo servidor.</p></div>
            <button onClick={createBackup} disabled={creatingBackup || Boolean(restoringFile)} className="rounded-xl bg-[#6cc24a] px-4 py-2 font-semibold text-white disabled:opacity-50">{creatingBackup ? "Creando respaldo…" : "Crear respaldo ahora"}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Fecha y hora</th><th className="p-3">Origen</th><th className="p-3">Tamaño</th><th className="p-3">Archivo</th><th className="p-3">Acciones</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">Cargando…</td></tr> : backups.length ? backups.map((backup) => <tr key={backup.filename} className="border-t border-slate-100"><td className="whitespace-nowrap p-3">{new Date(backup.createdAt).toLocaleString("es-EC", { timeZone: "America/Guayaquil" })}</td><td className="p-3">{backup.type === "automatic" ? "Automático" : backup.type === "pre_restore" ? "Previo a restauración" : "Manual"}</td><td className="whitespace-nowrap p-3">{formatSize(backup.sizeBytes)}</td><td className="max-w-xs truncate p-3 font-mono text-xs" title={backup.filename}>{backup.filename}</td><td className="whitespace-nowrap p-3"><button onClick={() => downloadBackup(backup)} className="mr-3 font-semibold text-blue-700 hover:underline">Descargar</button><button onClick={() => restoreBackup(backup)} disabled={Boolean(restoringFile) || creatingBackup} className="font-semibold text-rose-700 hover:underline disabled:opacity-50">{restoringFile === backup.filename ? "Restaurando…" : "Restaurar"}</button></td></tr>) : <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aún no hay respaldos. Cree uno manualmente o espere la programación diaria.</td></tr>}</tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
