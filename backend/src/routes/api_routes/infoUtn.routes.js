import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import { addInfoUtn,deleteInfoUtn,getInfoUtnById,getInfosUtn,getInfosUtnDropdown,updateInfoUtn } from "../../controllers/api_controllers/info_utn.controller.js";
const router = Router();
router.get('/info-utn/:id', adminRequired, getInfoUtnById);
router.get('/infos-utn/dropdown', getInfosUtnDropdown);
router.post('/infos-utn', adminRequired, getInfosUtn);
router.post('/info-utn', adminRequired, addInfoUtn);
router.put('/info-utn/:id', adminRequired, updateInfoUtn);
router.delete('/info-utn/:id', adminRequired, deleteInfoUtn);

export default router;
