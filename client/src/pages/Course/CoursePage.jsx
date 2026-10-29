import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrash,
  faCertificate,
  faFolderOpen,
  faPlayCircle,
  faChartBar,
  faBookOpen,
  faSearch,
  faClock,
  faGraduationCap,
  faLaptop,
  faNetworkWired,
  faCode,
  faShieldAlt,
  faMicrochip,
  faLaptopCode,
  faTimes,
  faListOl,
  faChalkboardTeacher,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useCourse } from "../../context/CourseContext";
import { getCourseTemplatesRequest } from "../../api/course";
import RegisterCourseModal from "../Course/RegisterCourseModal";
import ReportsModalityModal from "../Reports/ReportsModalityModal";
import CoursePreviewModal from "./CoursePreviewModal";

function CoursePage() {
  const {
    getCourses,
    courses,
    totalPages,
    currentPage,
    setCurrentPage,
    deleteCourses,
    downloadCertificates,
  } = useCourse();

  const navigate = useNavigate();

  // Tabs: 'editions' | 'catalog'
  const [activeTab, setActiveTab] = useState("editions");

  // State for Editions
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // State for Catalog
  const [templates, setTemplates] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);

  useEffect(() => {
    getCourses({ search: searchTerm, page: currentPage });
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await getCourseTemplatesRequest();
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.templates || res.data?.courses || [];
      setTemplates(list);
    } catch (err) {
      console.error("Error al cargar plantillas del catálogo:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

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
    deleteCourses(courseId);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailsModalOpen(true);
  };

  const handleDownloadCertificate = (courseId) => {
    downloadCertificates(courseId);
  };

  const handleOpenChapterModal = (template) => {
    setPreviewTemplate(template);
    setIsChapterModalOpen(true);
  };

  // Helper para asignar categorías e iconos estilo Cisco NetAcad
  const getCourseCategory = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("ccna") || lower.includes("ccnp") || lower.includes("network")) {
      return {
        name: "Redes y Conectividad",
        color: "bg-blue-50 text-[#049fd9] border-blue-200",
        icon: faNetworkWired,
      };
    }
    if (lower.includes("python") || lower.includes("javascript") || lower.includes("programaci")) {
      return {
        name: "Programación y Software",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: faCode,
      };
    }
    if (lower.includes("security") || lower.includes("cyber") || lower.includes("seguridad")) {
      return {
        name: "Ciberseguridad",
        color: "bg-red-50 text-red-600 border-red-200",
        icon: faShieldAlt,
      };
    }
    if (lower.includes("iot") || lower.includes("things") || lower.includes("analytics")) {
      return {
        name: "Internet de las Cosas (IoT)",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: faMicrochip,
      };
    }
    if (lower.includes("linux") || lower.includes("essentials")) {
      return {
        name: "Sistemas Operativos",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: faLaptopCode,
      };
    }
    return {
      name: "Academia Cisco",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: faBookOpen,
    };
  };

  const statusConfig = {
    Planificado: { color: "bg-blue-50 text-[#049fd9] border-blue-200", dot: "bg-[#049fd9]" },
    "En inscripción": { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    "En ejecución": { color: "bg-[#edf7e6] text-[#3a8c25] border-green-200", dot: "bg-[#6cc24a]" },
    Finalizado: { color: "bg-gray-100 text-slate-600 border-gray-200", dot: "bg-slate-400" },
  };

  const filteredTemplates = templates.filter((t) =>
    t.course_name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado del Módulo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gestión de Cursos Cisco Academy
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Catálogo oficial de planes de estudio y control operativo de ediciones activas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/course/start")}
              className="px-4 py-2.5 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] shadow-sm flex items-center gap-2 text-sm font-semibold transition-all hover:shadow"
            >
              <FontAwesomeIcon icon={faPlayCircle} />
              Iniciar nueva convocatoria
            </button>
            <button
              onClick={() => navigate("/courses/report")}
              className="px-4 py-2.5 rounded-xl text-slate-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faChartBar} />
              Reportes
            </button>
          </div>
        </div>

        {/* Pestañas Principales: Ediciones vs. Catálogo */}
        <div className="flex border-b border-gray-200 mb-6 gap-3">
          <button
            onClick={() => setActiveTab("editions")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "editions"
                ? "border-[#005073] text-[#005073]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            Ediciones Activas y Convocatorias ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "catalog"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faBookOpen} />
            Catálogo Oficial CISCO ({templates.length} Cursos)
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            VISTA 1: EDICIONES ACTIVAS (TABLA OPERATIVA)
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "editions" && (
          <div>
            <div className="flex justify-between mb-4 gap-3 items-center flex-wrap">
              <div className="relative w-full md:w-96">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Buscar edición por nombre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm shadow-sm"
                />
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Página {currentPage} de {totalPages || 1}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">ID</th>
                      <th scope="col" className="px-6 py-3.5">Edición / Nombre Oficial</th>
                      <th scope="col" className="px-6 py-3.5">Plantilla Base</th>
                      <th scope="col" className="px-6 py-3.5">Docente Asignado</th>
                      <th scope="col" className="px-6 py-3.5">Fechas de Clases</th>
                      <th scope="col" className="px-6 py-3.5">Estado</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => {
                      const statusStyle =
                        statusConfig[course.status] || statusConfig.Planificado;
                      const instructor = course.Detail?.Instructor || null;

                      return (
                        <tr
                          key={course.course_id}
                          className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                        >
                          <th scope="row" className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                            #{course.course_id}
                          </th>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{course.course_name}</p>
                            <span className="text-[11px] text-slate-400">
                              {course.Detail?.Modalities && course.Detail.Modalities.length > 0
                                ? course.Detail.Modalities.map((m) => m.name).join(", ")
                                : "Modalidad no definida"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {course.TemplateCourse ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#049fd9] border border-blue-200">
                                <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                                {course.TemplateCourse.course_name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {instructor ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#005073] text-white flex items-center justify-center text-xs font-bold">
                                  {instructor.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                  {instructor.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">
                              {new Date(course.start_date).toLocaleDateString()}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              al {new Date(course.end_date).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.color}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                              {course.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                className="w-8 h-8 rounded-lg bg-blue-50 text-[#049fd9] hover:bg-[#049fd9] hover:text-white transition-all flex items-center justify-center"
                                onClick={() => handleViewDetails(course)}
                                title="Previsualizar curso"
                              >
                                <FontAwesomeIcon icon={faEye} className="text-xs" />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg bg-[#edf7e6] text-[#3a8c25] hover:bg-[#6cc24a] hover:text-white transition-all flex items-center justify-center"
                                onClick={() => navigate(`/course/${course.course_id}/expedient`)}
                                title="Abrir expediente completo"
                              >
                                <FontAwesomeIcon icon={faFolderOpen} className="text-xs" />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center"
                                onClick={() => handleDownloadCertificate(course.course_id)}
                                title="Certificados"
                              >
                                <FontAwesomeIcon icon={faCertificate} className="text-xs" />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center"
                                onClick={() => handleEdit(course)}
                                title="Editar"
                              >
                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                onClick={() => handleDelete(course.course_id)}
                                title="Inactivar"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center items-center mt-6 space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    : "border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors"
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-slate-500">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    : "border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors"
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VISTA 2: CATÁLOGO OFICIAL CISCO (TARJETAS NETACAD)
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "catalog" && (
          <div>
            {/* Barra de Búsqueda y Filtros de Catálogo */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Buscar curso en el catálogo oficial..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition text-sm shadow-sm"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Mostrando {filteredTemplates.length} de {templates.length} cursos oficiales disponibles
              </div>
            </div>

            {/* Grid de Tarjetas Estilo Cisco NetAcad */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const category = getCourseCategory(template.course_name);
                const detail = template.Detail || null;
                const totalHours = detail?.total_hours || 70;
                const chaptersCount = template.Chapters?.length || 0;

                return (
                  <div
                    key={template.course_id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#6cc24a] transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${category.color}`}
                        >
                          <FontAwesomeIcon icon={category.icon} className="text-[11px]" />
                          {category.name}
                        </span>

                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Catálogo CISCO
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#005073] transition-colors leading-snug mb-2 line-clamp-2">
                        {template.course_name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {detail?.course_description ||
                          "Curso oficial del catálogo curricular de Cisco Networking Academy para la Universidad Técnica del Norte."}
                      </p>

                      {/* Métricas del Plan Curricular */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-gray-100">
                          <FontAwesomeIcon icon={faClock} className="text-[#049fd9]" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Carga horaria</p>
                            <p className="font-bold text-slate-800">{totalHours} Horas</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-gray-100">
                          <FontAwesomeIcon icon={faGraduationCap} className="text-[#6cc24a]" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Temario</p>
                            <p className="font-bold text-slate-800">
                              {chaptersCount > 0 ? `${chaptersCount} Módulos` : "Temario base"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer de Acciones de la Tarjeta */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleOpenChapterModal(template)}
                        className="text-xs font-semibold text-[#005073] hover:text-[#049fd9] transition-colors flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faListOl} />
                        Ver Temario ({chaptersCount})
                      </button>

                      <button
                        onClick={() => navigate(`/course/start?templateId=${template.course_id}`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6cc24a] hover:bg-[#5aad3a] transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faPlayCircle} />
                        Iniciar Convocatoria
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && !loadingTemplates && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <FontAwesomeIcon icon={faBookOpen} className="text-slate-300 text-4xl mb-3" />
                <p className="text-base font-bold text-slate-700">No se encontraron cursos en el catálogo</p>
                <p className="text-xs text-slate-400 mt-1">
                  Intenta con otro término de búsqueda o limpia el filtro.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MODAL DE TEMARIO DEL CURSO DE CATÁLOGO
        ═══════════════════════════════════════════════════════════════ */}
        {isChapterModalOpen && previewTemplate && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#049fd9] border border-blue-200">
                      Plan Curricular Oficial
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {previewTemplate.Detail?.total_hours || 70} Horas
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {previewTemplate.course_name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Módulos y capítulos académicos definidos para este curso en Cisco NetAcad
                  </p>
                </div>
                <button
                  onClick={() => setIsChapterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Lista de Capítulos */}
              <div className="p-6 overflow-y-auto max-h-[55vh] space-y-2.5">
                {previewTemplate.Chapters && previewTemplate.Chapters.length > 0 ? (
                  previewTemplate.Chapters.map((ch, idx) => (
                    <div
                      key={ch.chapter_id || idx}
                      className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl hover:bg-white hover:border-[#6cc24a] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {ch.chapter_name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {ch.hours ? `${ch.hours} horas estimadas` : "Carga horaria base"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#049fd9] border border-blue-100 flex-shrink-0">
                        Módulo {idx + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                    <FontAwesomeIcon icon={faBookOpen} className="text-slate-300 text-3xl mb-2" />
                    <p className="text-sm text-slate-500">
                      No hay capítulos específicos vinculados todavía a esta plantilla.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer con CTA */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cerrar temario
                </button>

                <button
                  onClick={() => {
                    setIsChapterModalOpen(false);
                    navigate(`/course/start?templateId=${previewTemplate.course_id}`);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6cc24a] hover:bg-[#5aad3a] transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faPlayCircle} />
                  Iniciar Convocatoria con este Temario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modales Existentes */}
        <RegisterCourseModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          course={selectedCourse}
        />
        <ReportsModalityModal
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
        />
        <CoursePreviewModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          course={selectedCourse}
        />
      </div>
    </div>
  );
}

export default CoursePage;
