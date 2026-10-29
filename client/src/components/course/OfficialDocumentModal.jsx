import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPrint,
  faFilePdf,
  faGraduationCap,
  faCalendarAlt,
  faUserTie,
  faClock,
  faLaptop,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function OfficialDocumentModal({ isOpen, onClose, documentType, course }) {
  const printRef = useRef(null);

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

  const handlePrint = () => {
    window.print();
  };

  const modalityName =
    modalities.length > 0 ? modalities.map((m) => m.name).join(", ") : "Presencial / Virtual";

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
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6cc24a] hover:bg-[#5aad3a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <FontAwesomeIcon icon={faPrint} />
              Imprimir / Guardar PDF
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
            {/* Header / Institutional Letterhead */}
            <div className="border-b-2 border-[#005073] pb-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#005073] text-white flex items-center justify-center font-black text-lg">
                    UTN
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-[#005073] uppercase tracking-wide">
                      Universidad Técnica del Norte
                    </h1>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Facultad de Ingeniería en Ciencias Aplicadas (FICA)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Academia Local Cisco Networking Academy - NetAcad
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#049fd9]/10 text-[#005073] font-bold text-[10px] uppercase border border-[#049fd9]/20">
                    Documento Oficial
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ibarra - Ecuador
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-extrabold text-[#005073] uppercase tracking-wider underline underline-offset-4">
                {documentType?.name || "Planificación del Curso"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Periodo Operativo: {course.course_name}
              </p>
            </div>

            {/* General Course Information Box */}
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

            {/* Institutional Signatures Section */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
                <div>
                  <div className="border-b border-gray-400 pb-12 mb-2"></div>
                  <p className="font-bold text-slate-800">
                    {instructor ? instructor.name : "DOCENTE ASIGNADO"}
                  </p>
                  <p className="text-slate-500">Instructor Cisco Certified</p>
                  <p className="text-[9px] text-slate-400">UTN - FICA</p>
                </div>

                <div>
                  <div className="border-b border-gray-400 pb-12 mb-2"></div>
                  <p className="font-bold text-slate-800">ING. COORDINADOR ACADÉMICO</p>
                  <p className="text-slate-500">Cisco Networking Academy</p>
                  <p className="text-[9px] text-slate-400">Main Contact UTN</p>
                </div>

                <div>
                  <div className="border-b border-gray-400 pb-12 mb-2"></div>
                  <p className="font-bold text-slate-800">DECANO / AUTORIDAD FICA</p>
                  <p className="text-slate-500">Facultad de Ingeniería (FICA)</p>
                  <p className="text-[9px] text-slate-400">Universidad Técnica del Norte</p>
                </div>
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

