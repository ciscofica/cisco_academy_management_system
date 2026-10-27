import { Router } from "express";
import { getCoursesDropdown,addCourse,getAllCourses,getCourseById,inactiveCourse,updateCourse,getCertificates, getCourseTemplates,
  startCourseFromTemplate, getCourseExpedient, getCoursesReport, getCourseParticipantsReport } from "../../controllers/api_controllers/course.controller.js";
const router = Router();

router.get("/course/templates", getCourseTemplates);
router.post("/course/start-from-template", startCourseFromTemplate);
router.get('/courses/report', getCoursesReport);
router.get('/course/:id/expedient', getCourseExpedient);
router.get('/course/:id/participants-report', getCourseParticipantsReport);
router.get('/course/:id', getCourseById);
router.get('/courses-dropdown', getCoursesDropdown);
router.get('/courses-certificate/:id', getCertificates);
router.post('/courses', getAllCourses  );
router.post('/course', addCourse);
router.put('/course/:id', updateCourse);
router.delete('/course/:id', inactiveCourse);


export default router;