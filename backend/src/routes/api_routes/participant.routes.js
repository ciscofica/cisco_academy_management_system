import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import {
  getParticipants,
  getParticipantsDropdown,
  addParticipant,
  updateParticipant,
  addfromExcel
} from "../../controllers/api_controllers/participant.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/participants-dropdown", getParticipantsDropdown);
router.post("/participants", getParticipants);
router.post('/participant', adminRequired, addParticipant);
router.post('/upload-excel', adminRequired, upload.single("file"), addfromExcel);
// router.get('/course/:id', getCourseById);
router.put('/participant/:id', adminRequired, updateParticipant);
// router.delete('/course/:id', inactiveCourse);

export default router;
