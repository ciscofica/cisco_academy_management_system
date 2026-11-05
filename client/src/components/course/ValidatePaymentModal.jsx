import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileInvoiceDollar,
  faCheckCircle,
  faSpinner,
  faUser,
  faIdCard,
  faCalendarAlt,
  faDollarSign,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { validateParticipantPaymentRequest } from "../../api/course";
import { getPaymentsDropdownRequest } from "../../api/payment";

export default function ValidatePaymentModal({
  isOpen,
  onClose,
  courseId,
  participant,
  onValidated,
}) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerCidRuc, setPayerCidRuc] = useState("");
  const [amount, setAmount] = useState(69.0);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [availablePayments, setAvailablePayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAlreadyEnrolled = Boolean(
    participant?.CourseParticipant?.enrolled && participant?.CourseParticipant?.invoice_number
  );

  useEffect(() => {
    if (isOpen && participant) {
      const currentInvoice =
        participant?.CourseParticipant?.invoice_number ||
        participant?.invoice_number ||
        "";
      const currentAmount =
        participant?.CourseParticipant?.total_payment ||
        participant?.total_payment ||
        69.0;
      const today = new Date().toISOString().split("T")[0];

      setInvoiceNumber(currentInvoice);
      setPayerName(participant.name || "");
      setPayerCidRuc(participant.cid || "");
      setAmount(Number(currentAmount) || 69.0);
      setInvoiceDate(participant?.CourseParticipant?.validation_date || today);

      fetchAvailablePayments();
    }
  }, [isOpen, participant]);

  const fetchAvailablePayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await getPaymentsDropdownRequest();
      setAvailablePayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al obtener lista de facturas:", err);
      setAvailablePayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  if (!isOpen || !participant) return null;

  // Si el usuario escribe o selecciona un número de factura existente, auto-completar los datos
  const handleInvoiceNumberChange = (val) => {
    setInvoiceNumber(val);
    const matched = availablePayments.find(
      (p) =>
        p.invoice_number &&
        p.invoice_number.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      if (matched.payer_name) setPayerName(matched.payer_name);
      if (matched.payer_cid_ruc) setPayerCidRuc(matched.payer_cid_ruc);
      if (matched.amount) setAmount(Number(matched.amount));
      if (matched.invoice_date) setInvoiceDate(matched.invoice_date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanInvoice = invoiceNumber.trim();
    if (!cleanInvoice) {
      Swal.fire({
        icon: "warning",
        title: "Número de factura requerido",
        text: "Debe ingresar el número de factura para formalizar la matrícula del estudiante.",
        confirmButtonColor: "#6cc24a",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        invoice_number: cleanInvoice,
        payer_name: payerName.trim() || participant.name,
        payer_cid_ruc: payerCidRuc.trim() || participant.cid,
        amount: parseFloat(amount) || 69.0,
        invoice_date: invoiceDate || new Date().toISOString().split("T")[0],
        enrolled: true,
      };

      const res = await validateParticipantPaymentRequest(
        courseId,
        participant.participant_id,
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Matrícula Formalizada",
        text:
          res.data.message ||
          `El estudiante ha sido matriculado con la factura N° ${cleanInvoice}.`,
        confirmButtonColor: "#6cc24a",
      });

      if (onValidated) onValidated();
      onClose();
    } catch (err) {
      console.error("Error al registrar factura del estudiante:", err);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text:
          err.response?.data?.message ||
          "No se pudo completar el registro de la matrícula.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async () => {
    const result = await Swal.fire({
      title: "¿Anular matrícula?",
      text: "El estudiante volverá a estado 'Inscrito (Pendiente Factura)' y se desvinculará este comprobante.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, anular matrícula",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await validateParticipantPaymentRequest(
        courseId,
        participant.participant_id,
        {
          invoice_number: invoiceNumber || "ANULADO",
          enrolled: false,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Matrícula revertida",
        text: "El estudiante ha retornado a estado pendiente de pago.",
        confirmButtonColor: "#6cc24a",
      });

      if (onValidated) onValidated();
      onClose();
    } catch (err) {
      console.error("Error al anular matrícula:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo anular la matrícula.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isAlreadyEnrolled ? "Modificar Factura / Matrícula" : "Registrar Factura y Matricular"}
              </h2>
              <p className="text-xs text-slate-500">
                Ingreso de comprobante para asentar matrícula definitiva
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Student Summary Info */}
        <div className="px-5 py-3.5 bg-slate-100/80 border-b border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-500">Estudiante: </span>
            <span className="font-bold text-slate-800">{participant.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600">CI: {participant.cid}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isAlreadyEnrolled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isAlreadyEnrolled ? "Matriculado" : "Pendiente de Factura"}
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Número de Factura */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Factura *
            </label>
            <input
              list="existing-invoices-list"
              type="text"
              placeholder="Ej: 001-001-000100619 o 100619"
              value={invoiceNumber}
              onChange={(e) => handleInvoiceNumberChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition shadow-xs"
              required
              autoFocus
            />
            <datalist id="existing-invoices-list">
              {availablePayments.map((p) => (
                <option key={p.payment_id} value={p.invoice_number}>
                  {p.invoice_number} - {p.payer_name || "Cliente"} (${Number(p.amount || 0).toFixed(2)})
                </option>
              ))}
            </datalist>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Ingrese el número emitido en el comprobante contable.
            </span>
          </div>

          {/* Razón Social / Titular y Cédula/RUC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-1 text-slate-400 text-[10px]" />
                Razón Social / Titular Factura *
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Nombre o empresa a facturar"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-1 text-slate-400 text-[10px]" />
                RUC / Cédula del Titular *
              </label>
              <input
                type="text"
                value={payerCidRuc}
                onChange={(e) => setPayerCidRuc(e.target.value)}
                placeholder="Cédula o RUC"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                required
              />
            </div>
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-slate-400 text-[10px]" />
                Monto Facturado (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold text-xs focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-slate-400 text-[10px]" />
                Fecha de Emisión *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                required
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {isAlreadyEnrolled ? (
              <button
                type="button"
                onClick={handleUnenroll}
                disabled={saving}
                className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                title="Desvincular factura y volver a pendiente"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Anular Matrícula</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#6cc24a] hover:bg-[#5aad3a] disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon
                  icon={saving ? faSpinner : faCheckCircle}
                  className={saving ? "animate-spin" : ""}
                />
                {saving
                  ? "Guardando..."
                  : isAlreadyEnrolled
                  ? "Actualizar Factura"
                  : "Guardar Factura y Matricular"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
