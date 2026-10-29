import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useChapter } from "../../context/ChapterContext";
import RegisterChapterModal from "../Chapter/RegisterChapterModal";
import ChapterReportsModal from "./ChapterReportModal";

function ChapterPage() {
    const { getChapters, chapters, totalPages, currentPage, setCurrentPage, deleteChapter } = useChapter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState(null);

    useEffect(() => {
        getChapters({ search: searchTerm, page: currentPage });
    }, [searchTerm, currentPage]);

    console.log("------------")
    console.log(chapters);
    console.log("------------")

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEdit = (chapter) => {
        setSelectedChapter(chapter);
        setIsRegisterModalOpen(true);
    };

    const handleDelete = (chapterId) => {
        // const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este permiso?");
        // if (confirmDelete) {
        deleteChapter(chapterId); // Llama a la función de eliminación
        // }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen overflow-hidden">
            <div className="flex justify-between mb-6 gap-3 items-center">
                <input
                    type="text"
                    placeholder="Buscar capítulos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full md:w-1/3 p-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm"
                />
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setSelectedChapter(null);
                            setIsRegisterModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-sm font-medium transition-colors shadow-sm"
                    >
                        Registrar Capítulo
                    </button>
                    <button
                        onClick={() => setIsReportsModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-slate-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
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
                            <th scope="col" className="px-6 py-3">Horas</th>
                            <th scope="col" className="px-6 py-3">Fecha Inicio</th>
                            <th scope="col" className="px-6 py-3">Fecha Fin</th>
                            <th scope="col" className="px-6 py-3">Curso Relacionado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chapters.map((chapter) => (
                            <tr key={chapter.chapter_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                    {chapter.chapter_id}
                                </th>
                                <td className="px-6 py-4 text-slate-600">{chapter.chapter_name}</td>
                                <td className="px-6 py-4 text-slate-600">{chapter.hours}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(chapter.start_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(chapter.end_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {/* Mostrar los nombres de los cursos relacionados */}
                                    {chapter.Courses && chapter.Courses.length > 0 ? (
                                        <ul>
                                            {chapter.Courses.map((course) => (
                                                <li key={course.course_id}>{course.course_name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span>No hay cursos relacionados</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex space-x-3">
                                    <button className="text-[#049fd9] hover:text-[#0380b0] transition-colors">
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button className="text-amber-500 hover:text-amber-600 transition-colors" onClick={() => handleEdit(chapter)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600 transition-colors" onClick={() => handleDelete(chapter.chapter_id)}>
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

            <RegisterChapterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} chapter={selectedChapter} />
            <ChapterReportsModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} />
        </div >
    );
}

export default ChapterPage;
