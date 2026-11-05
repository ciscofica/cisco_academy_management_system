import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPrint,
  faFilePdf,
  faFileWord,
  faSpinner,
  faGraduationCap,
  faCalendarAlt,
  faUserTie,
  faClock,
  faLaptop,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { downloadCourseDocumentDocxRequest } from "../../api/course";

export default function OfficialDocumentModal({ isOpen, onClose, documentType, course }) {
  const printRef = useRef(null);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  if (!isOpen || !course) return null;

  const detail = course.Detail || {};
  const instructor = detail.Instructor || null;
  const modalities = detail.Modalities || [];
  const participants = course.Participants || [];
  const chapters = course.Chapters || [];

  const totalHours = Number(detail.total_hours) || 70;
  const instructorHours = Number(detail.instructor_hours) || 50;
  const autonomousHours = Number(detail.activities_hours) || 20;
  const costPerHour = Number(detail.cost_per_hour) || 13.0;
  const estimatedTeacherPay = (instructorHours * costPerHour).toFixed(2);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatWeekdayDate = (dateStr, withComma = false) => {
    if (!dateStr) return "Por definir";
    try {
      const days = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];
      const months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      let dayIndex, dayNum, monthIndex, yearNum;
      if (typeof dateStr === "string" && dateStr.includes("-")) {
        const parts = dateStr.split("T")[0].split("-");
        if (parts.length === 3) {
          const utcDate = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
          dayIndex = utcDate.getUTCDay();
          dayNum = utcDate.getUTCDate();
          monthIndex = utcDate.getUTCMonth();
          yearNum = utcDate.getUTCFullYear();
        }
      }
      if (dayIndex === undefined) {
        const d = new Date(dateStr);
        dayIndex = d.getDay();
        dayNum = d.getDate();
        monthIndex = d.getMonth();
        yearNum = d.getFullYear();
      }
      const dayName = days[dayIndex];
      const monthName = months[monthIndex];
      if (withComma) {
        return `${dayName}, ${dayNum} de ${monthName} de ${yearNum}`;
      }
      return `${dayName} ${dayNum} de ${monthName} de ${yearNum}`;
    } catch {
      return String(dateStr);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const docKey = (documentType?.id || documentType?.name || "").toLowerCase();
  const hasDocx =
    docKey.includes("planifi") ||
    docKey.includes("crono") ||
    docKey.includes("informe") ||
    docKey.includes("cierre");

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      let targetDoc = documentType?.id;
      if (!targetDoc) {
        if (docKey.includes("planifi")) targetDoc = "planificacion";
        else if (docKey.includes("crono")) targetDoc = "cronograma";
        else if (docKey.includes("informe") || docKey.includes("cierre")) targetDoc = "informe";
        else targetDoc = "planificacion";
      }

      const response = await downloadCourseDocumentDocxRequest(course.course_id, targetDoc);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (course.course_name || "Curso").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${targetDoc}_${cleanName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        icon: "success",
        title: "¡Documento Word Generado!",
        text: "El documento editable se ha descargado correctamente en formato .docx.",
        confirmButtonColor: "#6cc24a",
        timer: 3000,
      });
    } catch (err) {
      console.error("Error al exportar DOCX:", err);
      Swal.fire({
        icon: "error",
        title: "Error al exportar",
        text: err.response?.data?.message || "No se pudo generar el documento Word.",
      });
    } finally {
      setDownloadingDocx(false);
    }
  };

  const modalityName =
    modalities.length > 0 ? modalities.map((m) => m.name).join(", ") : "Presencial / Virtual";

  const isCronograma = docKey.includes("crono");

  // Horarios para cronograma
  const schedules = detail.Schedules || [];
  let virtualSchedule = "";
  let presencialSchedule = "";
  schedules.forEach((sch) => {
    const desc = (sch.description || "").toLowerCase();
    const days = (sch.days || "").toLowerCase();
    const st = (sch.start_time || "").substring(0, 5).replace(":", "H");
    const et = (sch.end_time || "").substring(0, 5).replace(":", "H");
    const timeRange = st && et ? `${st} - ${et}` : "";

    if (
      desc.includes("presencial") ||
      days.includes("sábado") ||
      days.includes("sabado") ||
      days.includes("6")
    ) {
      if (timeRange) presencialSchedule = timeRange;
    } else {
      if (timeRange) virtualSchedule = timeRange;
    }
  });
  if (!virtualSchedule) virtualSchedule = "19H00 - 22H00";
  if (!presencialSchedule) presencialSchedule = "8H00 - 13H00";

  let period = "ENERO - MARZO 2026";
  if (course.start_date && course.end_date) {
    const months = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
    ];
    const d1 = new Date(course.start_date);
    const d2 = new Date(course.end_date);
    period = `${months[d1.getUTCMonth()]} - ${months[d2.getUTCMonth()]} ${d2.getUTCFullYear()}`;
  }

  let shortCourseName = course.course_name || "Curso";
  const shortMatch = (course.course_name || "").match(
    /^(CCNA\s*\d|CCNP\s*\d|DevNet|CyberOps|Python|Linux)/i
  );
  if (shortMatch) {
    shortCourseName = shortMatch[0].replace(/\s+/g, "");
  }

  const estimatedDates = [];
  const baseDate = course.start_date ? new Date(course.start_date) : new Date(2026, 0, 27);
  const curUtc = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));
  for (let i = 0; i < Math.max(chapters.length, 16); i++) {
    if (i > 0) {
      do {
        curUtc.setUTCDate(curUtc.getUTCDate() + 1);
      } while (curUtc.getUTCDay() !== 2 && curUtc.getUTCDay() !== 4 && curUtc.getUTCDay() !== 6);
    }
    estimatedDates.push(new Date(curUtc));
  }

  const defaultClasses = [
    { date: "martes, 27 de enero de 2026", h: 3, m: "Virtual", cap: "1. Networking Today\n2. Basic Switch and End device configuration" },
    { date: "jueves, 29 de enero de 2026", h: 3, m: "Virtual", cap: "3. Protocols and Models" },
    { date: "martes, 3 de febrero de 2026", h: 3, m: "Virtual", cap: "4. Physical Layer" },
    { date: "jueves, 5 de febrero de 2026", h: 3, m: "Virtual", cap: "5. Number Systems" },
    { date: "martes, 10 de febrero de 2026", h: 3, m: "Virtual", cap: "6. Data Link Layer" },
    { date: "jueves, 12 de febrero de 2026", h: 3, m: "Virtual", cap: "7. Ethernet Switching" },
    { date: "jueves, 19 de febrero de 2026", h: 3, m: "Virtual", cap: "8. Network Layer" },
    { date: "martes, 24 de febrero de 2026", h: 3, m: "Virtual", cap: "9. Address Resolution" },
    { date: "jueves, 26 de febrero de 2026", h: 3, m: "Virtual", cap: "10. Basic Router Configuration" },
    { date: "martes, 3 de marzo de 2026", h: 3, m: "Virtual", cap: "11. IPv4 Addressing & subnets" },
    { date: "jueves, 5 de marzo de 2026", h: 3, m: "Virtual", cap: "12. IPv6 Addressing" },
    { date: "martes, 10 de marzo de 2026", h: 3, m: "Virtual", cap: "13. ICMP" },
    { date: "jueves, 12 de marzo de 2026", h: 3, m: "Virtual", cap: "14. Transport Layer 15. Application Layer" },
    { date: "sábado, 14 de marzo de 2026", h: 5, m: "Presencial", cap: "Laboratorios equipos físicos" },
    { date: "martes, 17 de marzo de 2026", h: 3, m: "Virtual", cap: "16. Network Security Fundamentals" },
    { date: "jueves, 19 de marzo de 2026", h: 3, m: "Virtual", cap: "17. Build a Small Network" },
  ];

  const totalInstructorHours =
    chapters.length > 0
      ? chapters.reduce((sum, ch) => sum + (Number(ch.hours) || 2), 0)
      : 50;
  const actHours = detail.activities_hours
    ? Number(detail.activities_hours) >= 3
      ? Number(detail.activities_hours) - 3
      : Number(detail.activities_hours)
    : 17;
  const grandTotal = totalInstructorHours + actHours + 3;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header (No printable) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#edf7e6] text-[#3a8c25] border border-green-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faFilePdf} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Documento Oficial: {documentType?.name || "Expediente Académico"}
              </h2>
              <p className="text-xs text-slate-500">
                Vista previa con formato reglamentario UTN - Cisco Networking Academy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasDocx && (
              <button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="px-4 py-2 bg-[#005073] hover:bg-[#003d57] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                title="Descargar documento editable en formato Microsoft Word (.docx)"
              >
                <FontAwesomeIcon
                  icon={downloadingDocx ? faSpinner : faFileWord}
                  className={downloadingDocx ? "animate-spin" : ""}
                />
                {downloadingDocx ? "Generando..." : "Descargar Word (.docx)"}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <FontAwesomeIcon icon={faPrint} />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="overflow-y-auto p-6 md:p-10 bg-slate-100 flex-1">
          <div
            ref={printRef}
            className="bg-white mx-auto shadow-sm p-8 md:p-12 max-w-3xl border border-gray-200 rounded-lg text-slate-800 text-xs leading-relaxed"
            style={{ minHeight: "1050px" }}
          >
            {/* Header / Institutional Letterhead (Alineado a la cabecera oficial UTN) */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="w-20 flex-shrink-0">
                  <img
                    src="/logo_utn.png"
                    alt="Universidad Técnica del Norte"
                    className="w-20 h-20 object-contain mx-auto"
                  />
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wide font-sans leading-snug">
                    UNIVERSIDAD TÉCNICA DEL NORTE
                  </h1>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-sans leading-snug mt-0.5">
                    FACULTAD DE INGENIERÍA EN CIENCIAS APLICADAS
                  </h2>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans leading-snug mt-0.5">
                    ACADEMIA CISCO
                  </h3>
                </div>
                {/* Balanceador derecho para centrado perfecto */}
                <div className="w-20 hidden sm:block flex-shrink-0" />
              </div>
            </div>

            {/* Document Title (Solo para Planificación e Informe) */}
            {!isCronograma && (
              <div className="text-center my-6">
                <h2 className="text-base font-extrabold text-[#005073] uppercase tracking-wider underline underline-offset-4">
                  {documentType?.name || "Planificación del Curso"}
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Periodo Operativo: {course.course_name}
                </p>
              </div>
            )}

            {/* General Course Information Box (Solo para Planificación e Informe) */}
            {!isCronograma && (
              <div className="bg-slate-50 border border-gray-300 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                  1. Información General de la Edición
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-700">Denominación del Curso:</span>{" "}
                    <span className="text-slate-900">{course.course_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Código de Convocatoria:</span>{" "}
                    <span className="text-slate-900">#ED-{course.course_id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Docente Responsable:</span>{" "}
                    <span className="text-slate-900 font-medium">
                      {instructor ? instructor.name : "Por designar"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Modalidad de Dictado:</span>{" "}
                    <span className="text-slate-900">{modalityName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Fecha de Inicio:</span>{" "}
                    <span className="text-slate-900">{formatDate(course.start_date)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Fecha de Culminación:</span>{" "}
                    <span className="text-slate-900">{formatDate(course.end_date)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Specific Sections */}
            {documentType?.name === "Planificación de Curso" && (
              <>
                {/* Academic Breakdown */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                    2. Carga Horaria y Estructura Pedagógica
                  </h3>
                  <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2">Componente de Aprendizaje</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Horas</th>
                        <th className="border border-gray-300 px-3 py-2">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">Docencia Síncrona / Presencial</td>
                        <td className="border border-gray-300 px-3 py-2 text-center font-bold">{instructorHours} h</td>
                        <td className="border border-gray-300 px-3 py-2 text-slate-600">
                          Sesiones guiadas por el instructor en laboratorio y videoconferencias
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">Trabajo Autónomo y Plataforma NetAcad</td>
                        <td className="border border-gray-300 px-3 py-2 text-center font-bold">{autonomousHours} h</td>
                        <td className="border border-gray-300 px-3 py-2 text-slate-600">
                          Lecturas, Packet Tracer, Checkpoints y evaluaciones de capítulo
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="border border-gray-300 px-3 py-2">TOTAL HORAS CERTIFICADAS</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-[#3a8c25]">{totalHours} h</td>
                        <td className="border border-gray-300 px-3 py-2 text-slate-600">Carga académica oficial UTN FICA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Financial and Teacher Budget */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                    3. Presupuesto y Honorarios Docentes
                  </h3>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-gray-300 rounded text-center text-[11px]">
                    <div>
                      <p className="text-slate-500 font-medium">Horas de Docencia</p>
                      <p className="text-sm font-bold text-slate-800">{instructorHours} horas</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Tarifa por Hora Oficial</p>
                      <p className="text-sm font-bold text-[#005073]">${costPerHour.toFixed(2)} USD</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Total Honorarios Presupuestados</p>
                      <p className="text-sm font-bold text-[#3a8c25]">${estimatedTeacherPay} USD</p>
                    </div>
                  </div>
                </div>

                {/* Modules Summary */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                    4. Temario Oficial NetAcad ({chapters.length} Módulos)
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-700 max-h-48 overflow-hidden">
                    {chapters.slice(0, 20).map((ch, idx) => (
                      <div key={idx} className="truncate">
                        <span className="font-semibold text-[#005073]">Módulo {idx + 1}:</span> {ch.chapter_name}
                      </div>
                    ))}
                    {chapters.length > 20 && (
                      <div className="italic text-slate-500 col-span-2">
                        ...y {chapters.length - 20} módulos adicionales contemplados en el sílabo oficial.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {documentType?.name === "Formulario de Inscripción" && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                  2. Nómina de Participantes Registrados ({participants.length})
                </h3>
                {participants.length > 0 ? (
                  <table className="w-full text-left border-collapse border border-gray-300 text-[10px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center">N°</th>
                        <th className="border border-gray-300 px-2 py-1">Apellidos y Nombres</th>
                        <th className="border border-gray-300 px-2 py-1">Cédula / DNI</th>
                        <th className="border border-gray-300 px-2 py-1">Tipo</th>
                        <th className="border border-gray-300 px-2 py-1 text-center">Matrícula</th>
                        <th className="border border-gray-300 px-2 py-1 text-center">Pago Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p, idx) => (
                        <tr key={p.participant_id || idx} className="hover:bg-slate-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-2 py-1 font-semibold">{p.name}</td>
                          <td className="border border-gray-300 px-2 py-1">{p.cid || "—"}</td>
                          <td className="border border-gray-300 px-2 py-1">{p.ParticipantType?.name || "Particular"}</td>
                          <td className="border border-gray-300 px-2 py-1 text-center font-semibold text-[#3a8c25]">
                            {p.enrolled ? "Matriculado" : "Pendiente"}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            ${Number(p.total_payment || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic p-4 text-center border border-dashed rounded">
                    No hay participantes registrados formalmente en esta edición aún.
                  </p>
                )}
              </div>
            )}

            {documentType?.name === "Informe Final del Curso" && (
              <div className="mb-6 space-y-4">
                <h3 className="text-xs font-bold text-[#005073] uppercase mb-2 border-b border-gray-200 pb-1">
                  2. Resumen de Rendimiento y Cumplimiento Académico
                </h3>
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-gray-300 rounded text-center text-[11px]">
                  <div>
                    <p className="text-slate-500">Inscritos</p>
                    <p className="text-base font-bold text-slate-800">{participants.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Matriculados</p>
                    <p className="text-base font-bold text-[#005073]">
                      {participants.filter((p) => p.enrolled).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Aprobados</p>
                    <p className="text-base font-bold text-[#3a8c25]">
                      {participants.filter((p) => p.approval).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">% Aprobación</p>
                    <p className="text-base font-bold text-[#3a8c25]">
                      {participants.length > 0
                        ? `${Math.round(
                            (participants.filter((p) => p.approval).length /
                              participants.length) *
                              100
                          )}%`
                        : "0%"}
                    </p>
                  </div>
                </div>

                <div className="p-3 border border-gray-200 rounded text-[11px]">
                  <p className="font-semibold text-slate-800 mb-1">Certificación de Cumplimiento:</p>
                  <p className="text-slate-600">
                    Se certifica que el curso fue ejecutado cubriendo la totalidad de las{" "}
                    <strong>{totalHours} horas académicas</strong> establecidas en la planificación
                    oficial, registrándose el rendimiento de los participantes en la plataforma Cisco
                    NetAcad conforme a los estatutos de la Universidad Técnica del Norte.
                  </p>
                </div>
              </div>
            )}

            {/* Cronograma de Actividades Oficial */}
            {isCronograma && (
              <div className="mb-6 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[11px] leading-tight text-black font-sans">
                  <tbody>
                    {/* Fila 1: Cabecera gris */}
                    <tr className="bg-[#d9d9d9] font-bold text-center border border-black">
                      <td colSpan={5} className="py-1.5 px-2 border border-black text-xs uppercase tracking-wide">
                        CRONOGRAMA CURSO ACADEMIA CISCO FICA-UTN
                      </td>
                    </tr>
                    {/* Fila 2: Nombre del Curso */}
                    <tr className="bg-[#f2f2f2] font-bold text-center border border-black">
                      <td colSpan={5} className="py-1.5 px-2 border border-black text-xs">
                        {course.course_name || "CCNA1 v7: Introduction to Networks (ITN)"}
                      </td>
                    </tr>
                    {/* Fila 3: PERIODO */}
                    <tr className="bg-[#d9ead3] font-bold text-center border border-black">
                      <td colSpan={5} className="py-1 px-2 border border-black text-xs">
                        PERIODO: {period}
                      </td>
                    </tr>
                    {/* Fila 4: FECHA INICIO */}
                    <tr className="bg-[#fce5cd] font-bold text-left border border-black">
                      <td colSpan={5} className="py-1 px-3 border border-black">
                        FECHA INICIO: {course.start_date ? formatWeekdayDate(course.start_date, false) : "martes 27 de enero de 2026"}
                      </td>
                    </tr>
                    {/* Fila 5: FECHA FINAL */}
                    <tr className="bg-white font-bold text-left border border-black">
                      <td colSpan={5} className="py-1 px-3 border border-black">
                        FECHA FINAL: {course.end_date ? formatWeekdayDate(course.end_date, false) : "Domingo 22 de marzo de 2026"}
                      </td>
                    </tr>
                    {/* Fila 6: HORARIO VIRTUAL */}
                    <tr className="bg-[#fce5cd] font-bold text-left border border-black">
                      <td colSpan={5} className="py-1 px-3 border border-black">
                        HORARIO CLASES VIRTUALES SÍNCRONAS: {virtualSchedule}
                      </td>
                    </tr>
                    {/* Fila 7: HORARIO PRESENCIAL */}
                    <tr className="bg-white font-bold text-left border border-black">
                      <td colSpan={5} className="py-1 px-3 border border-black">
                        HORARIO CLASE PRESENCIAL: {presencialSchedule}
                      </td>
                    </tr>

                    {/* Fila 8: Encabezados de Columnas */}
                    <tr className="bg-[#b7b7b7] font-bold text-center border border-black">
                      <th className="py-1.5 px-2 border border-black w-[8%]">Clase</th>
                      <th className="py-1.5 px-2 border border-black w-[28%]">Fecha</th>
                      <th className="py-1.5 px-2 border border-black w-[12%]">Núm. Horas</th>
                      <th className="py-1.5 px-2 border border-black w-[14%]">Modalidad</th>
                      <th className="py-1.5 px-2 border border-black w-[38%]">Capítulos</th>
                    </tr>

                    {/* Fila 9: Sub-barra celeste */}
                    <tr className="bg-[#00b0f0] font-bold text-black border border-black">
                      <td colSpan={5} className="py-1 px-3 border border-black text-xs">
                        Clases con instructor
                      </td>
                    </tr>

                    {/* Filas de Sesiones / Capítulos desde la Base de Datos */}
                    {chapters.length > 0 ? (
                      chapters.map((ch, idx) => {
                        const isPresencial = (ch.modality || "").toLowerCase().includes("presencial");
                        const rowBg = isPresencial ? "bg-[#ffff00]" : "bg-white";
                        const dateVal = ch.start_date
                          ? formatWeekdayDate(ch.start_date, true)
                          : formatWeekdayDate(estimatedDates[idx], true);

                        return (
                          <tr key={idx} className={`${rowBg} border border-black`}>
                            <td className="py-1 px-2 border border-black text-center font-semibold">{idx + 1}</td>
                            <td className="py-1 px-2 border border-black">{dateVal}</td>
                            <td className="py-1 px-2 border border-black text-center">{ch.hours || 2}</td>
                            <td className="py-1 px-2 border border-black text-center">
                              {isPresencial ? "Presencial" : (ch.modality || "Virtual")}
                            </td>
                            <td className="py-1 px-2 border border-black whitespace-pre-line">{ch.chapter_name}</td>
                          </tr>
                        );
                      })
                    ) : (
                      defaultClasses.map((cl, idx) => {
                        const isPresencial = cl.m === "Presencial";
                        const rowBg = isPresencial ? "bg-[#ffff00]" : "bg-white";
                        return (
                          <tr key={idx} className={`${rowBg} border border-black`}>
                            <td className="py-1 px-2 border border-black text-center font-semibold">{idx + 1}</td>
                            <td className="py-1 px-2 border border-black">{cl.date}</td>
                            <td className="py-1 px-2 border border-black text-center">{cl.h}</td>
                            <td className="py-1 px-2 border border-black text-center">{cl.m}</td>
                            <td className="py-1 px-2 border border-black whitespace-pre-line">{cl.cap}</td>
                          </tr>
                        );
                      })
                    )}

                    {/* Fila Subtotal: Total horas clase-instructor */}
                    <tr className="bg-[#d9ead3] font-bold border border-black">
                      <td colSpan={2} className="py-1 px-3 border border-black text-right">
                        Total horas clase-instructor
                      </td>
                      <td className="py-1 px-2 border border-black text-center">
                        {totalInstructorHours}
                      </td>
                      <td className="py-1 px-2 border-y border-l-0 border-r-0 border-black bg-white"></td>
                      <td className="py-1 px-2 border-y border-l-0 border-r-0 border-black bg-white"></td>
                    </tr>

                    {/* Fila: Actividades en la plataforma virtual */}
                    <tr className="bg-[#d9d2e9] border border-black">
                      <td colSpan={2} className="py-1 px-3 border border-black font-bold">
                        Actividades en la plataforma virtual
                      </td>
                      <td className="py-1 px-2 border border-black text-center font-bold">
                        {actHours}
                      </td>
                      <td className="py-1 px-2 border border-black text-center">
                        On-line
                      </td>
                      <td className="py-1 px-2 border border-black">
                        Laboratorios Packet tracer  y evaluaciones de los capítulos
                      </td>
                    </tr>

                    {/* Fila: Examen Final */}
                    <tr className="bg-[#fce5cd] border border-black">
                      <td colSpan={2} className="py-1 px-3 border border-black font-bold">
                        {course.end_date ? formatWeekdayDate(course.end_date, true) : "domingo, 22 de marzo de 2026"}
                      </td>
                      <td className="py-1 px-2 border border-black text-center font-bold">
                        3
                      </td>
                      <td className="py-1 px-2 border border-black text-center">
                        On-line
                      </td>
                      <td className="py-1 px-2 border border-black">
                        Exámen final
                      </td>
                    </tr>

                    {/* Fila: Total horas curso */}
                    <tr className="bg-[#d9ead3] font-bold border border-black">
                      <td colSpan={2} className="py-1 px-3 border border-black text-right">
                        Total horas curso {shortCourseName}
                      </td>
                      <td className="py-1 px-2 border border-black text-center">
                        {grandTotal}
                      </td>
                      <td className="py-1 px-2 border-y border-l-0 border-r-0 border-black bg-white"></td>
                      <td className="py-1 px-2 border-y border-l-0 border-r-0 border-black bg-white"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Institutional Signatures Section */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <div
                className={`grid ${
                  isCronograma ? "grid-cols-2 max-w-xl mx-auto" : "grid-cols-3"
                } gap-6 text-center text-[10px]`}
              >
                <div>
                  <div className="border-b border-gray-400 pb-12 mb-2"></div>
                  <p className="font-bold text-slate-800">
                    {instructor ? instructor.name : "DOCENTE DEL CURSO"}
                  </p>
                  <p className="text-slate-500">Docente / Instructor Academia CISCO</p>
                  <p className="text-[9px] text-slate-400">Facultad de Ingeniería en Ciencias Aplicadas</p>
                </div>

                <div>
                  <div className="border-b border-gray-400 pb-12 mb-2"></div>
                  <p className="font-bold text-slate-800">MSc. Ludmila Starodub</p>
                  <p className="text-slate-500">Coordinadora Academia CISCO</p>
                  <p className="text-[9px] text-slate-400">Universidad Técnica del Norte</p>
                </div>

                {!isCronograma && (
                  <div>
                    <div className="border-b border-gray-400 pb-12 mb-2"></div>
                    <p className="font-bold text-slate-800">DECANO / AUTORIDAD FICA</p>
                    <p className="text-slate-500">Facultad de Ingeniería (FICA)</p>
                    <p className="text-[9px] text-slate-400">Universidad Técnica del Norte</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-[9px] text-slate-400 border-t border-gray-100 pt-3">
              Expediente digital emitido por UTN CMS - Academia CISCO UTN | Documento para fines reglamentarios y acreditación FICA.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

