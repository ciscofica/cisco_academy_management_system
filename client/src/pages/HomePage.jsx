import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUsers,
  faUserCheck,
  faAward,
  faFileInvoiceDollar,
  faCalendarAlt,
  faChartLine,
  faPrint,
  faExternalLinkAlt,
  faBookOpen,
  faChalkboardTeacher,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getAllCoursesRequest } from "../api/course";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2026");
  const reportPrintRef = useRef(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllCoursesRequest({ limit: 500 })
      .then((res) => {
        const list = res.data?.courses || [];
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Error al cargar cursos para dashboard:", err))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  // Extraer años disponibles basados en fechas de inicio o fin de los cursos
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    courses.forEach((c) => {
      if (c.start_date) {
        const y = new Date(c.start_date).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
      if (c.end_date) {
        const y = new Date(c.end_date).getFullYear();
        if (!isNaN(y)) yearsSet.add(String(y));
      }
    });
    if (yearsSet.size === 0) yearsSet.add("2026");
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [courses]);

  // Filtrar cursos por el año seleccionado (o todos)
  const filteredCourses = useMemo(() => {
    if (selectedYear === "all") return courses;
    return courses.filter((c) => {
      const startY = c.start_date ? String(new Date(c.start_date).getFullYear()) : "";
      const endY = c.end_date ? String(new Date(c.end_date).getFullYear()) : "";
      return startY === selectedYear || endY === selectedYear;
    });
  }, [courses, selectedYear]);

  // Indicadores Estadísticos Calculados
  const stats = useMemo(() => {
    let totalRegistered = 0;
    let totalEnrolled = 0;
    let totalApproved = 0;
    let totalRevenue = 0;
    let inExecution = 0;
    let finished = 0;
    let planning = 0;

    filteredCourses.forEach((c) => {
      const detail = c.Detail || {};
      const participants = c.Participants || [];
      const status = c.status || "Planificado";

      if (status === "En ejecución" || status === "Iniciado") inExecution++;
      else if (status === "Finalizado") finished++;
      else planning++;

      // Alumnos
      const registeredCount = Number(detail.num_registered) || participants.length || 0;
      totalRegistered += registeredCount;

      // Matriculados con factura
      const enrolledCount =
        Number(detail.num_enrolled) ||
        participants.filter((p) => p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number).length ||
        0;
      totalEnrolled += enrolledCount;

      // Aprobados
      const approvedCount = participants.filter((p) => {
        const cp = p.CourseParticipant || {};
        return Boolean(cp.approval || (cp.grade_final !== null && parseFloat(cp.grade_final) >= 70.0) || cp.status_code === "P");
      }).length;
      totalApproved += approvedCount;

      // Facturación estimada / real
      const courseRevenue = enrolledCount * (Number(detail.cost_per_hour ? 69 : 69));
      totalRevenue += courseRevenue;
    });

    const approvalRate = totalEnrolled > 0 ? Math.round((totalApproved / totalEnrolled) * 100) : 0;

    return {
      totalCourses: filteredCourses.length,
      inExecution,
      finished,
      planning,
      totalRegistered,
      totalEnrolled,
      totalApproved,
      approvalRate,
      totalRevenue,
    };
  }, [filteredCourses]);

  const handlePrintAnnualReport = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const parts = String(dateStr).split("T")[0].split("-");
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
      }
      return String(dateStr);
    } catch {
      return String(dateStr);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-130px)] flex items-center justify-center bg-slate-50 px-6">
        <p className="text-sm text-slate-500">Cargando…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-130px)] bg-slate-50 flex flex-col justify-center">
        <section className="py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Plataforma de Gestión de <span className="text-[#6cc24a]">Cursos Cisco</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Facultad de Ingeniería en Ciencias Aplicadas · UTN.
              <br className="hidden sm:inline" />
              Administración centralizada de cursos, estudiantes y certificaciones.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/login" className="px-8 py-3 bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold rounded-full shadow-sm transition-all">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-full border border-slate-300 transition-all">
                Registrarse
              </Link>
            </div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-6 pb-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 text-center md:text-left">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">Cursos y horarios</h2>
              <p className="text-xs text-slate-500 leading-relaxed">Planificación académica, capítulos y modalidades de estudio.</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">Participantes y docentes</h2>
              <p className="text-xs text-slate-500 leading-relaxed">Control de matrículas, roles e instructores asignados.</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">Certificaciones y pagos</h2>
              <p className="text-xs text-slate-500 leading-relaxed">Seguimiento de certificados emitidos y reportes de gestión.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8" ref={reportPrintRef}>
      {/* =================================================================== */}
      {/* ENCABEZADO Y CONTROLES DEL DASHBOARD                                */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm font-bold">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Panel de Control y Resumen Estadístico
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Facultad de Ingeniería en Ciencias Aplicadas (FICA) · Academia Cisco UTN
            </p>
          </div>

          {/* Selector de Año y Botón Reporte */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end print:hidden">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-gray-200 text-xs font-semibold">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-500 ml-2" />
              <span className="text-slate-600">Periodo / Año:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-300 text-slate-800 rounded-xl px-3 py-1 font-bold focus:outline-none focus:border-[#6cc24a]"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Año {yr}
                  </option>
                ))}
                <option value="all">Todos los Años</option>
              </select>
            </div>

            <button
              onClick={handlePrintAnnualReport}
              className="px-4 py-2 bg-[#005073] hover:bg-[#003d57] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              title="Imprimir o exportar reporte estadístico anual en PDF"
            >
              <FontAwesomeIcon icon={faPrint} />
              <span>Reporte Anual ({selectedYear === "all" ? "Histórico" : selectedYear})</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TARJETAS DE INDICADORES ESTADÍSTICOS (KPIs)                          */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Convocatorias Totales */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Convocatorias
              </span>
              <FontAwesomeIcon icon={faBookOpen} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.totalCourses}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {stats.inExecution} en curso · {stats.finished} cerrados
              </p>
            </div>
          </div>

          {/* Inscritos */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Inscritos
              </span>
              <FontAwesomeIcon icon={faUsers} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.totalRegistered}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Aspirantes registrados</p>
            </div>
          </div>

          {/* Matriculados con Factura */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Matriculados
              </span>
              <FontAwesomeIcon icon={faUserCheck} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-800">{stats.totalEnrolled}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Comprobante validado</p>
            </div>
          </div>

          {/* Aprobados NetAcad */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#005073] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#005073]">
                Aprobados
              </span>
              <FontAwesomeIcon icon={faAward} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#005073]">{stats.totalApproved}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Certificación alcanzada</p>
            </div>
          </div>

          {/* Tasa de Aprobación */}
          <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                Tasa de Éxito
              </span>
              <FontAwesomeIcon icon={faGraduationCap} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-purple-900">{stats.approvalRate}%</p>
              <p className="text-[10px] text-purple-600 mt-0.5">Efectividad académica</p>
            </div>
          </div>

          {/* Facturación Total */}
          <div className="bg-white p-5 rounded-2xl border border-green-200 bg-[#edf7e6]/40 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#3a8c25] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3a8c25]">
                Recaudación
              </span>
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-sm" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#3a8c25] mt-0.5 font-semibold">USD cobrados</p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RESUMEN DE CONVOCATORIAS DEL AÑO                                    */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/70">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Convocatorias del Periodo {selectedYear === "all" ? "Histórico Completo" : selectedYear}
              </h2>
              <p className="text-xs text-slate-500">
                Desglose de rendimiento académico y avance por curso
              </p>
            </div>
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              {filteredCourses.length} cursos listados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-gray-200 font-bold">
                <tr>
                  <th className="px-5 py-3">Edición de Curso</th>
                  <th className="px-4 py-3">Docente Instructor</th>
                  <th className="px-4 py-3">Fechas</th>
                  <th className="px-3 py-3 text-center">Inscritos</th>
                  <th className="px-3 py-3 text-center">Matriculados</th>
                  <th className="px-3 py-3 text-center">Aprobados</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Cargando estadísticas de convocatorias...
                    </td>
                  </tr>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => {
                    const detail = c.Detail || {};
                    const inst = detail.Instructor || {};
                    const parts = c.Participants || [];
                    const enrCount =
                      parts.filter((p) => p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number).length ||
                      detail.num_enrolled ||
                      0;
                    const regCount = detail.num_registered || parts.length;
                    const appCount = parts.filter(
                      (p) =>
                        p.CourseParticipant?.approval ||
                        (p.CourseParticipant?.grade_final && parseFloat(p.CourseParticipant.grade_final) >= 70.0)
                    ).length;

                    return (
                      <tr key={c.course_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900 text-xs">{c.course_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{c.course_id}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          {inst.name || "Sin instructor asignado"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatDate(c.start_date)} — {formatDate(c.end_date)}
                        </td>
                        <td className="px-3 py-3.5 text-center font-semibold text-slate-800">
                          {regCount}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-emerald-700">
                          {enrCount}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-[#005073]">
                          {appCount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              c.status === "Finalizado"
                                ? "bg-slate-100 text-slate-700 border-slate-300"
                                : c.status === "En ejecución"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {c.status || "Planificado"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/course/${c.course_id}/expedient`}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#6cc24a] hover:text-white text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            <span>Expediente</span>
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                      No se registraron convocatorias de cursos para el año {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================================== */}
        {/* ACCESOS RÁPIDOS A MÓDULOS DEL SISTEMA                               */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
          <Link
            to="/courses"
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-[#6cc24a] hover:shadow-md transition-all group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#edf7e6] group-hover:text-[#3a8c25] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">Catálogo de Cursos</p>
              <p className="text-[10px] text-slate-400">Ver y aperturar ediciones</p>
            </div>
          </Link>

          <Link
            to="/payments"
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-[#6cc24a] hover:shadow-md transition-all group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#edf7e6] group-hover:text-[#3a8c25] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">Facturación y Pagos</p>
              <p className="text-[10px] text-slate-400">Reporte de cobros y facturas</p>
            </div>
          </Link>

          <Link
            to="/participants"
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-[#6cc24a] hover:shadow-md transition-all group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#edf7e6] group-hover:text-[#3a8c25] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">Participantes</p>
              <p className="text-[10px] text-slate-400">Carrera, nivel y empresa</p>
            </div>
          </Link>

          <Link
            to="/certificates"
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-[#6cc24a] hover:shadow-md transition-all group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#edf7e6] group-hover:text-[#3a8c25] flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">Certificados</p>
              <p className="text-[10px] text-slate-400">Firmas y acreditaciones</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
