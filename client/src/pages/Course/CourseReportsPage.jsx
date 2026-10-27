import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursesReportRequest } from "../../api/course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChartBar,
  faFolderOpen,
  faFilter,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function CourseReportsPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = ["Todos", "Planificado", "En inscripción", "En ejecución", "Finalizado"];

  useEffect(() => {
    loadReport();
  }, [statusFilter]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getCoursesReportRequest(statusFilter);
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Planificado: "bg-blue-100 text-blue-700",
    "En inscripción": "bg-yellow-100 text-yellow-700",
    "En ejecución": "bg-green-100 text-green-700",
    Finalizado: "bg-gray-200 text-gray-700",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCourses = courses.filter((c) =>
    c.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: courses.length,
    planificado: courses.filter(c => c.status === "Planificado").length,
    ejecucion: courses.filter(c => c.status === "En ejecución").length,
    finalizado: courses.filter(c => c.status === "Finalizado").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate("/courses")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a cursos
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faChartBar} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Reporte de cursos
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Vista administrativa de cursos de la Academia Cisco UTN
              </p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total cursos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Planificados</p>
            <p className="text-2xl font-bold text-blue-600">{stats.planificado}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">En ejecución</p>
            <p className="text-2xl font-bold text-green-600">{stats.ejecucion}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Finalizados</p>
            <p className="text-2xl font-bold text-gray-600">{stats.finalizado}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-sm" />
              <div className="flex gap-1 flex-wrap">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setStatusFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === opt
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="text-red-600 text-2xl animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 dark:text-gray-500">No se encontraron cursos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Curso</th>
                    <th className="px-5 py-3.5 font-semibold">Fecha inicio</th>
                    <th className="px-5 py-3.5 font-semibold">Fecha fin</th>
                    <th className="px-5 py-3.5 font-semibold">Estado</th>
                    <th className="px-5 py-3.5 font-semibold">Instructor</th>
                    <th className="px-5 py-3.5 font-semibold">Modalidad</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Registrados</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Matriculados</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Reprobados</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredCourses.map((course) => {
                    const detail = course.Detail || {};
                    const instructor = detail.Instructor || null;
                    const modalities = detail.Modalities || [];

                    return (
                      <tr
                        key={course.course_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{course.course_name}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{formatDate(course.start_date)}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{formatDate(course.end_date)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[course.status] || "bg-gray-100 text-gray-600"}`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {instructor ? instructor.name : "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {modalities.length > 0 ? modalities[0].name : "—"}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          {detail.num_registered || "—"}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          {detail.num_enrolled || "—"}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300">
                          {detail.num_failed || "—"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => navigate(`/course/${course.course_id}/expedient`)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Ver expediente"
                          >
                            <FontAwesomeIcon icon={faFolderOpen} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseReportsPage;
