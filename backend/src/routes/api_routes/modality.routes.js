import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import {  addModality, getModalities, getModalityById, updateModality, deleteModality, getModalitiesDropdown } from "../../controllers/api_controllers/modality.controller.js";
const router = Router();
router.get('/modality/:id', adminRequired, getModalityById);
router.post('/modalities', adminRequired, getModalities);
router.post('/modality', adminRequired, addModality);
router.put('/modality/:id', adminRequired, updateModality);
router.delete('/modality/:id', adminRequired, deleteModality);
router.get('/modalities-dropdown', getModalitiesDropdown);


export default router;
