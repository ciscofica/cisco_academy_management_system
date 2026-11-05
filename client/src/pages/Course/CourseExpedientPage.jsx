import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCourseExpedientRequest,
  updateCourseEditionRequest,
  removeCourseParticipantRequest,
  reopenCourseEditionRequest,
  removeCourseChapterRequest,
  downloadCourseDocumentDocxRequest,
} from "../../api/course";
import { getInstructorsDropdownRequest } from "../../api/instructor";
import { getModalitiesDropdownRequest } from "../../api/modality";
import OfficialDocumentModal from "../../components/course/OfficialDocumentModal";
import EnrollParticipantModal from "../../components/course/EnrollParticipantModal";
import EditAcademicRecordModal from "../../components/course/EditAcademicRecordModal";
import CourseClosureValidationModal from "../../components/course/CourseClosureValidationModal";
import EditParticipantProfileModal from "../../components/course/EditParticipantProfileModal";
import EditChapterModal from "../../components/course/EditChapterModal";
import ValidatePaymentModal from "../../components/course/ValidatePaymentModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faChalkboardTeacher,
  faLaptop,
  faClock,
  faUsers,
  faFolderOpen,
  faFileAlt,
  faFileInvoice,
  faClipboardCheck,
  faFileContract,
  faFilePdf,
  faFileSignature,
  faChartBar,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faSpinner,
  faGraduationCap,
  faDollarSign,
  faBookOpen,
  faListOl,
  faEdit,
  faTimes,
  faSave,
  faSearch,
  faUserPlus,
  faTrashAlt,
  faEye,
  faMoneyBillWave,
  faFilter,
  faLock,
  faShieldAlt,
  faFlask,
  faPlus,
  faUserEdit,
  faCity,
  faBuilding,
  faFileInvoiceDollar,
  faFileWord,
} from "@fortawesome/free-solid-svg-icons";

function CourseExpedientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chapters"); // 'chapters' | 'documents' | 'participants'

  // Modal de edición de parámetros de la edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instructorsList, setInstructorsList] = useState([]);
  const [modalitiesList, setModalitiesList] = useState([]);

  // Modales operativos
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedParticipantForEdit, setSelectedParticipantForEdit] = useState(null);
  const [selectedParticipantForProfileEdit, setSelectedParticipantForProfileEdit] = useState(null);
  const [selectedParticipantForPayment, setSelectedParticipantForPayment] = useState(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [selectedChapterForEdit, setSelectedChapterForEdit] = useState(null);

  // Filtros y búsquedas en pestañas
  const [chapterSearchTerm, setChapterSearchTerm] = useState("");
  const [participantSearchTerm, setParticipantSearchTerm] = useState("");
  const [participantFilter, setParticipantFilter] = useState("all"); // 'all' | 'enrolled' | 'pending_payment' | 'approved'
  const [editForm, setEditForm] = useState({
    course_name: "",
    instructor_id: "",
    modality_id: "",
    status: "Planificado",
    start_date: "",
    end_date: "",
    start_registration_date: "",
    end_registration_date: "",
    total_hours: 70,
    instructor_hours: 50,
    activities_hours: 20,
    cost_per_hour: "13.00",
  });

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

  const handleOpenEditModal = async () => {
    try {
      const [insRes, modRes] = await Promise.all([
        getInstructorsDropdownRequest().catch(() => ({ data: { instructors: [] } })),
        getModalitiesDropdownRequest().catch(() => ({ data: { modalities: [] } })),
      ]);

      const insList = Array.isArray(insRes.data)
        ? insRes.data
        : insRes.data?.instructors || [];
      const modList = Array.isArray(modRes.data)
        ? modRes.data
        : modRes.data?.modalities || [];

      setInstructorsList(insList);
      setModalitiesList(modList);

      const detail = course.Detail || {};
      const currentModality =
        detail.Modalities && detail.Modalities.length > 0
          ? String(detail.Modalities[0].modality_id)
          : "";

      setEditForm({
        course_name: course.course_name || "",
        instructor_id: detail.instructor_id ? String(detail.instructor_id) : "",
        modality_id: currentModality,
        status: course.status || "Planificado",
        start_date: course.start_date ? course.start_date.split("T")[0] : "",
        end_date: course.end_date ? course.end_date.split("T")[0] : "",
        start_registration_date: course.start_registration_date
          ? course.start_registration_date.split("T")[0]
          : "",
        end_registration_date: course.end_registration_date
          ? course.end_registration_date.split("T")[0]
          : "",
        total_hours: detail.total_hours || 70,
        instructor_hours: detail.instructor_hours || 50,
        activities_hours: detail.activities_hours || 20,
        cost_per_hour: detail.cost_per_hour || "13.00",
      });
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Error al cargar datos para edición:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdition = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...editForm,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        start_registration_date: editForm.start_registration_date || null,
        end_registration_date: editForm.end_registration_date || null,
        instructor_id: editForm.instructor_id ? Number(editForm.instructor_id) : null,
        modality_id: editForm.modality_id ? Number(editForm.modality_id) : null,
      };
      const res = await updateCourseEditionRequest(id, payload);
      await loadExpedient();
      setIsEditModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "¡Configuración actualizada!",
        text: "Los datos operativos de la edición se guardaron exitosamente.",
        confirmButtonColor: "#6cc24a",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: err.response?.data?.message || "No se pudo actualizar la edición.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantId, participantName) => {
    const result = await Swal.fire({
      title: "¿Retirar estudiante?",
      text: `¿Está seguro de retirar a "${participantName}" de esta convocatoria?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, retirar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await removeCourseParticipantRequest(id, participantId);
        await loadExpedient();
        Swal.fire({
          icon: "success",
          title: "Estudiante retirado",
          text: "El estudiante ya no forma parte de esta edición.",
          confirmButtonColor: "#6cc24a",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "No se pudo retirar al estudiante.",
        });
      }
    }
  };

  const handleReopenEdition = async () => {
    const result = await Swal.fire({
      title: "¿Reabrir expediente?",
      text: "El curso volverá al estado 'En ejecución' para permitir rectificaciones académicas.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#049fd9",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Sí, Reabrir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await reopenCourseEditionRequest(id);
        await loadExpedient();
        Swal.fire({
          icon: "success",
          title: "Expediente Reabierto",
          text: "El curso se encuentra nuevamente en ejecución.",
          confirmButtonColor: "#6cc24a",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo reabrir el expediente.",
        });
      }
    }
  };

  const handleOpenAddChapter = () => {
    setSelectedChapterForEdit(null);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (ch) => {
    setSelectedChapterForEdit(ch);
    setIsChapterModalOpen(true);
  };

  const handleRemoveChapter = async (chapterId, chapterName) => {
    const result = await Swal.fire({
      title: "¿Retirar capítulo?",
      text: `¿Está seguro de desvincular "${chapterName}" de esta edición?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, retirar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await removeCourseChapterRequest(id, chapterId);
        Swal.fire({
          icon: "success",
          title: "Capítulo retirado",
          text: `"${chapterName}" fue desvinculado del temario.`,
          confirmButtonColor: "#6cc24a",
        });
        loadExpedient();
      } catch (err) {
        console.error("Error al retirar capítulo:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "No se pudo retirar el capítulo.",
        });
      }
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

  const [downloadingDocxId, setDownloadingDocxId] = useState(null);

  const handleDirectDownloadDocx = async (docId) => {
    try {
      setDownloadingDocxId(docId);
      const response = await downloadCourseDocumentDocxRequest(id, docId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (course?.course_name || "Curso").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${docId}_${cleanName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        icon: "success",
        title: "¡Documento Word Generado!",
        text: "El archivo editable se ha descargado correctamente (.docx).",
        confirmButtonColor: "#6cc24a",
        timer: 3000,
      });
    } catch (err) {
      console.error("Error al descargar DOCX:", err);
      Swal.fire({
        icon: "error",
        title: "Error al exportar",
        text: err.response?.data?.message || "No se pudo generar el archivo DOCX.",
      });
    } finally {
      setDownloadingDocxId(null);
    }
  };

  const documents = [
    {
      id: "planificacion",
      name: "Planificación de Curso",
      desc: "Estructura reglamentaria de 10 puntos, contenidos, honorarios y carga horaria oficial",
      icon: faClipboardCheck,
      status: "Disponible",
      hasDocx: true,
    },
    {
      id: "cronograma",
      name: "Cronograma de Actividades",
      desc: "Distribución de sesiones síncronas, prácticas en Lab #4 y evaluaciones NetAcad",
      icon: faCalendarAlt,
      status: "Disponible",
      hasDocx: true,
    },
    {
      id: "informe",
      name: "Informe Final del Curso",
      desc: "Memorando de cierre a Decanatura, nómina de participantes y balance financiero",
      icon: faFilePdf,
      status: "Disponible",
      hasDocx: true,
    },
    {
      id: "formulario",
      name: "Formulario de Inscripción",
      desc: "Ficha de datos y registro de participantes",
      icon: faFileAlt,
      status: "Disponible",
    },
    {
      id: "facturacion",
      name: "Reporte de Facturación",
      desc: "Comprobantes y validación de cobros UTN",
      icon: faFileInvoice,
      status: "Disponible",
    },
    {
      id: "calificaciones",
      name: "Tabulador de Calificaciones",
      desc: "Checkpoints, PTSA, examen práctico y final",
      icon: faChartBar,
      status: "Disponible",
    },
    {
      id: "memo_planificacion",
      name: "Memorando de Planificación",
      desc: "Documento oficial remitido a Decanato para apertura de curso",
      icon: faFileContract,
      status: "Disponible",
      hasDocx: true,
    },
    {
      id: "memo_cierre",
      name: "Memorando de Cierre",
      desc: "Solicitud de pago de honorarios docentes y entrega de certificados",
      icon: faFileSignature,
      status: "Disponible",
      hasDocx: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#049fd9] text-3xl animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Cargando expediente del curso...</p>
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
  const participants = course.Participants || [];
  const chapters = course.Chapters || [];
  const statusStyle = statusConfig[course.status] || statusConfig.Planificado;

  const totalHours = Number(detail.total_hours) || 70;
  const instructorHours = Number(detail.instructor_hours) || 50;
  const autonomousHours = Number(detail.activities_hours) || 20;
  const costPerHour = Number(detail.cost_per_hour) || 13.0;
  const estimatedTeacherPay = (instructorHours * costPerHour).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/courses")}
            className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver a la lista de cursos
          </button>

          <div className="flex items-center gap-3">
            {course.status !== "Finalizado" ? (
              <button
                onClick={() => setIsClosureModalOpen(true)}
                className="px-4 py-2 bg-[#005073] hover:bg-[#003d57] text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faLock} />
                Finalizar y Cerrar Curso
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-gray-100 text-slate-700 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <FontAwesomeIcon icon={faLock} className="text-slate-500" />
                  Expediente Sellado (Solo Lectura)
                </span>
                <button
                  onClick={handleReopenEdition}
                  title="Reabrir temporalmente para rectificaciones académicas"
                  className="text-xs text-slate-400 hover:text-[#049fd9] underline font-medium"
                >
                  Reabrir
                </button>
              </div>
            )}

            <button
              onClick={handleOpenEditModal}
              disabled={course.status === "Finalizado"}
              className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${
                course.status === "Finalizado"
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white border-gray-300 text-slate-700 hover:bg-gray-50 hover:border-[#049fd9] hover:text-[#005073]"
              }`}
            >
              <FontAwesomeIcon
                icon={faEdit}
                className={course.status === "Finalizado" ? "text-gray-400" : "text-[#049fd9]"}
              />
              Editar configuración
            </button>
          </div>
        </div>

        {/* Read-Only Banner when Finalized */}
        {course.status === "Finalizado" && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#6cc24a] flex-shrink-0">
                <FontAwesomeIcon icon={faShieldAlt} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6cc24a]">
                  Expediente Clausurado y Auditado (Modo Solo Lectura)
                </p>
                <p className="text-xs text-slate-300">
                  Esta edición completó formalmente sus horas académicas y el 100% de calificaciones NetAcad. El expediente está sellado para fines de acreditación universitaria y emisión de actas oficiales.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("documents")}
              className="px-4 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
            >
              Ver Actas Oficiales
            </button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#005073] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <FontAwesomeIcon icon={faFolderOpen} className="text-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {course.course_name}
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                  <span>Expediente Edición #{course.course_id}</span>
                  {course.TemplateCourse && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#049fd9] border border-blue-200 font-semibold">
                        <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                        Plantilla origen: {course.TemplateCourse.course_name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                {course.status}
              </span>
            </div>
          </div>
        </div>

        {/* General Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 relative group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Cronograma de clases</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {formatDate(course.start_date)}
                </p>
                <p className="text-[11px] text-slate-400">al {formatDate(course.end_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 relative group">
            <button
              onClick={handleOpenEditModal}
              title={instructor ? "Cambiar instructor" : "Asignar instructor"}
              className="absolute top-2 right-2 text-slate-400 hover:text-[#005073] text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  instructor
                    ? "bg-[#005073] text-white"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                <FontAwesomeIcon icon={faChalkboardTeacher} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">Docente de la edición</p>
                {instructor ? (
                  <>
                    <p className="text-sm font-bold text-slate-800">{instructor.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {instructor.email || "Docente activo"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-amber-700 mt-0.5">
                      Pendiente de designación
                    </p>
                    <button
                      onClick={handleOpenEditModal}
                      className="text-[11px] text-[#049fd9] hover:underline font-semibold block mt-0.5"
                    >
                      + Designar docente
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 relative group">
            <button
              onClick={handleOpenEditModal}
              title="Cambiar modalidad"
              className="absolute top-2 right-2 text-slate-300 hover:text-[#3a8c25] text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faLaptop} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Modalidad</p>
                <p className="text-sm font-bold text-slate-800">
                  {modalities.length > 0 ? modalities.map((m) => m.name).join(", ") : "No especificada"}
                </p>
                <p className="text-[11px] text-slate-400">Configuración activa</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Honorarios docentes</p>
                <p className="text-sm font-bold text-slate-800">
                  ${estimatedTeacherPay} USD
                </p>
                <p className="text-[11px] text-slate-400">
                  {instructor
                    ? `${instructorHours}h x $${costPerHour.toFixed(2)}/h`
                    : `Presupuesto ($${costPerHour.toFixed(2)}/h)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Breakdown Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Carga Horaria y Planificación Académica Oficial
                </h3>
                <p className="text-xs text-slate-500">
                  Estructura conforme al documento oficial de planificación CISCO UTN
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-slate-500">Horas Totales</p>
                <p className="text-base font-bold text-slate-800">{totalHours}h</p>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <p className="text-xs text-slate-500">Con Instructor</p>
                <p className="text-base font-bold text-[#005073]">{instructorHours}h</p>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <p className="text-xs text-slate-500">Autónomas / NetAcad</p>
                <p className="text-base font-bold text-[#049fd9]">{autonomousHours}h</p>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <p className="text-xs text-slate-500">Módulos en Temario</p>
                <p className="text-base font-bold text-[#6cc24a]">{chapters.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "chapters"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faListOl} />
            Temario del Curso ({chapters.length} Módulos)
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "documents"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
            Expediente Documental ({documents.length})
          </button>

          <button
            onClick={() => setActiveTab("participants")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "participants"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} />
            Participantes y Matrícula ({participants.length})
          </button>
        </div>

        {/* Tab 1: Chapters / Syllabus */}
        {activeTab === "chapters" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Temario Oficial y Capítulos Asignados
                </h2>
                <p className="text-xs text-slate-500">
                  {chapters.length > 0
                    ? `Esta edición cuenta con ${chapters.length} contenidos curriculares y sesiones de laboratorio asignadas.`
                    : "No se encontraron capítulos asociados a esta edición."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#edf7e6] text-[#3a8c25] border border-green-200">
                  {chapters.length} Contenidos Oficiales
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#049fd9] border border-blue-200">
                  {chapters.reduce((acc, c) => acc + (Number(c.hours) || 0), 0)}h Registradas
                </span>
                {course.status !== "Finalizado" && (
                  <button
                    onClick={handleOpenAddChapter}
                    className="px-3 py-1.5 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Capítulo / Lab
                  </button>
                )}
              </div>
            </div>

            {/* Chapter Search Bar */}
            {chapters.length > 0 && (
              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-3 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Buscar módulo por nombre o número en el temario..."
                  value={chapterSearchTerm}
                  onChange={(e) => setChapterSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6cc24a] bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            )}

            {chapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {chapters
                  .filter((ch) =>
                    (ch.chapter_name || "")
                      .toLowerCase()
                      .includes(chapterSearchTerm.toLowerCase())
                  )
                  .map((ch, idx) => {
                    const isLab = (ch.chapter_name || "")
                      .toLowerCase()
                      .includes("laboratorio");
                    return (
                      <div
                        key={ch.chapter_id || idx}
                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl hover:bg-white hover:border-[#049fd9] hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                              isLab
                                ? "bg-[#edf7e6] text-[#3a8c25] border-green-200"
                                : "bg-blue-50 text-[#005073] border-blue-200"
                            }`}
                          >
                            <FontAwesomeIcon icon={isLab ? faFlask : faBookOpen} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                              {ch.chapter_name}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>{ch.hours ? `${ch.hours} horas` : "2 horas"}</span>
                              <span>•</span>
                              <span className={isLab ? "text-[#3a8c25] font-medium" : "text-[#005073] font-medium"}>
                                {isLab ? "Práctica de Laboratorio" : "Módulo Teórico"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {course.status !== "Finalizado" && (
                            <>
                              <button
                                onClick={() => handleOpenEditChapter(ch)}
                                title="Editar nombre u horas"
                                className="text-slate-400 hover:text-[#049fd9] p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleRemoveChapter(ch.chapter_id, ch.chapter_name)}
                                title="Retirar de esta edición"
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors text-xs"
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            #{idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                <FontAwesomeIcon icon={faBookOpen} className="text-slate-300 text-3xl mb-2" />
                <p className="text-sm text-slate-500">No hay capítulos registrados para esta edición.</p>
                {course.status !== "Finalizado" && (
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={handleOpenAddChapter}
                      className="px-4 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Agregar Primer Capítulo / Lab
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Document Expedient */}
        {activeTab === "documents" && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDocForPreview(doc)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-[#6cc24a] transition-all group cursor-pointer flex flex-col justify-between"
                  title="Haga clic para ver o imprimir el documento oficial"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-center group-hover:bg-[#edf7e6] group-hover:border-green-200 transition-colors">
                        <FontAwesomeIcon
                          icon={doc.icon}
                          className="text-slate-500 group-hover:text-[#6cc24a] transition-colors"
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          doc.status === "Disponible"
                            ? "bg-[#edf7e6] text-[#3a8c25] border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={doc.status === "Disponible" ? faCheckCircle : faHourglassHalf}
                          className="text-[10px]"
                        />
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{doc.name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{doc.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-[#049fd9] font-semibold group-hover:underline flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faEye} />
                      Ver documento
                    </span>
                    {doc.hasDocx && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectDownloadDocx(doc.id);
                        }}
                        disabled={downloadingDocxId === doc.id}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#005073]/10 hover:bg-[#005073] text-[#005073] hover:text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        title="Descargar versión Microsoft Word (.docx) editable"
                      >
                        <FontAwesomeIcon
                          icon={downloadingDocxId === doc.id ? faSpinner : faFileWord}
                          className={downloadingDocxId === doc.id ? "animate-spin" : ""}
                        />
                        Word (.docx)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Participants */}
        {activeTab === "participants" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Participantes y Control de Matrícula
                </h2>
                <p className="text-xs text-slate-500">
                  Estudiantes registrados en la convocatoria de esta edición
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6cc24a] hover:bg-[#5aad3a] rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  + Inscribir Estudiante
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-slate-500 font-medium">Registrados</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {participants.length}
                </p>
              </div>
              <div className="bg-[#edf7e6] rounded-xl p-4 border border-green-200">
                <p className="text-xs text-[#3a8c25] font-medium">Matriculados Oficiales</p>
                <p className="text-xl font-bold text-[#3a8c25] mt-1">
                  {
                    participants.filter((p) =>
                      Boolean(p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number)
                    ).length
                  }
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs text-[#005073] font-medium">Aprobados NetAcad</p>
                <p className="text-xl font-bold text-[#005073] mt-1">
                  {
                    participants.filter((p) =>
                      p.CourseParticipant?.approval !== undefined
                        ? p.CourseParticipant.approval
                        : p.approval
                    ).length
                  }
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-medium">Recaudación Cobros</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  $
                  {participants
                    .reduce((acc, p) => {
                      const val =
                        p.CourseParticipant?.total_payment !== null &&
                        p.CourseParticipant?.total_payment !== undefined
                          ? p.CourseParticipant.total_payment
                          : p.total_payment || 0;
                      return acc + (parseFloat(val) || 0);
                    }, 0)
                    .toFixed(2)}{" "}
                  <span className="text-xs font-normal">USD</span>
                </p>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-3 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre o cédula..."
                  value={participantSearchTerm}
                  onChange={(e) => setParticipantSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6cc24a] bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-1 text-xs self-start sm:self-auto overflow-x-auto">
                <span className="text-slate-400 mr-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                  Filtrar:
                </span>
                <button
                  onClick={() => setParticipantFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    participantFilter === "all"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todos ({participants.length})
                </button>
                <button
                  onClick={() => setParticipantFilter("enrolled")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    participantFilter === "enrolled"
                      ? "bg-[#6cc24a] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Matriculados (
                  {
                    participants.filter((p) =>
                      Boolean(p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number)
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setParticipantFilter("inscribed")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    participantFilter === "inscribed"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Solo Inscritos (
                  {
                    participants.filter((p) =>
                      !Boolean(p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number)
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setParticipantFilter("approved")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    participantFilter === "approved"
                      ? "bg-[#049fd9] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Aprobados (
                  {
                    participants.filter((p) =>
                      p.CourseParticipant?.approval !== undefined
                        ? p.CourseParticipant.approval
                        : p.approval
                    ).length
                  }
                  )
                </button>
              </div>
            </div>

            {/* Participants Table */}
            {participants.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Estudiante</th>
                      <th className="px-4 py-3">Cédula</th>
                      <th className="px-4 py-3">Carrera / Nivel</th>
                      <th className="px-4 py-3">Tipo / Empresa</th>
                      <th className="px-4 py-3 text-center">Matrícula</th>
                      <th className="px-4 py-3 text-center">Pago Convocatoria</th>
                      <th className="px-4 py-3 text-center">Rendimiento NetAcad</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants
                      .filter((p) => {
                        const term = participantSearchTerm.toLowerCase();
                        const matchSearch =
                          (p.name || "").toLowerCase().includes(term) ||
                          String(p.cid || "").includes(term) ||
                          (p.email || "").toLowerCase().includes(term) ||
                          (p.degree || "").toLowerCase().includes(term);
                        if (!matchSearch) return false;

                        const isEnr = Boolean(p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number);
                        const isApp =
                          p.CourseParticipant?.approval !== undefined
                            ? p.CourseParticipant.approval
                            : p.approval;

                        if (participantFilter === "enrolled") return isEnr;
                        if (participantFilter === "inscribed") return !isEnr;
                        if (participantFilter === "approved") return isApp;
                        return true;
                      })
                      .map((p) => {
                        const cp = p.CourseParticipant || {};
                        const pPayment =
                          cp.total_payment !== null && cp.total_payment !== undefined
                            ? cp.total_payment
                            : 0.0;
                        const pEnrolled = Boolean(cp.enrolled && cp.invoice_number);
                        const pApproved =
                          cp.approval !== undefined ? cp.approval : p.approval;
                        const pGrade = cp.grade_final;
                        const pStatusCode =
                          cp.status_code || (pApproved ? "P" : "I");

                        return (
                          <tr
                            key={p.participant_id}
                            className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#005073]/10 text-[#005073] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                  {p.name ? p.name.charAt(0) : "E"}
                                </div>
                                <div>
                                  <p className="line-clamp-1 text-slate-900 font-semibold">{p.name}</p>
                                  <p className="text-[11px] text-slate-400 font-normal">
                                    {p.email || (p.phone && p.phone !== "sin registro" ? p.phone : "Sin correo registrado")}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                              {p.cid || p.dni || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {p.degree ? (
                                <div>
                                  <span className="font-bold text-slate-700">{p.degree}</span>
                                  {p.degree_level ? (
                                    <span className="text-slate-400 ml-1">· Sem. {p.degree_level}</span>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No especificada</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 block w-fit mb-0.5">
                                {p.ParticipantType?.name || "Particular"}
                              </span>
                              {p.institution && p.institution !== "sin registro" && (
                                <span className="text-[11px] text-slate-500 block truncate max-w-[140px]" title={p.institution}>
                                  {p.institution}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  pEnrolled
                                    ? "bg-[#edf7e6] text-[#3a8c25] border-green-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={pEnrolled ? faCheckCircle : faHourglassHalf}
                                  className="text-[10px]"
                                />
                                {pEnrolled ? "Matriculado" : "Inscrito (Pendiente)"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-semibold text-slate-800 text-xs">
                                ${Number(pPayment).toFixed(2)} USD
                              </p>
                              {cp.invoice_number ? (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px] mt-0.5" title={`Validado: ${cp.validation_date || 'S/F'}`}>
                                  Fact: {cp.invoice_number}
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-600 font-medium block">
                                  Sin Factura
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {pGrade !== null && pGrade !== undefined ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    pStatusCode === "P"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : pStatusCode === "F"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-blue-50 text-[#049fd9] border-blue-200"
                                  }`}
                                >
                                  {parseFloat(pGrade).toFixed(1)} / 100 ({pStatusCode})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#049fd9] border border-blue-200">
                                  En curso (I)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setSelectedParticipantForPayment(p)}
                                title="Validar factura de cobro y matricular"
                                className="text-slate-500 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors mr-1"
                              >
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                              </button>
                              <button
                                onClick={() => setSelectedParticipantForEdit(p)}
                                title="Calificar rendimiento NetAcad"
                                className="text-slate-500 hover:text-[#049fd9] p-1.5 rounded-lg hover:bg-blue-50 transition-colors mr-1"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => setSelectedParticipantForProfileEdit(p)}
                                title="Editar ficha personal (carrera, correo, empresa)"
                                className="text-slate-500 hover:text-[#3a8c25] p-1.5 rounded-lg hover:bg-green-50 transition-colors mr-1"
                              >
                                <FontAwesomeIcon icon={faUserEdit} />
                              </button>
                              {course.status !== "Finalizado" && (
                                <button
                                  onClick={() =>
                                    handleRemoveParticipant(p.participant_id, p.name)
                                  }
                                  title="Retirar de esta edición"
                                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <FontAwesomeIcon icon={faUsers} className="text-slate-300 text-3xl mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  Aún no hay estudiantes matriculados en esta convocatoria.
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Puede matricular participantes de inmediato haciendo clic en el botón inferior.
                </p>
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="px-4 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-semibold transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  + Inscribir Primer Estudiante
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/course/${id}/participants-report`)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#6cc24a] hover:bg-[#5aad3a] rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUsers} />
            Gestionar participantes
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Volver a la lista de cursos
          </button>
        </div>

        {/* ── Modal de Edición de Parámetros Operativos ── */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center">
                    <FontAwesomeIcon icon={faEdit} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Configuración Operativa de la Edición
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ajuste el docente, modalidad, fechas y honorarios de esta clase
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSaveEdition} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre o código oficial de la clase
                  </label>
                  <input
                    type="text"
                    name="course_name"
                    value={editForm.course_name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-sm focus:outline-none focus:border-[#6cc24a]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructor asignado
                    </label>
                    <select
                      name="instructor_id"
                      value={editForm.instructor_id}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-sm focus:outline-none focus:border-[#6cc24a]"
                    >
                      <option value="">— Sin docente asignado —</option>
                      {(Array.isArray(instructorsList) ? instructorsList : []).map((ins) => (
                        <option key={ins.instructor_id} value={ins.instructor_id}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modalidad
                    </label>
                    <select
                      name="modality_id"
                      value={editForm.modality_id}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-sm focus:outline-none focus:border-[#6cc24a]"
                    >
                      <option value="">— Seleccionar modalidad —</option>
                      {(Array.isArray(modalitiesList) ? modalitiesList : []).map((mod) => (
                        <option key={mod.modality_id} value={mod.modality_id}>
                          {mod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-sm focus:outline-none focus:border-[#6cc24a]"
                    >
                      <option value="Planificado">Planificado</option>
                      <option value="En inscripción">En inscripción</option>
                      <option value="En ejecución">En ejecución</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha inicio clases
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={editForm.start_date}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs focus:outline-none focus:border-[#6cc24a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha fin clases
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={editForm.end_date}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs focus:outline-none focus:border-[#6cc24a]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Carga Horaria y Tarifa Docente (Planificación UTN)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Horas Totales
                      </label>
                      <input
                        type="number"
                        name="total_hours"
                        value={editForm.total_hours}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Horas Docente
                      </label>
                      <input
                        type="number"
                        name="instructor_hours"
                        value={editForm.instructor_hours}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Horas Autónomas
                      </label>
                      <input
                        type="number"
                        name="activities_hours"
                        value={editForm.activities_hours}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Costo por hora ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost_per_hour"
                        value={editForm.cost_per_hour}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? "animate-spin" : ""} />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa Oficial de Documentos */}
        <OfficialDocumentModal
          isOpen={Boolean(selectedDocForPreview)}
          onClose={() => setSelectedDocForPreview(null)}
          documentType={selectedDocForPreview}
          course={course}
        />

        {/* Modal para Matricular Estudiantes en esta Edición */}
        <EnrollParticipantModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          courseId={id}
          onEnrolled={loadExpedient}
        />

        {/* Modal para Calificar y Registrar Pago NetAcad del Estudiante */}
        <EditAcademicRecordModal
          isOpen={Boolean(selectedParticipantForEdit)}
          onClose={() => setSelectedParticipantForEdit(null)}
          courseId={id}
          participant={selectedParticipantForEdit}
          onSaved={loadExpedient}
        />

        {/* Modal de Validación Previa y Cierre Auditable */}
        <CourseClosureValidationModal
          isOpen={isClosureModalOpen}
          onClose={() => setIsClosureModalOpen(false)}
          courseId={id}
          courseName={course?.course_name}
          onClosed={loadExpedient}
          onOpenGradeModal={(student) => {
            setSelectedParticipantForEdit(student);
          }}
        />

        {/* Modal de Edición de Ficha Personal de Estudiante */}
        <EditParticipantProfileModal
          isOpen={Boolean(selectedParticipantForProfileEdit)}
          onClose={() => setSelectedParticipantForProfileEdit(null)}
          participant={selectedParticipantForProfileEdit}
          onSaved={loadExpedient}
        />

        {/* Modal de Creación / Edición de Capítulo */}
        <EditChapterModal
          isOpen={isChapterModalOpen}
          onClose={() => setIsChapterModalOpen(false)}
          courseId={id}
          chapter={selectedChapterForEdit}
          onSaved={loadExpedient}
        />

        {/* Modal para Validar Factura y Promover a Matriculado */}
        <ValidatePaymentModal
          isOpen={Boolean(selectedParticipantForPayment)}
          onClose={() => setSelectedParticipantForPayment(null)}
          courseId={id}
          participant={selectedParticipantForPayment}
          onValidated={loadExpedient}
        />
      </div>
    </div>
  );
}

export default CourseExpedientPage;
