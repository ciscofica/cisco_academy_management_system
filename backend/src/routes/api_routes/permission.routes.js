import { Router } from "express";
import { authRequired, adminRequired } from "../../middlewares/validateToken.js";
import { getPermission,getPermissionById } from "../../controllers/api_controllers/permission.controller.js";
const router = Router();
router.use(authRequired, adminRequired);

router.get('/permission/:id', getPermissionById);
router.post('/permissions', getPermission);

export default router;
