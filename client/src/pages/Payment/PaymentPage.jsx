import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faArrowLeft,
  faSearch,
  faPlus,
  faCalendarAlt,
  faFileInvoiceDollar,
  faChevronRight,
  faHourglassHalf,
  faUsers,
  faUserCheck,
  faReceipt,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { usePayment } from "../../context/PaymentContext";
import { getAllCoursesRequest, getCourseExpedientRequest, exportCoursePaymentsExcelRequest } from "../../api/course";
import RegisterPaymentModal from "../Payment/RegisterPaymentModal";
import { useAuth } from "../../context/AuthContext";

export default function PaymentPage() {
  const { user } = useAuth();
  const role = user?.userExists?.Role || user?.user?.Role;
  const rolePermissions = (role?.Permissions || []).filter((permission) => permission.status === "Activo" || permission.status === "1").map((permission) => permission.name);
  const canManagePayments = role?.name === "Administrador" || rolePermissions.includes("Gestionar pagos");
  const isReadOnly = (rolePermissions.includes("Consultar información") || rolePermissions.includes("Consultar dashboard")) && !canManagePayments;
  const {
    payments,
    getPayments,
    deletePayment,
    totalPages,
    currentPage,
    setCurrentPage,
  } = usePayment();

  // Nivel 1: Selección de Edición
  const [editions, setEditions] = useState([]);
  const [loadingEditions, setLoadingEditions] = useState(true);
  const [editionSearch, setEditionSearch] = useState("");
  const [selectedEdition, setSelectedEdition] = useState(null);

  // Nivel 2: Datos del Curso y Estudiantes
  const [expedientData, setExpedientData] = useState(null);

  // Modales
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Búsqueda de facturas generales en Tab de Facturación (CRUD)
  const [paymentSearch, setPaymentSearch] = useState("");

  const downloadPaymentsExcel = async () => {
    try {
      const response = await exportCoursePaymentsExcelRequest(selectedEdition.course_id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Facturacion_${selectedEdition.course_id}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("No se pudo exportar el reporte de facturación:", error);
    }
  };

  // Cargar ediciones operativas (status != 'Plantilla')
  useEffect(() => {
    setLoadingEditions(true);
    getAllCoursesRequest({ limit: 100 })
      .then((res) => {
        const list = res.data?.courses || [];
        setEditions(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Error al cargar ediciones de cursos:", err))
      .finally(() => setLoadingEditions(false));
  }, []);

  // Cargar estudiantes y expediente de la edición seleccionada
  const loadEditionData = (courseId) => {
    if (!courseId) return;
    getCourseExpedientRequest(courseId)
      .then((res) => {
        setExpedientData(res.data?.course || null);
      })
      .catch((err) => console.error("Error al cargar resumen de la edición:", err));
  };

  // Cargar pagos de la edición
  useEffect(() => {
    if (selectedEdition) {
      loadEditionData(selectedEdition.course_id);
      getPayments({
        search: paymentSearch,
        page: currentPage,
        course_id: selectedEdition.course_id,
      });
    }
  }, [selectedEdition, paymentSearch, currentPage]);

  const handleEditionSelect = (edition) => {
    setSelectedEdition(edition);
    setPaymentSearch("");
    setCurrentPage(1);
  };

  const handleBackToEditions = () => {
    setSelectedEdition(null);
    setExpedientData(null);
    setPaymentSearch("");
    setCurrentPage(1);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsRegisterModalOpen(true);
  };

  const handleDeletePayment = (paymentId) => {
    deletePayment(paymentId);
    if (selectedEdition) {
      setTimeout(() => loadEditionData(selectedEdition.course_id), 400);
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "En ejecución":
      case "Iniciado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "En inscripción":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Finalizado":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  // Filtrado de ediciones en Nivel 1
  const filteredEditions = editions.filter((e) => {
    const q = editionSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.course_name || "").toLowerCase().includes(q) ||
      (e.status || "").toLowerCase().includes(q)
    );
  });

  // Participantes de la edición seleccionada
  const participants = expedientData?.Participants || [];

  // Métricas calculadas para la edición: MATRICULADOS son SOLO quienes tienen factura y enrolled=true en esta edición
  const totalRegistered = participants.length;
  const enrolledParticipants = participants.filter((p) => {
    const cp = p.CourseParticipant;
    return Boolean(cp && cp.enrolled && cp.invoice_number);
  });
  const totalEnrolled = enrolledParticipants.length;
  const totalPending = totalRegistered - totalEnrolled;

  // Total recaudado sumando pagos registrados
  const totalCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  }, [payments]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* ==================================================================== */}
      {/* NIVEL 1: SELECCIÓN DE EDICIÓN DEL CURSO                             */}
      {/* ==================================================================== */}
      {!selectedEdition ? (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl shadow-xs">
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {isReadOnly ? "Consulta de Facturación y Pagos" : "Gestión de Facturación y Pagos"}
                </h1>
                <p className="text-xs text-slate-500">
                  Seleccione una edición para consultar sus facturas y cobros
                </p>
              </div>
            </div>

            {/* Buscador de ediciones */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar edición o convocatoria..."
                value={editionSearch}
                onChange={(e) => setEditionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition text-xs shadow-xs"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-slate-400 text-xs pointer-events-none"
              />
            </div>
          </div>

          {/* Grid de Ediciones */}
          {loadingEditions ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Cargando ediciones de cursos disponibles...
            </div>
          ) : filteredEditions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEditions.map((edition) => (
                <div
                  key={edition.course_id}
                  onClick={() => handleEditionSelect(edition)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-[#6cc24a] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        #ED-{edition.course_id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          edition.status
                        )}`}
                      >
                        {edition.status || "Planificado"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#3a8c25] transition-colors leading-snug">
                      {edition.course_name}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-2 pt-1 border-t border-gray-100">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-slate-400 text-[11px]"
                      />
                      <span>
                        {formatDate(edition.start_date)} —{" "}
                        {formatDate(edition.end_date)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#3a8c25] group-hover:translate-x-0.5 transition-transform">
                    <span>Gestionar Facturación</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-slate-400 text-sm">
              No se encontraron ediciones de curso con el término ingresado.
            </div>
          )}
        </div>
      ) : (
        /* ==================================================================== */
        /* NIVEL 2: VISTA DE FACTURACIÓN Y MATRÍCULAS                           */
        /* ==================================================================== */
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar con Botón Volver y Edición Activa */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToEditions}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-xs"
                title="Volver a la selección de ediciones"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-800">
                    {selectedEdition.course_name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      selectedEdition.status
                    )}`}
                  >
                    {selectedEdition.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isReadOnly ? "Consulta de facturas y cobros; no se pueden modificar registros." : "Gestión integral de facturas y vinculación con estudiantes matriculados"}
                </p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isReadOnly && <Link
                to={`/course/${selectedEdition.course_id}/expedient`}
                className="px-3.5 py-2 rounded-xl text-slate-600 bg-slate-50 border border-gray-200 hover:bg-gray-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Ver expediente académico y notas"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                <span>Expediente</span>
              </Link>}
              {!isReadOnly && <button
                onClick={() => {
                  setSelectedPayment(null);
                  setIsRegisterModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Nueva Factura</span>
              </button>}

            </div>
          </div>

          {/* Tarjetas de Resumen / Métricas de la Edición */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Inscritos Totales</p>
                <p className="text-lg font-bold text-slate-800">{totalRegistered}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faUserCheck} />
              </div>
              <div>
                <p className="text-[11px] text-emerald-700 font-medium">Matriculados (Factura)</p>
                <p className="text-lg font-bold text-emerald-800">{totalEnrolled}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faHourglassHalf} />
              </div>
              <div>
                <p className="text-[11px] text-amber-700 font-medium">Pendientes de Pago</p>
                <p className="text-lg font-bold text-amber-800">{totalPending}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#049fd9] flex items-center justify-center text-base">
                <FontAwesomeIcon icon={faReceipt} />
              </div>
              <div>
                <p className="text-[11px] text-blue-700 font-medium">Total Facturado</p>
                <p className="text-lg font-bold text-slate-800">
                  ${totalCollected.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-sm font-bold text-slate-700">Facturas registradas ({payments.length})</h2>
          </div>

          {/* Listado de facturas */}
          <div className="space-y-4">
              {/* Barra de Filtro de Facturas */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Buscar por N° factura, RUC, o titular..."
                    value={paymentSearch}
                    onChange={(e) => {
                      setPaymentSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition text-xs shadow-xs"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-3 text-slate-400 text-xs pointer-events-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {!isReadOnly && <button
                    onClick={() => {
                      setSelectedPayment(null);
                      setIsRegisterModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Agregar Factura</span>
                  </button>}
                  <button onClick={downloadPaymentsExcel} className="px-3.5 py-1.5 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    <span>Descargar Excel</span>
                  </button>
                </div>
              </div>

              {/* Contenedor de la Tabla con Encabezado Institucional */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Cabecera Estilo Reporte Cisco (como la imagen del usuario) */}
                <div className="bg-[#d5ebd0] text-[#1b4317] font-bold text-center py-2.5 px-4 text-xs sm:text-sm border-b border-[#b7dfad] tracking-wide">
                  Reporte de facturación Cisco {selectedEdition.course_name}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="text-[11px] text-slate-700 uppercase bg-[#eef7ec] border-b border-[#b7dfad] font-bold">
                      <tr>
                        <th scope="col" className="px-3 py-2.5 text-center">FACTURA</th>
                        <th scope="col" className="px-3 py-2.5 text-center">FECHA</th>
                        <th scope="col" className="px-3 py-2.5">RUC</th>
                        <th scope="col" className="px-3 py-2.5">APELLIDOS / EMPRESA</th>
                        <th scope="col" className="px-3 py-2.5">NOMBRE</th>
                        <th scope="col" className="px-2 py-2.5 text-center">CANT</th>
                        <th scope="col" className="px-3 py-2.5 text-right">VALOR U</th>
                        <th scope="col" className="px-3 py-2.5 text-right">V. TOTAL</th>
                        <th scope="col" className="px-3 py-2.5 text-right">IVA</th>
                        <th scope="col" className="px-3 py-2.5 text-right">TOTAL</th>
                        <th scope="col" className="px-2 py-2.5 text-center">PROYECTO</th>
                        {!isReadOnly && <th scope="col" className="px-3 py-2.5 text-center">ACCIONES</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.isArray(payments) && payments.length > 0 ? (
                        payments.map((payment) => {
                          const linkedStudent = payment.Participants && payment.Participants[0];
                          const titularCid =
                            payment.payer_cid_ruc ||
                            (linkedStudent ? linkedStudent.cid : "—");
                          const fullPayerName =
                            payment.payer_name ||
                            (linkedStudent ? linkedStudent.name : "—");

                          // Si hay estudiante vinculado o el nombre viene completo, dividimos en Apellidos y Nombre
                          let apellidos = fullPayerName;
                          let nombres = linkedStudent ? linkedStudent.name : fullPayerName;

                          const numAmount = parseFloat(payment.amount) || 0;
                          const numSubtotal =
                            payment.subtotal !== null && payment.subtotal !== undefined
                              ? parseFloat(payment.subtotal)
                              : parseFloat((numAmount / 1.15).toFixed(2));
                          const numIva =
                            payment.iva !== null && payment.iva !== undefined
                              ? parseFloat(payment.iva)
                              : parseFloat((numAmount - numSubtotal).toFixed(2));

                          return (
                            <tr
                              key={payment.payment_id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-3 py-2.5 font-mono font-bold text-slate-800 text-center">
                                {payment.invoice_number || "S/N"}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600 text-center whitespace-nowrap">
                                {formatDate(payment.invoice_date)}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-700">
                                {titularCid}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-slate-800">
                                {apellidos}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700">
                                {nombres}
                              </td>
                              <td className="px-2 py-2.5 text-center font-medium">
                                1
                              </td>
                              <td className="px-3 py-2.5 text-right text-slate-700 font-medium">
                                ${numSubtotal.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-slate-700 font-medium">
                                ${numSubtotal.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-slate-700">
                                ${numIva.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                                ${numAmount.toFixed(2)}
                              </td>
                              <td className="px-2 py-2.5 text-center font-mono text-slate-600">
                                {payment.project_code || "0607"}
                              </td>
                              {!isReadOnly && <td className="px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    className="text-amber-600 hover:text-amber-700 p-1 rounded hover:bg-amber-50 transition-colors"
                                    onClick={() => handleEditPayment(payment)}
                                    title="Editar Factura"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                    onClick={() => handleDeletePayment(payment.payment_id)}
                                    title="Eliminar Factura"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={isReadOnly ? 11 : 12}
                            className="px-6 py-14 text-center text-slate-400 italic"
                          >
                            No se registran comprobantes de pago en esta edición aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {/* Fila de Totales como en el Excel institucional */}
                    {payments.length > 0 && (
                      <tfoot className="bg-[#f2faf0] border-t-2 border-[#b7dfad] font-bold text-slate-800">
                        <tr>
                          <td colSpan="5" className="px-3 py-2.5 text-right uppercase tracking-wider text-xs">
                            TOTAL
                          </td>
                          <td className="px-2 py-2.5 text-center text-xs">
                            {payments.length}
                          </td>
                          <td colSpan="3" className="px-3 py-2.5"></td>
                          <td className="px-3 py-2.5 text-right text-xs font-bold text-slate-900">
                            ${totalCollected.toFixed(2)}
                          </td>
                          <td colSpan={isReadOnly ? 1 : 2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center py-3 border-t border-gray-100 space-x-3 bg-slate-50">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        currentPage === 1
                          ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "border-gray-300 text-slate-600 hover:bg-white transition-colors"
                      }`}
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-slate-500">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        currentPage === totalPages
                          ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "border-gray-300 text-slate-600 hover:bg-white transition-colors"
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
          </div>

          {/* Modal para Crear / Editar Factura vinculado a esta edición */}
          {!isReadOnly && <RegisterPaymentModal
            isOpen={isRegisterModalOpen}
            onClose={() => {
              setIsRegisterModalOpen(false);
              loadEditionData(selectedEdition.course_id);
              getPayments({
                search: paymentSearch,
                page: currentPage,
                course_id: selectedEdition.course_id,
              });
            }}
            payment={selectedPayment}
            defaultCourseId={selectedEdition.course_id}
          />}

        </div>
      )}
    </div>
  );
}
