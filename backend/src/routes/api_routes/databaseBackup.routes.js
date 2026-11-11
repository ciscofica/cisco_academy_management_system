import { Router } from "express";
import { authRequired, adminRequired } from "../../middlewares/validateToken.js";
import { createBackup, downloadBackup, getBackups, restoreBackup, updateBackupSettings } from "../../controllers/api_controllers/database_backup.controller.js";

const router = Router();
router.use(authRequired, adminRequired);
router.get("/database-backups", getBackups);
router.post("/database-backups", createBackup);
router.put("/database-backups/settings", updateBackupSettings);
router.get("/database-backups/:filename/download", downloadBackup);
router.post("/database-backups/:filename/restore", restoreBackup);

export default router;
