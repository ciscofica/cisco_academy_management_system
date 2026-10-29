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
  faCity,
  faBuilding,
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

  // New participant form aligned to official Excel structure
  const [newForm, setNewForm] = useState({
    name: "",
    cid: "",
    email: "",
    phone: "",
    address: "Ibarra",
    institution: "Universidad Técnica del Norte",
    participant_type_id: 1,
    degree: "CITEL",
    degree_level: 7,
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
      String(p.cid || "").includes(term) ||
      (p.email || "").toLowerCase().includes(term)
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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserPlus} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Matricular en esta Edición
              </h2>
              <p className="text-xs text-slate-500">
                Ficha oficial de estudiante y asignación a la convocatoria
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
            + Registrar Nuevo Estudiante (Ficha Oficial)
          </button>
        </div>

        {/* Form: Existing Mode */}
        {mode === "existing" && (
          <form onSubmit={handleEnrollExisting} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buscar estudiante por nombre, cédula o correo
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
                    {p.name} {p.cid ? `(CI: ${p.cid})` : ""} {p.degree ? `[${p.degree}]` : ""}
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

        {/* Form: New Mode (Alineado al Excel Oficial) */}
        {mode === "new" && (
          <form onSubmit={handleCreateAndEnroll} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellidos y Nombres Completos *
              </label>
              <input
                type="text"
                placeholder="Ej: ATUPAÑA CEPEDA DYLAN ALEXANDER"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faIdCard} className="mr-1 text-slate-400" />
                  Cédula / DNI *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1004235634"
                  value={newForm.cid}
                  onChange={(e) => setNewForm({ ...newForm, cid: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-slate-400" />
                  Correo Electrónico (E-mail)
                </label>
                <input
                  type="email"
                  placeholder="Ej: dylanatupana05@gmail.com"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faPhone} className="mr-1 text-slate-400" />
                  Teléfono Celular
                </label>
                <input
                  type="text"
                  placeholder="Ej: 0989928352"
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faCity} className="mr-1 text-slate-400" />
                  Ciudad de Residencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ibarra, Tulcán, Cayambe"
                  value={newForm.address}
                  onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a]"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
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
                <option value={2}>Graduado / Egresado UTN</option>
                <option value={4}>Particular / Externo</option>
                <option value={5}>Docente UTN</option>
              </select>
            </div>

            {/* Datos Académicos y Laborales */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faGraduationCap} className="mr-1 text-[#049fd9]" />
                  Carrera
                </label>
                <input
                  type="text"
                  placeholder="Ej: CITEL, CIELE, Software"
                  value={newForm.degree}
                  onChange={(e) => setNewForm({ ...newForm, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nivel / Semestre
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ej: 7 u 8"
                  value={newForm.degree_level}
                  onChange={(e) => setNewForm({ ...newForm, degree_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faBuilding} className="mr-1 text-slate-400" />
                  Empresa / Institución Laboral
                </label>
                <input
                  type="text"
                  placeholder="Ej: Telconet Latam, Bridge Telecom (o UTN)"
                  value={newForm.institution}
                  onChange={(e) => setNewForm({ ...newForm, institution: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-[#3a8c25]" />
                Pago Inicial Registrado (USD)
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
                className="px-5 py-2.5 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                {submitting ? "Registrando..." : "Guardar Ficha y Matricular"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
