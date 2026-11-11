import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import {
  addParticipantType,
  getParticipantTypeById,
  getParticipantTypes,
  inactiveParticipantType,
  updateParticipantType,
  getParticipantTypesDropdown,
} from "../../controllers/api_controllers/participant_type.controller.js";
const router = Router();
router.get("/participant-type/:id", adminRequired, getParticipantTypeById);
router.post("/participant-types", adminRequired, getParticipantTypes);
router.post("/participant-type", adminRequired, addParticipantType);
router.put("/participant-type/:id", adminRequired, updateParticipantType);
router.delete("/participant-type/:id", adminRequired, inactiveParticipantType);
router.get("/participant-types-dropdown", getParticipantTypesDropdown);

export default router;
