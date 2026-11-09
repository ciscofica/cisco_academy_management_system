import { Router } from "express";
import {
  getCoursesDropdown,
  addCourse,
  getAllCourses,
  getCourseById,
  inactiveCourse,
  updateCourse,
  getCertificates,
  getCourseTemplates,
  getCourseTemplateById,
  startCourseFromTemplate,
  updateCourseEdition,
  getCourseExpedient,
  getCoursesReport,
  getCourseParticipantsReport,
  enrollCourseParticipant,
  enrollCourseParticipantsBulk,
  removeCourseParticipant,
  updateParticipantAcademicRecord,
  validateCourseClosure,
  closeCourseEdition,
  reopenCourseEdition,
  addCourseChapter,
  updateCourseChapter,
  removeCourseChapter,
  loadDefaultCourseChapters,
  getCoursePayments,
  validateParticipantPayment,
  importInvoicesBulk,
  downloadCourseDocumentDocx,
  saveCourseTemplate,
  exportCoursePaymentsExcel,
  exportCourseParticipantsExcel,
  reorderCourseChapters,
} from "../../controllers/api_controllers/course.controller.js";

const router = Router();

router.get("/course/templates", getCourseTemplates);
router.post("/course/templates", saveCourseTemplate);
router.put("/course/templates/:id", saveCourseTemplate);
router.get("/course/:id/payments/export.xlsx", exportCoursePaymentsExcel);
router.get("/course/:id/participants/export.xlsx", exportCourseParticipantsExcel);
router.get("/course/template/:id", getCourseTemplateById);
router.post("/course/start-from-template", startCourseFromTemplate);
router.put("/course/:id/edition", updateCourseEdition);
router.get("/courses/report", getCoursesReport);
router.get("/course/:id/expedient", getCourseExpedient);
router.get("/course/:id/participants-report", getCourseParticipantsReport);
router.post("/course/:id/enroll-participant", enrollCourseParticipant);
router.post("/course/:id/enroll-bulk", enrollCourseParticipantsBulk);
router.delete("/course/:id/participant/:participantId", removeCourseParticipant);
router.put("/course/:id/participant/:participantId/academic-record", updateParticipantAcademicRecord);
router.get("/course/:id/validate-closure", validateCourseClosure);
router.post("/course/:id/close-edition", closeCourseEdition);
router.post("/course/:id/reopen-edition", reopenCourseEdition);
router.post("/course/:id/chapter", addCourseChapter);
router.put("/course/:id/chapters/reorder", reorderCourseChapters);
router.put("/course/:id/chapter/:chapterId", updateCourseChapter);
router.delete("/course/:id/chapter/:chapterId", removeCourseChapter);
router.post("/course/:id/load-default-chapters", loadDefaultCourseChapters);
router.get("/course/:id/payments", getCoursePayments);
router.get("/course/:id/document/:docType/docx", downloadCourseDocumentDocx);
router.put("/course/:id/participant/:participantId/validate-payment", validateParticipantPayment);
router.post("/course/:id/import-invoices", importInvoicesBulk);
router.get("/course/:id", getCourseById);
router.get("/courses-dropdown", getCoursesDropdown);
router.get("/courses-certificate/:id", getCertificates);
router.post("/courses", getAllCourses);
router.post("/course", addCourse);
router.put("/course/:id", updateCourse);
router.delete("/course/:id", inactiveCourse);

export default router;
