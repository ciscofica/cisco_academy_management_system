import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseExpedientRequest } from "../../api/course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faChalkboardTeacher,
  faLaptop,
  faClock,
  faUsers,
  faUserCheck,
  faUserTimes,
  faFolderOpen,
  faFileAlt,
  faFileInvoice,
  faClipboardCheck,
  faFileContract,
  faFilePdf,
  faFileSignature,
  faChartBar,
  faCheckCircle,
  faHourglassHalf,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function CourseExpedientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExpedient();
  }, [id]);

  const loadExpedient = async () => {
    try {
      setLoading(true);
      const res = await getCourseExpedientRequest(id);
      setCourse(res.data.course);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el expediente del curso.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Planificado: { color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
    "En inscripción": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500" },
    "En ejecución": { color: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" },
    Finalizado: { color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-500" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const documents = [
    { name: "Planificación", icon: faClipboardCheck, status: "Pendiente" },
    { name: "Cronograma", icon: faCalendarAlt, status: "Pendiente" },
    { name: "Formulario de inscripción", icon: faFileAlt, status: "Pendiente" },
    { name: "Reporte de facturación", icon: faFileInvoice, status: "Pendiente" },
    { name: "Tabulador", icon: faChartBar, status: "Pendiente" },
    { name: "Informe final", icon: faFilePdf, status: "Pendiente" },
    { name: "Memorando de planificación", icon: faFileContract, status: "Pendiente" },
    { name: "Memorando de informe", icon: faFileSignature, status: "Pendiente" },
    { name: "Oficio de entrega", icon: faFileAlt, status: "Pendiente" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-red-600 text-3xl animate-spin mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Curso no encontrado."}</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  const detail = course.Detail || {};
  const instructor = detail.Instructor || null;
  const modalities = detail.Modalities || [];
  const schedules = detail.Schedules || [];
  const participants = course.Participants || [];
  const statusStyle = statusConfig[course.status] || statusConfig.Planificado;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate("/courses")}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a cursos
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg flex-shrink-0">
                <FontAwesomeIcon icon={faFolderOpen} className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  {course.course_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Expediente del curso · ID #{course.course_id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                {course.status}
              </span>
            </div>
          </div>
        </div>

        {/* General Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha inicio</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(course.start_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha fin</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(course.end_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {instructor ? instructor.name : "No asignado"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faLaptop} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Modalidad</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {modalities.length > 0 ? modalities.map(m => m.name).join(", ") : "No definida"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second row of info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total horas</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{detail.total_hours || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Registrados</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{detail.num_registered || participants.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserCheck} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Matriculados</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{detail.num_enrolled || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTimes} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reprobados</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{detail.num_failed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule info if available */}
        {schedules.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
              Horarios
            </h3>
            <div className="flex flex-wrap gap-2">
              {schedules.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                  {s.day}: {s.start_time} - {s.end_time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Document Expedient Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolderOpen} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Expediente Documental</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Documentos administrativos del curso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
                      <FontAwesomeIcon
                        icon={doc.icon}
                        className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.status}</p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={doc.status === "Disponible" ? faCheckCircle : faHourglassHalf}
                    className={`text-sm ${
                      doc.status === "Disponible"
                        ? "text-green-500"
                        : "text-yellow-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/course/${id}/participants-report`)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-600 rounded-lg hover:from-red-800 hover:to-red-700 shadow-sm transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUsers} />
            Ver participantes
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseExpedientPage;
