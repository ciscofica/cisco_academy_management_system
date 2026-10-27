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
// export const getCertificatesRequest = (id) => axios.get(`/courses-certificate/${id}`, {responseType: 'blob'});

export const getCourseExpedientRequest = (id) =>
  axios.get(`/course/${id}/expedient`);

export const getCoursesReportRequest = (status) =>
  axios.get(`/courses/report`, { params: { status } });

export const getCourseParticipantsReportRequest = (id) =>
  axios.get(`/course/${id}/participants-report`);