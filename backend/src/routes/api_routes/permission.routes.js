import { Router } from "express";
import { authRequired, adminOnlyRequired } from "../../middlewares/validateToken.js";
import { getPermission,getPermissionById } from "../../controllers/api_controllers/permission.controller.js";
const router = Router();

router.get('/permission/:id', authRequired, adminOnlyRequired, getPermissionById);
router.post('/permissions', authRequired, adminOnlyRequired, getPermission);

export default router;
