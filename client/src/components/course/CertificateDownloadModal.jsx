import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCertificate,
  faDownload,
  faSpinner,
  faUserTie,
  faUniversity,
  faAward,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function CertificateDownloadModal({
  isOpen,
  onClose,
  course,
  onDownload,
}) {
  const [instructorName, setInstructorName] = useState("");
  const [instructorRole, setInstructorRole] = useState("Docente Instructor");
  const [coordName, setCoordName] = useState("MSc. Ludmila Starodub");
  const [coordRole, setCoordRole] = useState(
    "Analista de sistemas – Coordinadora Academia CISCO"
  );
  const [deanName, setDeanName] = useState("Magíster Catalina Ramírez");
  const [deanRole, setDeanRole] = useState("Decana FICA - UTN");
  const [rememberDefaults, setRememberDefaults] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      // 1. Instructor from course detail
      const inst = course.Detail?.Instructor?.name || "";
      setInstructorName(inst || "Docente Titular");
      setInstructorRole("Docente Instructor");

      // 2. Coordinadora (user specification: Ludmila Starodub, Cargo: Analista de sistemas – Coordinadora Academia CISCO)
      const savedCoord = localStorage.getItem("cisco_saved_coord_name");
      const savedCoordRole = localStorage.getItem("cisco_saved_coord_role");
      setCoordName(savedCoord || "MSc. Ludmila Starodub");
      setCoordRole(
        savedCoordRole || "Analista de sistemas – Coordinadora Academia CISCO"
      );

      // 3. Decana (institutionally variable)
      const savedDean = localStorage.getItem("cisco_saved_dean_name");
      const savedDeanRole = localStorage.getItem("cisco_saved_dean_role");
      setDeanName(savedDean || "Magíster Catalina Ramírez");
      setDeanRole(savedDeanRole || "Decana FICA - UTN");
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const isFinalized = course.status === "Finalizado";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (rememberDefaults) {
      if (deanName) localStorage.setItem("cisco_saved_dean_name", deanName.trim());
      if (deanRole) localStorage.setItem("cisco_saved_dean_role", deanRole.trim());
      if (coordName) localStorage.setItem("cisco_saved_coord_name", coordName.trim());
      if (coordRole) localStorage.setItem("cisco_saved_coord_role", coordRole.trim());
    }

    const params = {
      instructor_name: instructorName.trim(),
      instructor_role: instructorRole.trim(),
      coordinator_name: coordName.trim(),
      coordinator_role: coordRole.trim(),
      dean_name: deanName.trim(),
      dean_role: deanRole.trim(),
    };

    const success = await onDownload(course.course_id, params);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-inner">
              <FontAwesomeIcon icon={faCertificate} className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-purple-100">
                  Emisión Oficial
                </span>
                <span className="text-xs text-purple-200">
                  Edición #{course.course_id}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                Configurar Firmas de Certificados
              </h2>
            </div>
          </div>
          <p className="text-xs text-purple-100 mt-2 line-clamp-1">
            Curso: <strong className="text-white">{course.course_name}</strong>
          </p>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Warning if not finalized */}
          {!isFinalized && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Aviso del Reglamento Académico:</p>
                <p className="mt-0.5 text-amber-700">
                  El curso se encuentra actualmente en estado <strong>"{course.status}"</strong>. Según la normativa institucional, los certificados con validez oficial se generan una vez que el curso esté marcado como <strong>"Finalizado"</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faAward} className="text-purple-600 text-sm flex-shrink-0" />
            <span>
              El documento PDF incluirá en el pie de página las 3 firmas institucionales requeridas para su acreditación.
            </span>
          </div>

          {/* Three Signers Section */}
          <div className="space-y-4">
            {/* 1. Instructor */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005073] flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Docente Instructor Titular
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Asociado a esta edición del curso
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Firma Izquierda
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nombres y Apellidos / Título
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="Ej. Ing. Juan Pérez, Mgtr."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cargo / Rol Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorRole}
                    onChange={(e) => setInstructorRole(e.target.value)}
                    placeholder="Docente Instructor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Coordinadora CISCO */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Coordinación Academia CISCO
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Responsable de la acreditación NetAcad
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Firma Central
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nombres y Apellidos / Título
                  </label>
                  <input
                    type="text"
                    required
                    value={coordName}
                    onChange={(e) => setCoordName(e.target.value)}
                    placeholder="MSc. Ludmila Starodub"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cargo / Rol Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={coordRole}
                    onChange={(e) => setCoordRole(e.target.value)}
                    placeholder="Analista de sistemas – Coordinadora Academia CISCO"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Decanatura (Highlighted / Editable) */}
            <div className="border-2 border-purple-200 rounded-2xl p-4 bg-purple-50/30 hover:border-purple-400 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-800">
                        Decanatura FICA - UTN
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Autoridad Variable
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Modificable en caso de nueva autoridad o decano/a subrogante
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Firma Derecha
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombres y Apellidos del Decano/a
                  </label>
                  <input
                    type="text"
                    required
                    value={deanName}
                    onChange={(e) => setDeanName(e.target.value)}
                    placeholder="Ej. Magíster Catalina Ramírez"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Denominación del Cargo
                  </label>
                  <input
                    type="text"
                    required
                    value={deanRole}
                    onChange={(e) => setDeanRole(e.target.value)}
                    placeholder="Decana FICA - UTN"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Remember Option */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember_signers"
              checked={rememberDefaults}
              onChange={(e) => setRememberDefaults(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="remember_signers"
              className="text-xs text-slate-600 cursor-pointer select-none"
            >
              Recordar estos nombres institucionales para las próximas descargas de certificados
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                  Generando Certificados PDF...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Generar y Descargar Certificados
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

