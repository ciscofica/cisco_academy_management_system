import { Router } from "express";
import { register, getAllUsers, createManagedUser, updateManagedUser } from "../../controllers/api_controllers/user.controller.js";
import { authRequired, adminRequired, userDirectoryReadRequired } from "../../middlewares/validateToken.js";
const router = Router();

router.post('/register', register);
router.get('/users', authRequired, userDirectoryReadRequired, getAllUsers);
router.post('/users', authRequired, adminRequired, createManagedUser);
router.put('/users/:id', authRequired, adminRequired, updateManagedUser);

export default router;
