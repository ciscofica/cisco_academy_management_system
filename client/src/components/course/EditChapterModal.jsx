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
  onSaved,
}) {
  const isEdit = Boolean(chapter);
  const [formData, setFormData] = useState({
    chapter_name: "",
    hours: 2,
    type: "teoria", // 'teoria' | 'lab'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter) {
      const isLab = (chapter.chapter_name || "")
        .toLowerCase()
        .includes("laboratorio");
      setFormData({
        chapter_name: chapter.chapter_name || "",
        hours: chapter.hours || 2,
        type: isLab ? "lab" : "teoria",
      });
    } else {
      setFormData({
        chapter_name: "",
        hours: 2,
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
      if (isEdit) {
        await updateCourseChapterRequest(courseId, chapter.chapter_id, {
          chapter_name: formData.chapter_name.trim(),
          hours: Number(formData.hours) || 2,
        });
        Swal.fire({
          icon: "success",
          title: "Capítulo Actualizado",
          text: "El tema curricular ha sido actualizado en esta edición.",
          confirmButtonColor: "#6cc24a",
        });
      } else {
        await addCourseChapterRequest(courseId, {
          chapter_name: formData.chapter_name.trim(),
          hours: Number(formData.hours) || 2,
        });
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
                Temario oficial de la convocatoria NetAcad
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <FontAwesomeIcon icon={faClock} className="mr-1 text-slate-400" />
              Carga Horaria Asignada (Horas Académicas) *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Suma al cómputo total de horas presenciales o de laboratorio.
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

