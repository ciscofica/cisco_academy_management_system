import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserPlus,
  faIdCard,
  faEnvelope,
  faPhone,
  faDollarSign,
  faGraduationCap,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { enrollCourseParticipantRequest } from "../../api/course";
import { getAllParticipantsRequest } from "../../api/participant";

export default function EnrollParticipantModal({ isOpen, onClose, courseId, onEnrolled }) {
  const [mode, setMode] = useState("existing"); // 'existing' | 'new'
  const [allParticipants, setAllParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [existingPayment, setExistingPayment] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New participant form
  const [newForm, setNewForm] = useState({
    name: "",
    cid: "",
    phone: "",
    address: "",
    institution: "Universidad Técnica del Norte",
    participant_type_id: 1,
    total_payment: 0.0,
    enrolled: true,
    registered: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadRegisteredParticipants();
    }
  }, [isOpen]);

  const loadRegisteredParticipants = async () => {
    try {
      setLoading(true);
      const res = await getAllParticipantsRequest({ limit: 1000 });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.participants || res.data?.rows || [];
      setAllParticipants(list);
    } catch (err) {
      console.error("Error al cargar participantes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredParticipants = allParticipants.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      String(p.cid || "").includes(term)
    );
  });

  const handleEnrollExisting = async (e) => {
    e.preventDefault();
    if (!selectedParticipantId) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione un estudiante",
        text: "Debe elegir un estudiante de la lista para matricularlo.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await enrollCourseParticipantRequest(courseId, {
        participant_id: selectedParticipantId,
        total_payment: parseFloat(existingPayment) || 0.0,
      });
      Swal.fire({
        icon: "success",
        title: "¡Estudiante Matriculado!",
        text: res.data.message || "El estudiante ha sido asignado a esta edición.",
        confirmButtonColor: "#6cc24a",
      });
      onEnrolled();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al matricular",
        text: err.response?.data?.message || "No se pudo matricular al estudiante.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndEnroll = async (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.cid) {
      Swal.fire({
        icon: "warning",
        title: "Datos requeridos",
        text: "Debe ingresar al menos el nombre y la cédula del estudiante.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await enrollCourseParticipantRequest(courseId, newForm);
      Swal.fire({
        icon: "success",
        title: "¡Participante Registrado!",
        text: res.data.message || "El estudiante fue registrado y matriculado en esta edición.",
        confirmButtonColor: "#6cc24a",
      });
      onEnrolled();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: err.response?.data?.message || "No se pudo registrar al estudiante.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserPlus} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Matricular en esta Edición
              </h2>
              <p className="text-xs text-slate-500">
                Asignar un estudiante existente o registrar uno nuevo
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-4 gap-4 bg-slate-50">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all ${
              mode === "existing"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Estudiante ya registrado ({allParticipants.length})
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all ${
              mode === "new"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            + Registrar Nuevo Participante
          </button>
        </div>

        {/* Form: Existing Mode */}
        {mode === "existing" && (
          <form onSubmit={handleEnrollExisting} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buscar estudiante por nombre o cédula
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-3 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Escriba para filtrar alumnos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seleccione el estudiante *
              </label>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-gray-50"
                required
              >
                <option value="">— Seleccionar alumno de la lista —</option>
                {filteredParticipants.map((p) => (
                  <option key={p.participant_id} value={p.participant_id}>
                    {p.name} {p.cid ? `(CI: ${p.cid})` : ""}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Se vinculará el historial de este estudiante a la presente convocatoria.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pago inicial para esta edición (USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={existingPayment}
                onChange={(e) => setExistingPayment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Inicia en $0.00 de forma independiente (no hereda saldos de otros cursos).
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
                disabled={submitting || !selectedParticipantId}
                className="px-5 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                {submitting ? "Matriculando..." : "Matricular en esta Edición"}
              </button>
            </div>
          </form>
        )}

        {/* Form: New Mode */}
        {mode === "new" && (
          <form onSubmit={handleCreateAndEnroll} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombres y Apellidos completos *
              </label>
              <input
                type="text"
                placeholder="Ej: Pérez Juan Carlos"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cédula / DNI *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1004123456"
                  value={newForm.cid}
                  onChange={(e) => setNewForm({ ...newForm, cid: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: 0991234567"
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Participante
                </label>
                <select
                  value={newForm.participant_type_id}
                  onChange={(e) =>
                    setNewForm({ ...newForm, participant_type_id: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-gray-50"
                >
                  <option value={1}>Estudiante UTN</option>
                  <option value={2}>Egresado UTN</option>
                  <option value={3}>Docente / Administrativo UTN</option>
                  <option value={4}>Público General / Particular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pago Registrado (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newForm.total_payment}
                  onChange={(e) =>
                    setNewForm({ ...newForm, total_payment: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>
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
                disabled={submitting}
                className="px-5 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                {submitting ? "Registrando..." : "Guardar y Matricular"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

