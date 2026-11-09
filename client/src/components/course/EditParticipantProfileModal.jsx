import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserEdit,
  faSave,
  faEnvelope,
  faPhone,
  faCity,
  faBuilding,
  faGraduationCap,
  faIdCard,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { updateParticipantRequest } from "../../api/participant";
import { getParticipantTypesDropdownRequest } from "../../api/participant_type";
import { getInfosUtnDropdownRequest } from "../../api/infoutn";

export default function EditParticipantProfileModal({
  isOpen,
  onClose,
  participant,
  onSaved,
}) {
  const [formData, setFormData] = useState({
    name: "",
    cid: "",
    email: "",
    phone: "",
    address: "",
    institution: "",
    participant_type_id: 1,
    degree: "",
    degree_level: "",
  });
  const [saving, setSaving] = useState(false);
  const [participantTypes, setParticipantTypes] = useState([]);
  const [academicOptions, setAcademicOptions] = useState([]);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [infoUtnId, setInfoUtnId] = useState("");

  useEffect(() => {
    if (participant) {
      Promise.all([getParticipantTypesDropdownRequest(), getInfosUtnDropdownRequest()]).then(([types, academic]) => {
        const typeList = types.data.participant_types || [];
        const infoList = academic.data.infos_utn || [];
        setParticipantTypes(typeList); setAcademicOptions(infoList);
        const match = infoList.find((item) => item.degree === (participant.degree || ""));
        setInfoUtnId(match ? String(match.info_utn_id) : "");
        setFacultyFilter(match?.faculty || "");
      }).catch(() => {});
      setFormData({
        name: participant.name || "",
        cid: participant.cid || "",
        email: participant.email || "",
        phone: participant.phone && participant.phone !== "sin registro" ? participant.phone : "",
        address: participant.address && participant.address !== "sin registro" ? participant.address : "",
        institution: participant.institution && participant.institution !== "sin registro" ? participant.institution : "",
        participant_type_id: participant.participant_type_id || 1,
        degree: participant.degree || "",
        degree_level: participant.degree_level || "",
      });
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateParticipantRequest({
        participant_id: participant.participant_id,
        name: formData.name,
        cid: formData.cid,
        email: formData.email,
        phone: formData.phone || "sin registro",
        address: formData.address || "sin registro",
        institution: formData.institution || "sin registro",
        participant_type_id: Number(formData.participant_type_id),
        info_utn_id: infoUtnId || null,
        degree: formData.degree,
        degree_level: formData.degree_level ? parseInt(formData.degree_level) : null,
      });

      Swal.fire({
        icon: "success",
        title: "Ficha Actualizada",
        text: "Los datos del estudiante fueron actualizados exitosamente.",
        confirmButtonColor: "#6cc24a",
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error al actualizar participante:", err);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.response?.data?.message || "No se pudo actualizar la ficha del estudiante.",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedType = participantTypes.find((type) => Number(type.participant_type_id) === Number(formData.participant_type_id));
  const isUtn = !selectedType || /UTN/i.test(selectedType.name);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#049fd9] border border-blue-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserEdit} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Ficha del Estudiante
              </h2>
              <p className="text-xs text-slate-500">
                Actualizar información personal y académica institucional
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
              Apellidos y Nombres Completos *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-1 text-slate-400" />
                Cédula / Identificación *
              </label>
              <input
                type="text"
                value={formData.cid}
                onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-slate-400" />
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="ej: estudiante@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faPhone} className="mr-1 text-slate-400" />
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="ej: 0989928352"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faCity} className="mr-1 text-slate-400" />
                Ciudad / Residencia
              </label>
              <input
                type="text"
                placeholder="ej: Ibarra, Tulcán, Cayambe"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9]"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Participante
            </label>
            <select
              value={formData.participant_type_id}
              onChange={(e) => { const typeId = Number(e.target.value); const type = participantTypes.find((item) => Number(item.participant_type_id) === typeId); setFormData({ ...formData, participant_type_id: typeId, ...(type && !/UTN/i.test(type.name) ? { degree: "", degree_level: "" } : {}) }); if (type && !/UTN/i.test(type.name)) { setInfoUtnId(""); setFacultyFilter(""); } }}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#049fd9] bg-gray-50"
            >
              {participantTypes.map((type) => <option key={type.participant_type_id} value={type.participant_type_id}>{type.name}</option>)}
            </select>
          </div>

          {/* Conditional fields based on participant type */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200">
            {isUtn ? <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-1 text-[#049fd9]" />
                Carrera
              </label>
              <select value={facultyFilter} onChange={(e) => { setFacultyFilter(e.target.value); setInfoUtnId(""); setFormData({ ...formData, degree: "", degree_level: "" }); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"><option value="">Seleccionar facultad</option>{[...new Set(academicOptions.map((item) => item.faculty).filter(Boolean))].sort().map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}</select>
              <select value={infoUtnId} onChange={(e) => { const selected = academicOptions.find((item) => String(item.info_utn_id) === e.target.value); setInfoUtnId(e.target.value); setFormData({ ...formData, degree: selected?.degree || "", degree_level: selected?.degree_level || "" }); }} className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"><option value="">Seleccionar carrera</option>{academicOptions.filter((item) => !facultyFilter || item.faculty === facultyFilter).map((item) => <option key={item.info_utn_id} value={item.info_utn_id}>{item.degree}</option>)}</select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nivel académico
              </label>
              <input type="text" readOnly placeholder="Nivel del catálogo" value={formData.degree_level} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-slate-100" />
            </div>

            </> : <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1"><FontAwesomeIcon icon={faBuilding} className="mr-1 text-slate-400" />Empresa / Institución Laboral</label>
              <input type="text" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
            </div>}
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
              className="px-5 py-2.5 bg-[#005073] hover:bg-[#003d57] disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={saving ? "animate-spin" : ""} />
              {saving ? "Guardando..." : "Guardar Ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

