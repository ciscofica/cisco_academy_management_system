import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCourseTemplatesRequest,
  startCourseFromTemplateRequest,
} from "../../api/course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faBookOpen,
  faCalendarAlt,
  faClipboardList,
  faUserGraduate,
  faArrowLeft,
  faClock,
  faChalkboardTeacher,
  faLaptop,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

function StartCoursePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    template_course_id: "",
    period: "",
    start_date: "",
    end_date: "",
    status: "Planificado",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await getCourseTemplatesRequest();
      setTemplates(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los cursos base.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    const template = templates.find(
      (item) => String(item.course_id) === String(templateId)
    );
    setSelectedTemplate(template || null);
    setForm({ ...form, template_course_id: templateId });
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setForm({
      template_course_id: "",
      period: "",
      start_date: "",
      end_date: "",
      status: "Planificado",
    });
    setSelectedTemplate(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.template_course_id) {
      Swal.fire({ icon: "warning", title: "Curso requerido", text: "Debe seleccionar un curso base." });
      return;
    }
    if (!form.period) {
      Swal.fire({ icon: "warning", title: "Periodo requerido", text: "Debe ingresar el periodo del curso." });
      return;
    }
    if (!form.start_date || !form.end_date) {
      Swal.fire({ icon: "warning", title: "Fechas requeridas", text: "Debe ingresar las fechas de inicio y fin del curso." });
      return;
    }

    try {
      const res = await startCourseFromTemplateRequest(form);
      Swal.fire({
        icon: "success",
        title: "¡Curso iniciado!",
        text: res.data.message || "La edición del curso se creó correctamente.",
        confirmButtonColor: "#b91c1c",
      });
      resetForm();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo iniciar el curso desde plantilla.",
      });
    }
  };

  const statusColors = {
    Planificado: "bg-blue-100 text-blue-800",
    "En inscripción": "bg-yellow-100 text-yellow-800",
    "En ejecución": "bg-green-100 text-green-800",
    Finalizado: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/courses")}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver a cursos
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faPlayCircle} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Iniciar nuevo curso
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Cree una nueva edición de curso a partir de una plantilla base de la Academia Cisco UTN
              </p>
            </div>
          </div>

          {!loading && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                {templates.length} plantillas disponibles
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select template */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-700 dark:text-red-400 font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Seleccionar curso base
              </h2>
            </div>

            <select
              name="template_course_id"
              value={form.template_course_id}
              onChange={handleTemplateChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">— Seleccione un curso base —</option>
              {templates.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>

            {/* Template summary card */}
            {selectedTemplate && (
              <div className="mt-4 bg-gradient-to-r from-gray-50 to-red-50/30 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                    Resumen del curso seleccionado
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faBookOpen} className="text-gray-400 mt-1 text-sm" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nombre del curso</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedTemplate.course_name}</p>
                    </div>
                  </div>

                  {selectedTemplate.Detail && (
                    <>
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faClipboardList} className="text-gray-400 mt-1 text-sm" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Descripción</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {selectedTemplate.Detail.course_description || "Sin descripción"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faClock} className="text-gray-400 mt-1 text-sm" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total horas</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {selectedTemplate.Detail.total_hours || "—"} horas
                          </p>
                        </div>
                      </div>

                      {selectedTemplate.Detail.Instructor && (
                        <div className="flex items-start gap-3">
                          <FontAwesomeIcon icon={faChalkboardTeacher} className="text-gray-400 mt-1 text-sm" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {selectedTemplate.Detail.Instructor.name}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedTemplate.Detail.Modalities && selectedTemplate.Detail.Modalities.length > 0 && (
                        <div className="flex items-start gap-3">
                          <FontAwesomeIcon icon={faLaptop} className="text-gray-400 mt-1 text-sm" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Modalidad</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {selectedTemplate.Detail.Modalities.map(m => m.name).join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faClipboardList} className="text-gray-400 mt-1 text-sm" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Detail ID</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {selectedTemplate.detail_id || "Sin detalle asignado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Period and Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-700 dark:text-red-400 font-bold text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-gray-400" />
                Periodo y estado
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Periodo
                </label>
                <input
                  type="text"
                  name="period"
                  value={form.period}
                  onChange={handleChange}
                  placeholder="Ej: MAY-JUL2026"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Estado inicial
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="Planificado">Planificado</option>
                  <option value="En inscripción">En inscripción</option>
                  <option value="En ejecución">En ejecución</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Course dates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-700 dark:text-red-400 font-bold text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                Fechas del curso
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Fecha final
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Registration dates */}


          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Limpiar formulario
            </button>

            <button
              type="submit"
              className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 rounded-lg hover:from-red-800 hover:to-red-700 shadow-lg shadow-red-500/25 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlayCircle} />
              Iniciar curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartCoursePage;