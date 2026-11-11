import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCourseTemplatesRequest,
  startCourseFromTemplateRequest,
} from "../../api/course";
import { getInstructorsDropdownRequest } from "../../api/instructor";
import { getModalitiesDropdownRequest } from "../../api/modality";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faBookOpen,
  faCalendarAlt,
  faClipboardList,
  faArrowLeft,
  faClock,
  faChalkboardTeacher,
  faLaptop,
  faInfoCircle,
  faGraduationCap,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

function StartCoursePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    template_course_id: searchParams.get("templateId") || "",
    class_code: "",
    period: "",
    instructor_id: "",
    modality_id: "",
    start_date: "",
    end_date: "",
    start_registration_date: "",
    end_registration_date: "",
    status: "Planificado",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tplRes, insRes, modRes] = await Promise.all([
        getCourseTemplatesRequest().catch(() => ({ data: [] })),
        getInstructorsDropdownRequest().catch(() => ({ data: { instructors: [] } })),
        getModalitiesDropdownRequest().catch(() => ({ data: { modalities: [] } })),
      ]);

      const tplList = Array.isArray(tplRes.data)
        ? tplRes.data
        : tplRes.data?.templates || tplRes.data?.courses || [];
      const insList = Array.isArray(insRes.data)
        ? insRes.data
        : insRes.data?.instructors || [];
      const modList = Array.isArray(modRes.data)
        ? modRes.data
        : modRes.data?.modalities || [];

      setTemplates(tplList);
      setInstructors(insList);
      setModalities(modList);

      const urlTplId = searchParams.get("templateId");
      if (urlTplId) {
        const found = tplList.find((t) => String(t.course_id) === String(urlTplId));
        if (found) {
          setSelectedTemplate(found);
          const shortName = found.course_name.includes("CCNA1")
            ? "UTN_CCNA1"
            : found.course_name.includes("CCNA2")
            ? "UTN_CCNA2"
            : found.course_name.includes("Python")
            ? "UTN_PYTHON"
            : found.course_name.includes("Linux")
            ? "UTN_LINUX"
            : `UTN_${found.course_name.substring(0, 8).toUpperCase().replace(/\s+/g, "_")}`;
          setForm((prev) => ({
            ...prev,
            template_course_id: String(found.course_id),
            class_code: shortName,
          }));
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del catálogo o instructores.",
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

    // Sugerir un código de clase basado en el curso
    let suggestedCode = "";
    if (template) {
      const shortName = template.course_name.includes("CCNA1")
        ? "UTN_CCNA1"
        : template.course_name.includes("CCNA2")
        ? "UTN_CCNA2"
        : template.course_name.includes("Python")
        ? "UTN_PYTHON"
        : template.course_name.includes("Linux")
        ? "UTN_LINUX"
        : `UTN_${template.course_name.substring(0, 8).toUpperCase().replace(/\s+/g, "_")}`;
      suggestedCode = form.period ? `${shortName}_${form.period}` : shortName;
    }

    setForm({
      ...form,
      template_course_id: templateId,
      class_code: suggestedCode,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let updatedForm = { ...form, [name]: value };

    // Si cambia el periodo, actualizar el código sugerido si no se ha personalizado
    if (name === "period" && selectedTemplate) {
      const shortName = selectedTemplate.course_name.includes("CCNA1")
        ? "UTN_CCNA1"
        : selectedTemplate.course_name.includes("CCNA2")
        ? "UTN_CCNA2"
        : selectedTemplate.course_name.includes("Python")
        ? "UTN_PYTHON"
        : `UTN_${selectedTemplate.course_name.substring(0, 8).toUpperCase().replace(/\s+/g, "_")}`;
      updatedForm.class_code = value ? `${shortName}_${value}` : shortName;
    }

    setForm(updatedForm);
  };

  const resetForm = () => {
    setForm({
      template_course_id: "",
      class_code: "",
      period: "",
      instructor_id: "",
      modality_id: "",
      start_date: "",
      end_date: "",
      start_registration_date: "",
      end_registration_date: "",
      status: "Planificado",
    });
    setSelectedTemplate(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.template_course_id) {
      Swal.fire({
        icon: "warning",
        title: "Curso requerido",
        text: "Debe seleccionar un curso base del catálogo.",
      });
      return;
    }
    if (!form.period) {
      Swal.fire({
        icon: "warning",
        title: "Periodo requerido",
        text: "Debe ingresar el periodo del curso (ej: ENE-MARZO2026).",
      });
      return;
    }
    if (!form.instructor_id) {
      Swal.fire({
        icon: "warning",
        title: "Instructor requerido",
        text: "Debe seleccionar el docente responsable que dictará esta convocatoria.",
      });
      return;
    }
    if (!form.modality_id) {
      Swal.fire({
        icon: "warning",
        title: "Modalidad requerida",
        text: "Debe seleccionar la modalidad de dictado (Presencial, Virtual o Híbrida).",
      });
      return;
    }
    if (!form.start_date || !form.end_date) {
      Swal.fire({
        icon: "warning",
        title: "Fechas requeridas",
        text: "Debe ingresar las fechas de inicio y fin del curso.",
      });
      return;
    }

    try {
      const payload = {
        template_course_id: form.template_course_id,
        period: form.period,
        class_code: form.class_code,
        instructor_id: form.instructor_id ? Number(form.instructor_id) : null,
        modality_ids: form.modality_id ? [Number(form.modality_id)] : [],
        start_date: form.start_date,
        end_date: form.end_date,
        start_registration_date: form.start_registration_date || null,
        end_registration_date: form.end_registration_date || null,
        status: form.status,
      };

      const res = await startCourseFromTemplateRequest(payload);
      Swal.fire({
        icon: "success",
        title: "¡Edición iniciada con éxito!",
        text: res.data.message || "La edición del curso se creó correctamente con su temario y detalle independiente.",
        confirmButtonColor: "#6cc24a",
      }).then(() => {
        navigate(`/course/${res.data.course.course_id}/expedient`);
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

  const detail = selectedTemplate?.Detail || null;
  const chaptersCount = selectedTemplate?.Chapters?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/courses")}
            className="text-slate-500 hover:text-slate-800 mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver a cursos
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#005073] flex items-center justify-center shadow-sm text-white">
              <FontAwesomeIcon icon={faPlayCircle} className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Lanzar Convocatoria / Iniciar Edición
              </h1>
              <p className="text-slate-500 text-sm">
                Seleccione un curso base del catálogo académico y configure la convocatoria para el periodo seleccionado.
              </p>
            </div>
          </div>

          {!loading && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#edf7e6] text-[#3a8c25] border border-green-200">
                <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                {templates.length} cursos disponibles en el catálogo oficial
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select template */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                1. Seleccionar curso base del catálogo
              </h2>
            </div>

            <select
              name="template_course_id"
              value={form.template_course_id}
              onChange={handleTemplateChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm font-medium"
            >
              <option value="">— Seleccione un curso del catálogo —</option>
              {(Array.isArray(templates) ? templates : []).map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>

            {/* Template academic summary card */}
            {selectedTemplate && (
              <div className="mt-4 bg-slate-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between gap-2 mb-3 border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-[#049fd9]" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Ficha curricular del curso de catálogo
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#049fd9] border border-blue-200 font-semibold">
                    Plantilla Oficial
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faBookOpen} className="text-[#005073] mt-1 text-sm" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Nombre del curso</p>
                      <p className="text-sm font-bold text-slate-800">{selectedTemplate.course_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faClock} className="text-[#049fd9] mt-1 text-sm" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Carga horaria</p>
                      <p className="text-sm font-bold text-slate-800">
                        {detail?.total_hours ?? "Sin definir"}{detail?.total_hours ? " horas totales" : ""}
                      </p>
                      {detail?.instructor_hours && (
                        <p className="text-[11px] text-slate-500">
                          ({detail.instructor_hours || "Sin definir"}h con docente + {detail.activities_hours ?? "Sin definir"}h autónomas)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[#6cc24a] mt-1 text-sm" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Temario / Módulos</p>
                      <p className="text-sm font-bold text-slate-800">
                        {chaptersCount > 0 ? `${chaptersCount} módulos académicos` : "Plan curricular base"}
                      </p>
                    </div>
                  </div>

                  {detail?.course_description && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <FontAwesomeIcon icon={faClipboardList} className="text-slate-400 mt-1 text-sm" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Descripción académica</p>
                        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                          {detail.course_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {detail?.participant_requeriment && (
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-slate-400 mt-1 text-sm" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Requisitos previos</p>
                        <p className="text-xs text-slate-700 mt-0.5">
                          {detail.participant_requeriment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Edition Assignment (Instructor, Modality, Class Code) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                2. Asignación de docente y modalidad para esta edición
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-[#005073]" />
                  Instructor Responsable
                </label>
                <select
                  name="instructor_id"
                  value={form.instructor_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm"
                  required
                >
                  <option value="">— Seleccione el docente responsable * —</option>
                  {(Array.isArray(instructors) ? instructors : []).map((ins) => (
                    <option key={ins.instructor_id} value={ins.instructor_id}>
                      {ins.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Seleccione quién impartirá las sesiones de esta convocatoria.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLaptop} className="text-[#049fd9]" />
                  Modalidad *
                </label>
                <select
                  name="modality_id"
                  value={form.modality_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm"
                  required
                >
                  <option value="">— Seleccione la modalidad de dictado * —</option>
                  {(Array.isArray(modalities) ? modalities : []).map((mod) => (
                    <option key={mod.modality_id} value={mod.modality_id}>
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTag} className="text-amber-500" />
                  Código oficial de la clase
                </label>
                <input
                  type="text"
                  name="class_code"
                  value={form.class_code}
                  onChange={handleChange}
                  placeholder="Ej: UTN_CCNA1_ENE-MAR2026-CUZME"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Identificador de curso para el aula NetAcad e informes.
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Period and Dates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                3. Periodo, cronograma y estado
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Periodo académico *
                </label>
                <input
                  type="text"
                  name="period"
                  value={form.period}
                  onChange={handleChange}
                  placeholder="Ej: ENE-MARZO2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha inicio de clases *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha final de clases *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Inicio de inscripciones
                </label>
                <input
                  type="date"
                  name="start_registration_date"
                  value={form.start_registration_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-700 text-xs focus:outline-none focus:border-[#6cc24a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Límite de inscripciones
                </label>
                <input
                  type="date"
                  name="end_registration_date"
                  value={form.end_registration_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-700 text-xs focus:outline-none focus:border-[#6cc24a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Estado inicial de la convocatoria
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-700 text-xs focus:outline-none focus:border-[#6cc24a]"
                >
                  <option value="Planificado">Planificado</option>
                  <option value="En inscripción">En inscripción</option>
                  <option value="En ejecución">En ejecución</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Limpiar formulario
            </button>

            <button
              type="submit"
              className="px-8 py-3 text-sm font-semibold text-white bg-[#6cc24a] hover:bg-[#5aad3a] rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlayCircle} />
              Iniciar Convocatoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartCoursePage;
