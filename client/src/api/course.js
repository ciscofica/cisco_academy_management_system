import axios from "./axios";

export const getCoursesRequest = ({ search = "", limit = 15, page = 1 }) =>
  axios.post(`/courses`, { search, limit, page });
export const getAllCoursesRequest = ({ search = "", limit = 1000, page = 1 }) =>
  axios.post(`/courses`, { search, limit, page });
export const getCourseRequest = (id) => axios.get(`/course/${id}`);
export const createCourseRequest = (course) => axios.post(`/course`, course);
export const updateCourseRequest = (course) => axios.put(`/course/${course.id}`, course);
export const deleteCourseRequest = (id) => axios.delete(`/course/${id}`);
export const getCoursesDropdownRequest = () => axios.get(`/courses-dropdown`);
export const getCourseTemplatesRequest = () =>
  axios.get("/course/templates");
export const saveCourseTemplateRequest = (data, id) => id
  ? axios.put(`/course/templates/${id}`, data)
  : axios.post("/course/templates", data);
export const exportCoursePaymentsExcelRequest = (id) =>
  axios.get(`/course/${id}/payments/export.xlsx`, { responseType: "blob" });
export const exportCourseParticipantsExcelRequest = (id) =>
  axios.get(`/course/${id}/participants/export.xlsx`, { responseType: "blob" });

export const startCourseFromTemplateRequest = (course) =>
  axios.post("/course/start-from-template", course);

export const updateCourseEditionRequest = (id, data) =>
  axios.put(`/course/${id}/edition`, data);

export const getCourseExpedientRequest = (id) =>
  axios.get(`/course/${id}/expedient`);

export const getCoursesReportRequest = (status) =>
  axios.get(`/courses/report`, { params: { status } });

export const getCourseParticipantsReportRequest = (id) =>
  axios.get(`/course/${id}/participants-report`);

export const enrollCourseParticipantRequest = (id, data) =>
  axios.post(`/course/${id}/enroll-participant`, data);

export const enrollCourseParticipantsBulkRequest = (id, participants) =>
  axios.post(`/course/${id}/enroll-bulk`, { participants });

export const removeCourseParticipantRequest = (id, participantId) =>
  axios.delete(`/course/${id}/participant/${participantId}`);

export const updateParticipantAcademicRecordRequest = (id, participantId, data) =>
  axios.put(`/course/${id}/participant/${participantId}/academic-record`, data);

export const validateCourseClosureRequest = (id) =>
  axios.get(`/course/${id}/validate-closure`);

export const closeCourseEditionRequest = (id, data) =>
  axios.post(`/course/${id}/close-edition`, data);

export const reopenCourseEditionRequest = (id) =>
  axios.post(`/course/${id}/reopen-edition`);

export const addCourseChapterRequest = (id, data) =>
  axios.post(`/course/${id}/chapter`, data);

export const updateCourseChapterRequest = (id, chapterId, data) =>
  axios.put(`/course/${id}/chapter/${chapterId}`, data);

export const removeCourseChapterRequest = (id, chapterId) =>
  axios.delete(`/course/${id}/chapter/${chapterId}`);
export const reorderCourseChaptersRequest = (id, chapterIds) =>
  axios.put(`/course/${id}/chapters/reorder`, { chapter_ids: chapterIds });

export const getCoursePaymentsRequest = (id) =>
  axios.get(`/course/${id}/payments`);

export const validateParticipantPaymentRequest = (id, participantId, data) =>
  axios.put(`/course/${id}/participant/${participantId}/validate-payment`, data);

export const importInvoicesBulkRequest = (id, invoices) =>
  axios.post(`/course/${id}/import-invoices`, { invoices });

export const loadDefaultCourseChaptersRequest = (id) =>
  axios.post(`/course/${id}/load-default-chapters`);

export const downloadCourseDocumentDocxRequest = (id, docType) =>
  axios.get(`/course/${id}/document/${docType}/docx`, {
    responseType: "blob",
  });
