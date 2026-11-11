import { Router } from "express";
import { authRequired, adminOnlyRequired } from "../../middlewares/validateToken.js";
import { createBackup, downloadBackup, getBackups, restoreBackup, updateBackupSettings } from "../../controllers/api_controllers/database_backup.controller.js";

const router = Router();
router.get("/database-backups", authRequired, adminOnlyRequired, getBackups);
router.post("/database-backups", authRequired, adminOnlyRequired, createBackup);
router.put("/database-backups/settings", authRequired, adminOnlyRequired, updateBackupSettings);
router.get("/database-backups/:filename/download", authRequired, adminOnlyRequired, downloadBackup);
router.post("/database-backups/:filename/restore", authRequired, adminOnlyRequired, restoreBackup);

export default router;
