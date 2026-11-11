import axios from "./axios";

export const getDatabaseBackupsRequest = () => axios.get("/database-backups");
export const createDatabaseBackupRequest = () => axios.post("/database-backups");
export const updateDatabaseBackupSettingsRequest = (settings) => axios.put("/database-backups/settings", settings);
export const downloadDatabaseBackupRequest = (filename) => axios.get(`/database-backups/${encodeURIComponent(filename)}/download`, { responseType: "blob" });
export const restoreDatabaseBackupRequest = (filename, confirmationText) => axios.post(`/database-backups/${encodeURIComponent(filename)}/restore`, { confirmRestore: true, confirmationText });
