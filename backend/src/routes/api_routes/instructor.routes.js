import { adminRequired } from "../../middlewares/validateToken.js";
import { Router } from "express";
import { getInstructorsDropdown,addInstructor, getInstructorById, getInstructors, updateInstructor } from "../../controllers/api_controllers/instructor.controller.js";
const router = Router();
router.get('/instructor/:id', adminRequired, getInstructorById);
router.get('/instructors-dropdown', getInstructorsDropdown);
router.post('/instructors', adminRequired, getInstructors);
router.post('/instructor', adminRequired, addInstructor);
router.put('/instructor/:id', adminRequired, updateInstructor);
// router.delete('/user', register);

export default router;
