import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faGraduationCap,
  faSave,
  faDollarSign,
  faCheckCircle,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { updateParticipantAcademicRecordRequest } from "../../api/course";

export default function EditAcademicRecordModal({
  isOpen,
  onClose,
  courseId,
  participant,
  onSaved,
}) {
  const [grade, setGrade] = useState("");
  const [statusCode, setStatusCode] = useState("I");
  const [totalPayment, setTotalPayment] = useState(0.0);
  const [enrolled, setEnrolled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (participant) {
      const pivot = participant.CourseParticipant || {};
      setGrade(pivot.grade_final !== null && pivot.grade_final !== undefined ? String(pivot.grade_final) : "");
      setStatusCode(pivot.status_code || (pivot.approval ? "P" : "I"));
      setTotalPayment(pivot.total_payment !== null && pivot.total_payment !== undefined ? pivot.total_payment : participant.total_payment || 0.0);
      setEnrolled(pivot.enrolled !== undefined ? Boolean(pivot.enrolled) : Boolean(participant.enrolled));
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  const handleGradeChange = (val) => {
    setGrade(val);
    if (val !== "" && !isNaN(val)) {
      const num = parseFloat(val);
      if (num >= 70) {
        setStatusCode("P");
      } else {
        setStatusCode("F");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        grade_final: grade !== "" ? parseFloat(grade) : null,
        status_code: statusCode,
        approval: statusCode === "P",
        total_payment: parseFloat(totalPayment) || 0.0,
        enrolled: Boolean(enrolled),
      };

      await updateParticipantAcademicRecordRequest(courseId, participant.participant_id, payload);

      Swal.fire({
        icon: "success",
        title: "¡Récord Académico Actualizado!",
        text: "Las calificaciones y pagos de esta edición se guardaron exitosamente.",
        confirmButtonColor: "#6cc24a",
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.response?.data?.message || "No se pudo actualizar el récord académico.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Calificación y Matrícula NetAcad
              </h2>
              <p className="text-xs text-slate-500">
                Récord académico exclusivo de esta convocatoria
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
          {/* Student Info Box */}
          <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs">
            <p className="font-bold text-slate-800">{participant.name}</p>
            <p className="text-slate-500">
              CI: {participant.cid || participant.dni || "—"} | Tipo:{" "}
              {participant.ParticipantType?.name || "Particular"}
            </p>
          </div>

          {/* Grade Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Calificación Final NetAcad (Escala 0 a 100)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ej: 85.50 (deje vacío si aún está en curso)"
                value={grade}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Mínimo aprobatorio oficial Cisco NetAcad: 70 / 100 puntos.
            </span>
          </div>

          {/* Status Code Dropdown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado Académico
              </label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-gray-50"
              >
                <option value="I">En curso (Incompleto)</option>
                <option value="P">P - Aprobado (Pass)</option>
                <option value="F">F - Reprobado (Fail)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pago de esta Edición ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={totalPayment}
                onChange={(e) => setTotalPayment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              />
            </div>
          </div>

          {/* Enrollment Checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={enrolled}
                onChange={(e) => setEnrolled(e.target.checked)}
                className="rounded text-[#6cc24a] focus:ring-[#6cc24a] w-4 h-4"
              />
              <span>Matrícula confirmada formalmente en esta convocatoria</span>
            </label>
          </div>

          {/* Footer Actions */}
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
              disabled={submitting}
              className="px-5 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              {submitting ? "Guardando..." : "Guardar Calificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

