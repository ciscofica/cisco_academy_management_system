import { createContext, useContext, useState } from "react";
import Swal from "sweetalert2"; // Importa SweetAlert
import {
  getCoursesDropdownRequest,
  createCourseRequest,
  deleteCourseRequest,
  getAllCoursesRequest,
  getCoursesRequest,
  updateCourseRequest,
  // getCertificatesRequest
} from "../api/course";
import axios from "../api/axios.js";



const CourseContext = createContext();

export const useCourse = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [allcoursesforreport, setAllCoursesForReport] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const createCourse = async (course) => {
    try {
      const res = await createCourseRequest(course);
      // Aquí puedes actualizar el estado si lo deseas
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: res.data.message,
      });
      getCourses({ page: currentPage }); // Obtener la lista actualizada
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Ha ocurrido un error',
      });
      console.error(error);
    }

  };
  const updateCourse = async (course) => {
    try {
      const res = await updateCourseRequest(course);
      Swal.fire({ // Muestra el mensaje de éxito
        icon: 'success',
        title: 'Éxito',
        text: res.data.message,
      });
      // console.log(res);
      getCourses({ page: currentPage }); // Obtener la lista actualizada
    } catch (error) {
      console.log(error);
    }
  };
  const getCourses = async ({ search = '', page = 1, limit = 15 }) => {
    try {
      const res = await getCoursesRequest({ search, page, limit });
      setCourses(res.data.courses);
      // console.log(res.data.permissions);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };
  const getAllCourses = async ({ search = '', page = 1, limit = 1000 }) => {
    try {
      const res = await getAllCoursesRequest({ search, page, limit });
      setAllCoursesForReport(res.data.courses);
    } catch (error) {
      console.log(error);
    }
  };
  const getCoursesDropdown = async () => {
    try {
      const res = await getCoursesDropdownRequest();
      setCourses(res.data.courses);
    } catch (error) {
      console.log(error);
    }
  };
  const deleteCourses = async (id) => {
    try {
      await deleteCourseRequest(id);
      getCourses({ page: currentPage }); // Vuelve a obtener la lista actualizada
    } catch (error) {
      console.log(error);
    }
  };

  const downloadCertificates = async (id, params = {}) => {
    try {
      const response = await axios.get(`/courses-certificate/${id}`, {
        params,
        responseType: 'blob', // Necesario para manejar el PDF como un archivo binario
      });
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-curso-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error) {
      let message = 'El estado del curso debe ser "Finalizado" para emitir certificados.';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) message = parsed.message;
        } catch (_) {}
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'No se puede generar certificados',
        text: message,
      });
      return false;
    }
  };


  // downloadCertificates

  return (
    <CourseContext.Provider
      value={{
        courses,
        createCourse,
        updateCourse,
        getCourses,
        getAllCourses,
        deleteCourses,
        downloadCertificates,
        allcoursesforreport,
        totalPages,
        currentPage,
        setCurrentPage,
        getCoursesDropdown
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}
