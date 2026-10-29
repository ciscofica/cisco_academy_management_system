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

export const removeCourseParticipantRequest = (id, participantId) =>
  axios.delete(`/course/${id}/participant/${participantId}`);

export const updateParticipantAcademicRecordRequest = (id, participantId, data) =>
  axios.put(`/course/${id}/participant/${participantId}/academic-record`, data);
