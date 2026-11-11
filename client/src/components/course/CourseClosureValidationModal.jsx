import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faLock,
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faGraduationCap,
  faUserTie,
  faClock,
  faShieldAlt,
  faSpinner,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { validateCourseClosureRequest, closeCourseEditionRequest } from "../../api/course";

export default function CourseClosureValidationModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  onClosed,
  onOpenGradeModal,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [allowForce, setAllowForce] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadValidation();
    }
  }, [isOpen, courseId]);

  const loadValidation = async () => {
    try {
      setLoading(true);
      const res = await validateCourseClosureRequest(courseId);
      setData(res.data);
    } catch (err) {
      console.error("Error al validar cierre:", err);
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "No se pudieron comprobar los requisitos de cierre del curso.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirmClose = async () => {
    const isReady = data?.can_close || allowForce;
    if (!isReady) return;

    const confirmResult = await Swal.fire({
      title: "¿Confirmar Cierre Definitivo?",
      html: `
        <p class="text-sm text-slate-600 mb-2">
          Esta acción cambiará el estado de la edición a <strong>Finalizado</strong> y sellará el expediente para auditorías.
        </p>
        <p class="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          El expediente pasará a <strong>modo solo lectura</strong> y se habilitará la emisión de actas oficiales.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#005073",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Sí, Sellar y Finalizar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        setClosing(true);
        const res = await closeCourseEditionRequest(courseId, { force: allowForce });
        Swal.fire({
          icon: "success",
          title: "¡Expediente Sellado y Finalizado!",
          text: res.data.message || "El curso ha sido clausurado con éxito.",
          confirmButtonColor: "#6cc24a",
        });
        onClosed();
        onClose();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error al cerrar",
          text: err.response?.data?.message || "No se pudo finalizar la edición.",
        });
      } finally {
        setClosing(false);
      }
    }
  };

  const checks = data?.checks || {};
  const dates = checks.dates || {};
  const evals = checks.evaluations || {};
  const instructor = checks.instructor || {};
  const modality = checks.modality || {};
  const hours = checks.hours || {};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005073] text-white flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Panel de Validación Previa y Cierre Auditable
              </h2>
              <p className="text-xs text-slate-500">
                Auditoría reglamentaria UTN FICA antes de dar por finalizada la edición
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

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-3xl text-[#049fd9] animate-spin mb-3"
              />
              <p className="text-sm text-slate-500">
                Comprobando requisitos académicos y calificaciones...
              </p>
            </div>
          ) : (
            <>
              {/* Course Title Banner */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Edición a Clausurar:</p>
                  <p className="text-sm font-bold text-slate-800">{courseName}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#049fd9] border border-blue-200">
                  Estado: {data?.current_status || "En ejecución"}
                </span>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-3">
                {/* 1. Evaluations Check (BLOCKING) */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    evals.passed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          evals.passed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={evals.passed ? faCheckCircle : faExclamationTriangle}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          100% de Evaluaciones y Calificaciones Asentadas
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{evals.message}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Evaluados con nota: <strong>{evals.evaluated}</strong> de{" "}
                          <strong>{evals.total}</strong> estudiantes matriculados.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        evals.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {evals.passed ? "Cumplido" : "Bloqueante"}
                    </span>
                  </div>

                  {/* List of pending students if any */}
                  {!evals.passed && evals.pending_students?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-200/60 bg-white/60 p-3 rounded-lg text-xs space-y-2">
                      <p className="font-semibold text-red-900">
                        Estudiantes pendientes de nota final:
                      </p>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                        {evals.pending_students.map((st) => (
                          <div
                            key={st.participant_id}
                            className="flex items-center justify-between text-[11px] bg-red-50/40 p-1.5 rounded"
                          >
                            <span className="font-medium text-slate-800">
                              {st.name} {st.cid ? `(CI: ${st.cid})` : ""}
                            </span>
                            <button
                              onClick={() => {
                                onClose();
                                if (onOpenGradeModal) onOpenGradeModal(st);
                              }}
                              className="text-[#049fd9] hover:underline font-semibold flex items-center gap-1"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                              Calificar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Dates Check */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    dates.passed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          dates.passed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={dates.passed ? faCheckCircle : faCalendarAlt}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Periodo Académico y Calendario
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{dates.message}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        dates.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {dates.passed ? "Cumplido" : "Advertencia"}
                    </span>
                  </div>
                </div>

                {/* 3. Instructor and Modality */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    instructor.passed && modality.passed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          instructor.passed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={instructor.passed ? faCheckCircle : faUserTie}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Docente Titular y Modalidad Operativa
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {instructor.message} | {modality.message}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        instructor.passed && modality.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {instructor.passed && modality.passed ? "Cumplido" : "Requerido"}
                    </span>
                  </div>
                </div>

                {/* 4. Official Hours */}
                <div className="p-4 rounded-xl border bg-slate-50 border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#005073] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faClock} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Carga Horaria Reglamentaria
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{hours.message}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      70h Oficiales
                    </span>
                  </div>
                </div>
              </div>

              {/* Force closure override option for admins if not passing */}
              {!data?.can_close && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-amber-900">
                    <input
                      type="checkbox"
                      checked={allowForce}
                      onChange={(e) => setAllowForce(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>
                      Habilitar cierre forzado bajo responsabilidad administrativa (Registrará advertencia de auditoría).
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmClose}
            disabled={loading || closing || (!data?.can_close && !allowForce)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all ${
              data?.can_close || allowForce
                ? "bg-[#005073] hover:bg-[#003d57] text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FontAwesomeIcon icon={closing ? faSpinner : faLock} className={closing ? "animate-spin" : ""} />
            {closing ? "Clausurando..." : "Confirmar Cierre y Sellar Expediente"}
          </button>
        </div>
      </div>
    </div>
  );
}

