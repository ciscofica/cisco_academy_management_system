import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBookOpen,
  faFlask,
  faClock,
  faSave,
  faPlus,
  faSpinner,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  addCourseChapterRequest,
  updateCourseChapterRequest,
} from "../../api/course";

export default function EditChapterModal({
  isOpen,
  onClose,
  courseId,
  chapter, // if null, create mode; if object, edit mode
  isCatalogTemplate = false,
  onSaved,
}) {
  const isEdit = Boolean(chapter);
  const [formData, setFormData] = useState({
    chapter_name: "",
    hours: "",
    main_topics: "",
    modality: "",
    activity: "",
    start_date: "",
    end_date: "",
    session_start_time: "",
    session_end_time: "",
    type: "teoria", // 'teoria' | 'lab'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter) {
      const isLab = (chapter.chapter_name || "")
        .toLowerCase()
        .includes("laboratorio");
      let dateVal = "";
      if (chapter.start_date) {
        try {
          dateVal = new Date(chapter.start_date).toISOString().split("T")[0];
        } catch {
          dateVal = "";
        }
      }
      let endDateVal = "";
      if (chapter.end_date) { try { endDateVal = new Date(chapter.end_date).toISOString().split("T")[0]; } catch { endDateVal = ""; } }
      setFormData({
        chapter_name: chapter.chapter_name || "",
        hours: chapter.hours ?? "",
        main_topics: chapter.main_topics || "",
        modality: chapter.modality || "",
        activity: chapter.activity || "",
        start_date: dateVal,
        end_date: endDateVal,
        session_start_time: chapter.session_start_time?.slice(0, 5) || "",
        session_end_time: chapter.session_end_time?.slice(0, 5) || "",
        type: isLab ? "lab" : "teoria",
      });
    } else {
      setFormData({
        chapter_name: "",
        hours: "",
        main_topics: "",
        modality: "",
        activity: "",
        start_date: "",
        end_date: "",
        session_start_time: "",
        session_end_time: "",
        type: "teoria",
      });
    }
  }, [chapter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapter_name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Debe ingresar el título o nombre del capítulo/laboratorio.",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        chapter_name: formData.chapter_name.trim(),
        hours: formData.hours === "" ? null : Number(formData.hours),
        main_topics: formData.main_topics?.trim() || null,
        modality: formData.modality || "Virtual",
        activity: formData.activity?.trim() || null,
        start_date: isCatalogTemplate ? null : (formData.start_date || null),
        end_date: isCatalogTemplate ? null : (formData.end_date || null),
        session_start_time: isCatalogTemplate ? null : (formData.session_start_time || null),
        session_end_time: isCatalogTemplate ? null : (formData.session_end_time || null),
      };

      if (isEdit) {
        await updateCourseChapterRequest(courseId, chapter.chapter_id, payload);
        Swal.fire({
          icon: "success",
          title: "Capítulo Actualizado",
          text: "El tema curricular ha sido actualizado en la base de datos.",
          confirmButtonColor: "#6cc24a",
        });
      } else {
        await addCourseChapterRequest(courseId, payload);
        Swal.fire({
          icon: "success",
          title: "Capítulo Agregado",
          text: "El nuevo capítulo fue incorporado al temario de esta edición.",
          confirmButtonColor: "#6cc24a",
        });
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error al guardar capítulo:", err);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.response?.data?.message || "No se pudo guardar el capítulo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => {
      let name = prev.chapter_name;
      if (newType === "lab" && !name.toLowerCase().includes("laboratorio")) {
        name = name ? `Laboratorio: ${name}` : "Laboratorio Capítulo ";
      }
      return {
        ...prev,
        type: newType,
        chapter_name: name,
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
              <FontAwesomeIcon icon={isEdit ? faBookOpen : faPlus} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEdit ? "Editar Módulo / Capítulo" : "Agregar Nuevo Capítulo"}
              </h2>
              <p className="text-xs text-slate-500">
                {isCatalogTemplate ? "Temario base; fechas y horarios se definen en cada edición" : "Temario y calendario de esta edición NetAcad"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Contenido Curricular
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("teoria")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.type === "teoria"
                    ? "bg-blue-50 border-[#049fd9] text-[#005073]"
                    : "border-gray-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FontAwesomeIcon icon={faBookOpen} className="text-[#049fd9]" />
                Módulo Teórico
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("lab")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.type === "lab"
                    ? "bg-[#edf7e6] border-[#6cc24a] text-[#3a8c25]"
                    : "border-gray-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FontAwesomeIcon icon={faFlask} className="text-[#3a8c25]" />
                Sesión de Laboratorio
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título o Nombre del Capítulo *
            </label>
            <input
              type="text"
              placeholder="Ej: Network Layer o Laboratorio Capítulos 1 y 2"
              value={formData.chapter_name}
              onChange={(e) =>
                setFormData({ ...formData, chapter_name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              required
            />
          </div>

          <div className={`grid ${isCatalogTemplate ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faClock} className="mr-1 text-slate-400" />
                Horas
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modalidad
              </label>
              <select
                value={formData.modality}
                onChange={(e) =>
                  setFormData({ ...formData, modality: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              >
                <option value="">Seleccionar modalidad</option>
                <option value="Virtual">Virtual</option>
                <option value="Presencial">Presencial</option>
                <option value="Presencial con instructor">Presencial con instructor</option>
                <option value="Híbrido">Híbrido</option>
                <option value="On-line">On-line</option>
              </select>
            </div>

            {!isCatalogTemplate && <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-slate-400" />
                Fecha de la sesión
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-2 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#6cc24a]"
              />
            </div>}
          </div>

          {!isCatalogTemplate && <>
          <p className="-mt-2 text-[11px] text-slate-500">La fecha de la sesión es el día que aparecerá en el cronograma. Use fecha final solo si el módulo ocupa varios días; déjela vacía para una sesión de un día.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="text-xs font-semibold text-slate-700">Fecha final (si aplica)<input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="mt-1 w-full px-2 py-2 rounded-xl border border-gray-300 text-xs" /></label>
            <label className="text-xs font-semibold text-slate-700">Hora inicio<input type="time" value={formData.session_start_time} onChange={(e) => setFormData({ ...formData, session_start_time: e.target.value })} className="mt-1 w-full px-2 py-2 rounded-xl border border-gray-300 text-xs" /></label>
            <label className="text-xs font-semibold text-slate-700">Hora fin<input type="time" value={formData.session_end_time} onChange={(e) => setFormData({ ...formData, session_end_time: e.target.value })} className="mt-1 w-full px-2 py-2 rounded-xl border border-gray-300 text-xs" /></label>
          </div>
          </>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actividad / Laboratorio / Evaluación
            </label>
            <input
              type="text"
              placeholder="Ej: Práctica Packet Tracer 1.1 o Examen de Módulo"
              value={formData.activity}
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Temas Principales / Subtemas del Módulo
            </label>
            <textarea
              rows={4}
              placeholder="Ingrese los subtemas desglosados (uno por línea o separados por salto de línea)..."
              value={formData.main_topics}
              onChange={(e) =>
                setFormData({ ...formData, main_topics: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#6cc24a] leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Estos subtemas se reflejarán directamente en la tabla oficial de la Planificación del Curso.
            </span>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FontAwesomeIcon
                icon={saving ? faSpinner : faSave}
                className={saving ? "animate-spin" : ""}
              />
              {saving ? "Guardando..." : isEdit ? "Actualizar Capítulo" : "Agregar Capítulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

