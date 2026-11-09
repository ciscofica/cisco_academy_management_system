import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
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
  faFileExcel,
  faUpload,
  faFileDownload,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  enrollCourseParticipantRequest,
  enrollCourseParticipantsBulkRequest,
} from "../../api/course";
import { getAllParticipantsRequest } from "../../api/participant";
import { getParticipantTypesDropdownRequest } from "../../api/participant_type";
import { getInfosUtnDropdownRequest } from "../../api/infoutn";

export default function EnrollParticipantModal({ isOpen, onClose, courseId, onEnrolled }) {
  const [mode, setMode] = useState("existing"); // 'existing' | 'new' | 'excel'
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
    address: "",
    institution: "",
    participant_type_id: 1,
    degree: "",
    degree_level: "",
    total_payment: 0.0,
    enrolled: true,
    registered: true,
  });

  // Excel Bulk Upload State
  const [excelData, setExcelData] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [participantTypes, setParticipantTypes] = useState([]);
  const [academicOptions, setAcademicOptions] = useState([]);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [infoUtnId, setInfoUtnId] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadRegisteredParticipants();
      Promise.all([getParticipantTypesDropdownRequest(), getInfosUtnDropdownRequest()]).then(([types, academic]) => {
        setParticipantTypes(types.data.participant_types || []);
        setAcademicOptions(academic.data.infos_utn || []);
      }).catch(() => {});
      setExcelData([]);
      setExcelFileName("");
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
  const selectedNewType = participantTypes.find((type) => Number(type.participant_type_id) === Number(newForm.participant_type_id));
  const newParticipantIsUtn = !selectedNewType || /UTN/i.test(selectedNewType.name);

  // Handler: Enroll Existing
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
        title: "Estudiante Matriculado",
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

  // Handler: Create & Enroll Single
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
      const res = await enrollCourseParticipantRequest(courseId, { ...newForm, info_utn_id: infoUtnId || null });
      Swal.fire({
        icon: "success",
        title: "Participante Registrado",
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

  // Handler: Excel File Read & Parse
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rawJson.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Archivo sin filas",
            text: "No se encontraron datos en la hoja de cálculo seleccionada.",
          });
          return;
        }

        // Mapeo flexible de columnas para coincidir con el Excel oficial
        const parsed = rawJson.map((row, idx) => {
          const keys = Object.keys(row);
          const findValue = (...patterns) => {
            const foundKey = keys.find((k) => {
              const cleanKey = k.toLowerCase().trim();
              return patterns.some((p) => cleanKey.includes(p));
            });
            return foundKey ? String(row[foundKey]).trim() : "";
          };

          const cid = findValue("cédula", "cedula", "dni", "ci");
          const name = findValue("apellidos y nombres", "nombres y apellidos", "apellidos", "nombre");
          const email = findValue("e-mail", "email", "correo");
          const phone = findValue("teléfono", "telefono", "celular");
          const address = findValue("ciudad", "direccion", "residencia") || "Ibarra";
          const tipo = findValue("tipo") || "Estudiante UTN";
          const institution = findValue("empres", "instituc", "trabajo") || "Universidad Técnica del Norte";
          const degree = findValue("carrer", "carrera") || "CITEL";
          const degree_level = findValue("nive", "semestre");

          return {
            rowNumber: idx + 1,
            cid,
            name,
            email,
            phone,
            address,
            tipo,
            institution,
            degree,
            degree_level: degree_level ? parseInt(degree_level, 10) : null,
            valid: Boolean(cid && name),
          };
        });

        setExcelData(parsed);
      } catch (err) {
        console.error("Error al procesar archivo Excel:", err);
        Swal.fire({
          icon: "error",
          title: "Error de lectura",
          text: "No se pudo interpretar el archivo. Asegúrese de que sea un archivo Excel válido (.xlsx, .xls o .csv).",
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  // Handler: Confirm Excel Bulk Enrollment
  const handleConfirmBulkEnroll = async () => {
    const validRows = excelData.filter((r) => r.valid);
    if (validRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No hay datos válidos",
        text: "Ninguna de las filas leídas contiene cédula y nombre válidos.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await enrollCourseParticipantsBulkRequest(courseId, validRows);
      Swal.fire({
        icon: "success",
        title: "Carga Masiva Exitosa",
        html: `
          <p class="text-sm">${res.data.message}</p>
          <div class="mt-2 text-xs text-slate-500">
            Nuevos matriculados: <b>${res.data.newlyEnrolledCount}</b><br/>
            Ya estaban en esta edición: <b>${res.data.alreadyEnrolledCount}</b>
          </div>
        `,
        confirmButtonColor: "#6cc24a",
      });
      onEnrolled();
      onClose();
    } catch (err) {
      console.error("Error en carga masiva:", err);
      Swal.fire({
        icon: "error",
        title: "Error al procesar",
        text: err.response?.data?.message || "No se pudo completar la carga masiva.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Download Official Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "CÉDULA": "1004235634",
        "APELLIDOS Y NOMBRES": "ATUPAÑA CEPEDA DYLAN ALEXANDER",
        "E-MAIL": "dylanatupana05@gmail.com",
        "TELÉFONO": "0989928352",
        "CIUDAD": "Ibarra",
        "TIPO": "Estudiante UTN",
        "EMPRESA": "",
        "CARRERA": "CITEL",
        "NIVEL": "7",
      },
      {
        "CÉDULA": "0401655147",
        "APELLIDOS Y NOMBRES": "CANO CANDO CRISTHIAN ALEXANDER",
        "E-MAIL": "cris24canocando@gmail.com",
        "TELÉFONO": "0963610427",
        "CIUDAD": "Tulcán",
        "TIPO": "Particular",
        "EMPRESA": "Telconet Latam",
        "CARRERA": "CITEL",
        "NIVEL": "",
      },
      {
        "CÉDULA": "1004382691",
        "APELLIDOS Y NOMBRES": "IPIALES JINGO MARLON EMANUEL",
        "E-MAIL": "marlonipiales551@gmail.com",
        "TELÉFONO": "0983557938",
        "CIUDAD": "Quito",
        "TIPO": "Graduado UTN",
        "EMPRESA": "",
        "CARRERA": "CITEL",
        "NIVEL": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matricula");
    XLSX.writeFile(wb, "Plantilla_Matricula_Cisco_UTN.xlsx");
  };

  const validCount = excelData.filter((r) => r.valid).length;
  const invalidCount = excelData.length - validCount;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto">
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
                Ficha oficial de estudiante o carga masiva institucional
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
        <div className="flex border-b border-gray-200 px-6 pt-4 gap-3 bg-slate-50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
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
            className={`pb-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              mode === "new"
                ? "border-[#6cc24a] text-[#3a8c25]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            + Registro Individual
          </button>
          <button
            type="button"
            onClick={() => setMode("excel")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              mode === "excel"
                ? "border-[#049fd9] text-[#005073]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
            Carga Masiva desde Excel
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
                className="px-5 py-2.5 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={submitting ? faSpinner : faUserPlus} className={submitting ? "animate-spin" : ""} />
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
                onChange={(e) => { const typeId = Number(e.target.value); const type = participantTypes.find((item) => Number(item.participant_type_id) === typeId); setNewForm({ ...newForm, participant_type_id: typeId, ...(type && !/UTN/i.test(type.name) ? { degree: "", degree_level: "" } : {}) }); if (type && !/UTN/i.test(type.name)) { setInfoUtnId(""); setFacultyFilter(""); } }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#6cc24a] bg-gray-50"
              >
                {participantTypes.map((type) => <option key={type.participant_type_id} value={type.participant_type_id}>{type.name}</option>)}
              </select>
            </div>

            {/* Datos Académicos y Laborales */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200">
              {newParticipantIsUtn ? <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <FontAwesomeIcon icon={faGraduationCap} className="mr-1 text-[#049fd9]" />
                  Carrera
                </label>
                <select value={facultyFilter} onChange={(e) => { setFacultyFilter(e.target.value); setInfoUtnId(""); setNewForm({ ...newForm, degree: "", degree_level: "" }); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"><option value="">Seleccionar facultad</option>{[...new Set(academicOptions.map((item) => item.faculty).filter(Boolean))].sort().map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}</select>
                <select value={infoUtnId} onChange={(e) => { const selected = academicOptions.find((item) => String(item.info_utn_id) === e.target.value); setInfoUtnId(e.target.value); setNewForm({ ...newForm, degree: selected?.degree || "", degree_level: selected?.degree_level || "" }); }} className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"><option value="">Seleccionar carrera</option>{academicOptions.filter((item) => !facultyFilter || item.faculty === facultyFilter).map((item) => <option key={item.info_utn_id} value={item.info_utn_id}>{item.degree}</option>)}</select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nivel académico
                </label>
                <input type="text" readOnly placeholder="Nivel del catálogo" value={newForm.degree_level} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-slate-100" />
              </div>

              </> : <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1"><FontAwesomeIcon icon={faBuilding} className="mr-1 text-slate-400" />Empresa / Institución</label>
                <input type="text" value={newForm.institution} onChange={(e) => setNewForm({ ...newForm, institution: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
              </div>}
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
                <FontAwesomeIcon icon={submitting ? faSpinner : faUserPlus} className={submitting ? "animate-spin" : ""} />
                {submitting ? "Registrando..." : "Guardar Ficha y Matricular"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Excel Bulk Upload */}
        {mode === "excel" && (
          <div className="p-6 space-y-4">
            {/* Top Info & Template Download */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Formato Institucional Reconocido
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Cabeceras detectadas: Cédula, Nombres, E-mail, Teléfono, Ciudad, Tipo, Empresa, Carrera, Nivel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <FontAwesomeIcon icon={faFileDownload} />
                Descargar Plantilla Excel
              </button>
            </div>

            {/* Dropzone File Selector */}
            {excelData.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/30 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faFileExcel} className="text-2xl" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Haga clic para seleccionar o arrastre su archivo Excel
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Formatos compatibles: .xlsx, .xls o .csv con lista de matriculados
                </p>
              </div>
            ) : (
              <div>
                {/* File Header with Clear Option */}
                <div className="flex items-center justify-between mb-3 bg-slate-100 px-3.5 py-2 rounded-xl text-xs border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
                    <span className="font-bold text-slate-800">{excelFileName}</span>
                    <span className="text-slate-500">({excelData.length} filas leídas)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExcelData([]);
                      setExcelFileName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Cambiar archivo
                  </button>
                </div>

                {/* Validation Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600" />
                    <span><b>{validCount}</b> estudiantes listos para matricular</span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTimesCircle} className="text-amber-600" />
                      <span><b>{invalidCount}</b> filas omitidas (sin cédula o nombre)</span>
                    </div>
                  )}
                </div>

                {/* Compact Preview Table */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[11px] text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-center">#</th>
                        <th className="px-3 py-2">Cédula</th>
                        <th className="px-3 py-2">Apellidos y Nombres</th>
                        <th className="px-3 py-2">E-mail</th>
                        <th className="px-3 py-2">Carrera / Nivel</th>
                        <th className="px-3 py-2">Tipo / Empresa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {excelData.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.valid ? "hover:bg-slate-50" : "bg-red-50/60 text-red-700"}
                        >
                          <td className="px-3 py-2 text-center font-mono text-slate-400">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium">
                            {row.cid || <span className="text-red-500 font-bold">Falta CI</span>}
                          </td>
                          <td className="px-3 py-2 font-semibold">
                            {row.name || <span className="text-red-500 font-bold">Falta Nombre</span>}
                          </td>
                          <td className="px-3 py-2 text-slate-500 truncate max-w-[130px]">
                            {row.email || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.degree ? `${row.degree} ${row.degree_level ? `(N.${row.degree_level})` : ""}` : "—"}
                          </td>
                          <td className="px-3 py-2 truncate max-w-[130px]">
                            <span className="font-medium">{row.tipo || "UTN"}</span>
                            {row.institution && row.institution !== "sin registro" && (
                              <span className="text-slate-400 block text-[10px]">{row.institution}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkEnroll}
                disabled={submitting || validCount === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={submitting ? faSpinner : faUpload} className={submitting ? "animate-spin" : ""} />
                {submitting ? "Procesando Carga Masiva..." : `Matricular ${validCount} Estudiantes`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
