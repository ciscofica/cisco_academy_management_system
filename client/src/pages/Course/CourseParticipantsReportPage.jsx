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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        value
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <FontAwesomeIcon icon={value ? faCheckCircle : faTimesCircle} className="text-[10px]" />
      {value ? yesText : noText}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-red-600 text-3xl animate-spin mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">No se pudo cargar el reporte de participantes.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(`/course/${id}/expedient`)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver al expediente
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faUsers} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Participantes del curso
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {data.course_name}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
            {participants.length} participantes
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Registrados</p>
            <p className="text-2xl font-bold text-teal-600">{totalRegistered}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Matriculados</p>
            <p className="text-2xl font-bold text-indigo-600">{totalEnrolled}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aprobados</p>
            <p className="text-2xl font-bold text-green-600">{totalApproved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total recaudado</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">${totalPayments.toFixed(2)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 dark:text-gray-500">No se encontraron participantes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">#</th>
                    <th className="px-5 py-3.5 font-semibold">Participante</th>
                    <th className="px-5 py-3.5 font-semibold">Cédula</th>
                    <th className="px-5 py-3.5 font-semibold">Teléfono</th>
                    <th className="px-5 py-3.5 font-semibold">Tipo</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Registrado</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Matriculado</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Aprobación</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Pago total</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredParticipants.map((participant, index) => (
                    <tr
                      key={participant.participant_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 dark:text-white">{participant.name}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{participant.cid || "—"}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{participant.phone || "—"}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
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
                      <td className="px-5 py-4 text-right font-medium text-gray-800 dark:text-white">
                        ${parseFloat(participant.total_payment || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BoolBadge value={participant.certificate_required} yesText="Requerido" noText="No" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <td colSpan="5" className="px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Totales
                    </td>
                    <td className="px-5 py-3 text-center text-sm font-semibold text-teal-600">{totalRegistered}</td>
                    <td className="px-5 py-3 text-center text-sm font-semibold text-indigo-600">{totalEnrolled}</td>
                    <td className="px-5 py-3 text-center text-sm font-semibold text-green-600">{totalApproved}</td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-gray-800 dark:text-white">
                      ${totalPayments.toFixed(2)}
                    </td>
                    <td className="px-5 py-3"></td>
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
            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Volver al expediente
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseParticipantsReportPage;
