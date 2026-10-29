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
    Planificado: { color: "bg-blue-50 text-[#049fd9] border-blue-200", dot: "bg-[#049fd9]" },
    "En inscripción": { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    "En ejecución": { color: "bg-[#edf7e6] text-[#3a8c25] border-green-200", dot: "bg-[#6cc24a]" },
    Finalizado: { color: "bg-gray-100 text-slate-600 border-gray-200", dot: "bg-slate-400" },
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#049fd9] text-3xl animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Curso no encontrado."}</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 bg-white border border-gray-300 text-slate-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate("/courses")}
          className="text-slate-500 hover:text-slate-800 mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a cursos
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#005073] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <FontAwesomeIcon icon={faFolderOpen} className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {course.course_name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha inicio</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(course.start_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha fin</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(course.end_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Instructor</p>
                <p className="text-sm font-semibold text-slate-800">
                  {instructor ? instructor.name : "No asignado"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faLaptop} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Modalidad</p>
                <p className="text-sm font-semibold text-slate-800">
                  {modalities.length > 0 ? modalities.map(m => m.name).join(", ") : "No definida"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second row of info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total horas</p>
                <p className="text-sm font-semibold text-slate-800">{detail.total_hours || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Registrados</p>
                <p className="text-sm font-semibold text-slate-800">{detail.num_registered || participants.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserCheck} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Matriculados</p>
                <p className="text-sm font-semibold text-slate-800">{detail.num_enrolled || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTimes} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Reprobados</p>
                <p className="text-sm font-semibold text-slate-800">{detail.num_failed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule info if available */}
        {schedules.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-slate-400" />
              Horarios
            </h3>
            <div className="flex flex-wrap gap-2">
              {schedules.map((s, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-gray-200 text-slate-700 text-xs font-medium rounded-full">
                  {s.day}: {s.start_time} - {s.end_time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Document Expedient Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#005073] flex items-center justify-center text-white shadow-sm">
              <FontAwesomeIcon icon={faFolderOpen} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Expediente Documental</h2>
              <p className="text-xs text-slate-500">Documentos administrativos del curso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-[#6cc24a] transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-center group-hover:bg-[#edf7e6] group-hover:border-green-200 transition-colors">
                      <FontAwesomeIcon
                        icon={doc.icon}
                        className="text-slate-500 group-hover:text-[#6cc24a] transition-colors"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.status}</p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={doc.status === "Disponible" ? faCheckCircle : faHourglassHalf}
                    className={`text-sm ${
                      doc.status === "Disponible"
                        ? "text-[#6cc24a]"
                        : "text-amber-400"
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
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#6cc24a] hover:bg-[#5aad3a] rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUsers} />
            Ver participantes
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseExpedientPage;
