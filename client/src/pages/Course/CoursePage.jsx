import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faCertificate, faFolderOpen, faPlayCircle, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { useCourse } from "../../context/CourseContext";
import RegisterCourseModal from "../Course/RegisterCourseModal";
import ReportsModalityModal from "../Reports/ReportsModalityModal";
import CoursePreviewModal from "./CoursePreviewModal";

function CoursePage() {
    const { getCourses, courses, totalPages, currentPage, setCurrentPage, deleteCourses, downloadCertificates } = useCourse();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getCourses({ search: searchTerm, page: currentPage });
    }, [searchTerm, currentPage]);

    console.log(courses);
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setIsRegisterModalOpen(true);
    };

    const handleDelete = (courseId) => {
        deleteCourses(courseId); // Llama a la función de inactivación
    };

    const handleViewDetails = (course) => {
        setSelectedCourse(course); // Selecciona el curso
        setIsDetailsModalOpen(true); // Abre el modal de detalles
    };

    const handleDownloadCertificate = (courseId) =>{
        downloadCertificates(courseId);
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen overflow-hidden">
            <div className="flex justify-start mb-6 gap-3 items-center">
                <input
                    type="text"
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full md:w-1/3 p-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm"
                />
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setSelectedCourse(null);
                            setIsRegisterModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-sm font-medium transition-colors shadow-sm"
                    >
                        Registrar Curso
                    </button>
                    <button
                        onClick={() => navigate("/course/start")}
                        className="px-4 py-2 rounded-xl text-white bg-[#005073] hover:bg-[#003d57] shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlayCircle} />
                        Iniciar nuevo curso
                    </button>
                    <button
                        onClick={() => navigate("/courses/report")}
                        className="px-4 py-2 rounded-xl text-slate-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faChartBar} />
                        Reportes
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-x-auto max-h-[600px] min-h-[600px]">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Fecha Inicio Curso</th>
                            <th scope="col" className="px-6 py-3">Fecha Fin Curso</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.course_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                    {course.course_id}
                                </th>
                                <td className="px-6 py-4 text-slate-600">{course.course_name}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(course.start_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(course.end_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-600">{course.status}</td>
                                <td className="px-6 py-4 flex space-x-3">
                                    <button className="text-[#049fd9] hover:text-[#0380b0] transition-colors" onClick={() => handleViewDetails(course)}>
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button className="text-amber-500 hover:text-amber-600 transition-colors" onClick={() => handleEdit(course)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="text-[#6cc24a] hover:text-[#5aad3a] transition-colors" onClick={() => navigate(`/course/${course.course_id}/expedient`)} title="Ver expediente">
                                        <FontAwesomeIcon icon={faFolderOpen} />
                                    </button>
                                    {/* <button className="text-purple-500 hover:text-purple-600 transition-colors" onClick={() => handleDownloadCertificate(course.id)}> */}
                                    <button className="text-purple-500 hover:text-purple-600 transition-colors" onClick={() => handleDownloadCertificate(course.course_id)}>
                                        <FontAwesomeIcon icon={faCertificate} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600 transition-colors" onClick={() => handleDelete(course.course_id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-6 space-x-3">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors'}`}
                >
                    Anterior
                </button>
                <span className="text-sm text-slate-500">Página {currentPage} de {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors'}`}
                >
                    Siguiente
                </button>
            </div>

            <RegisterCourseModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} course={selectedCourse} />
            <ReportsModalityModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} />
            <CoursePreviewModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} course={selectedCourse} />
        </div >
    );
}

export default CoursePage;
