import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseParticipantsReportRequest } from "../../api/course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

function CourseParticipantsReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParticipantsReport();
  }, [id]);

  const loadParticipantsReport = async () => {
    try {
      setLoading(true);
      const res = await getCourseParticipantsReportRequest(id);
      setData(res.data);
    } catch (error) {
      console.error("Error loading participants report:", error);
    } finally {
      setLoading(false);
    }
  };

  const BoolBadge = ({ value, yesText = "Sí", noText = "No" }) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        value
          ? "bg-[#edf7e6] text-[#3a8c25] border-green-200"
          : "bg-gray-100 text-slate-500 border-gray-200"
      }`}
    >
      <FontAwesomeIcon icon={value ? faCheckCircle : faTimesCircle} className="text-[10px]" />
      {value ? yesText : noText}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#049fd9] text-3xl animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">No se pudo cargar el reporte de participantes.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 bg-white border border-gray-300 text-slate-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  const participants = data.participants || [];
  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.cid || "").includes(searchTerm)
  );

  // Stats
  const totalPayments = participants.reduce((acc, p) => acc + (parseFloat(p.total_payment) || 0), 0);
  const totalRegistered = participants.filter(p => p.registered).length;
  const totalEnrolled = participants.filter(p => p.enrolled).length;
  const totalApproved = participants.filter(p => p.approval).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(`/course/${id}/expedient`)}
          className="text-slate-500 hover:text-slate-800 mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver al expediente
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#005073] flex items-center justify-center text-white shadow-sm">
              <FontAwesomeIcon icon={faUsers} className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Participantes del curso
              </h1>
              <p className="text-slate-500 text-sm">
                {data.course_name}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#edf7e6] text-[#3a8c25] border border-green-200">
            <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
            {participants.length} participantes
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Registrados</p>
            <p className="text-2xl font-extrabold text-[#049fd9]">{totalRegistered}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Matriculados</p>
            <p className="text-2xl font-extrabold text-[#6cc24a]">{totalEnrolled}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Aprobados</p>
            <p className="text-2xl font-extrabold text-[#3a8c25]">{totalApproved}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Total recaudado</p>
            <p className="text-2xl font-extrabold text-slate-800">${totalPayments.toFixed(2)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-gray-50 text-slate-800 text-sm focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-sm">No se encontraron participantes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Participante</th>
                    <th className="px-5 py-3.5">Cédula</th>
                    <th className="px-5 py-3.5">Teléfono</th>
                    <th className="px-5 py-3.5">Tipo</th>
                    <th className="px-5 py-3.5 text-center">Registrado</th>
                    <th className="px-5 py-3.5 text-center">Matriculado</th>
                    <th className="px-5 py-3.5 text-center">Aprobación</th>
                    <th className="px-5 py-3.5 text-right">Pago total</th>
                    <th className="px-5 py-3.5 text-center">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredParticipants.map((participant, index) => (
                    <tr
                      key={participant.participant_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 text-xs">{index + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{participant.name}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{participant.cid || "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{participant.phone || "—"}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {participant.ParticipantType ? participant.ParticipantType.name : "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BoolBadge value={participant.registered} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BoolBadge value={participant.enrolled} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BoolBadge value={participant.approval} yesText="Aprobado" noText="No" />
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-800">
                        ${parseFloat(participant.total_payment || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BoolBadge value={participant.certificate_required} yesText="Requerido" noText="No" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="5" className="px-5 py-3.5 text-sm font-bold text-slate-800">
                      Totales
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-[#049fd9]">{totalRegistered}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-[#6cc24a]">{totalEnrolled}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-[#3a8c25]">{totalApproved}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-slate-800">
                      ${totalPayments.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/course/${id}/expedient`)}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Volver al expediente
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseParticipantsReportPage;
