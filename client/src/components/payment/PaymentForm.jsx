import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { usePaymentType } from "../../context/PaymentTypeContext";
import { useParticipant } from "../../context/ParticipantContext";
import { usePayment } from "../../context/PaymentContext";
import { getAllCoursesRequest } from "../../api/course";

function PaymentForm({ onClose, payment, defaultCourseId }) {
    const { register, handleSubmit, setValue, watch } = useForm();
    const { createPayment, updatePayment } = usePayment();

    const { paymentTypes, getPaymentTypesDropdown } = usePaymentType();
    const { participants, getParticipantsDropdown } = useParticipant();
    
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(defaultCourseId || "");
    const [selectedPaymentType, setSelectedPaymentType] = useState("");
    const [selectedParticipant, setSelectedParticipant] = useState("");

    const watchedAmount = watch("amount");

    useEffect(() => {
        getPaymentTypesDropdown();
        getParticipantsDropdown();
        getAllCoursesRequest({ limit: 100 })
            .then((res) => {
                const list = res.data?.courses || [];
                setCourses(Array.isArray(list) ? list : []);
            })
            .catch((err) => console.error("Error al cargar ediciones:", err));

        if (payment) {
            setValue("invoice_number", payment.invoice_number || "");
            setValue("invoice_date", payment.invoice_date || "");
            setValue("payer_name", payment.payer_name || "");
            setValue("payer_cid_ruc", payment.payer_cid_ruc || "");
            setValue("subtotal", payment.subtotal || "");
            setValue("iva", payment.iva || "");
            setValue("amount", payment.amount || "");
            setValue("project_code", payment.project_code || "0607");
            setValue("description", payment.description || "");
            setSelectedCourse(payment.course_id || "");
            setSelectedPaymentType(payment.payment_type_id || "");
            setSelectedParticipant(payment.Participants?.[0]?.participant_id || "");
        } else {
            setValue("invoice_date", new Date().toISOString().split("T")[0]);
            setValue("project_code", "0607");
            if (defaultCourseId) {
                setSelectedCourse(defaultCourseId);
            }
        }
    }, [payment, defaultCourseId, setValue]);

    // Calcular automáticamente subtotal e iva según el monto ingresado
    useEffect(() => {
        if (watchedAmount !== undefined && watchedAmount !== null && watchedAmount !== "") {
            const num = parseFloat(watchedAmount);
            if (!isNaN(num) && num > 0) {
                const sub = parseFloat((num / 1.15).toFixed(2));
                const iv = parseFloat((num - sub).toFixed(2));
                setValue("subtotal", sub);
                setValue("iva", iv);
            }
        }
    }, [watchedAmount, setValue]);

    const onSubmit = handleSubmit((data) => {
        const payload = {
            ...data,
            course_id: selectedCourse || null,
            payment_type_id: selectedPaymentType || 1,
            participant_id: selectedParticipant || null,
            project_code: data.project_code || "0607",
        };
        if (payment) {
            updatePayment({ ...payload, id: payment.payment_id });
        } else {
            createPayment(payload);
        }
        if (onClose) onClose();
    });

    const handleSelected = (id) => {
        setSelectedPaymentType(id);
    };

    const handleSelectedParticipant = (id) => {
        setSelectedParticipant(id);
        const part = participants.find((p) => String(p.participant_id) === String(id));
        if (part) {
            setValue("payer_name", part.name || "");
            setValue("payer_cid_ruc", part.cid || "");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center absolute top-4 right-4 transition-colors font-semibold"
                >
                    ✕
                </button>
            )}

            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
                {payment ? "Editar Factura" : "Registrar Nueva Factura"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                {/* Selector de Edición de Curso */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Edición del Curso *
                    </label>
                    {defaultCourseId && courses.find((c) => String(c.course_id) === String(defaultCourseId)) ? (
                        <div className="bg-slate-100 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold flex items-center justify-between">
                            <span>{courses.find((c) => String(c.course_id) === String(defaultCourseId))?.course_name}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Edición Actual</span>
                        </div>
                    ) : (
                        <select
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar Edición de Curso</option>
                            {courses.map((c) => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name} ({c.status})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">N° de Factura *</label>
                        <input
                            type="text"
                            placeholder="Ej: 100619"
                            {...register("invoice_number", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 font-mono text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha de Emisión</label>
                        <input
                            type="date"
                            {...register("invoice_date")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">RUC / Cédula del Titular *</label>
                        <input
                            type="text"
                            placeholder="Ej: 1004235634"
                            {...register("payer_cid_ruc", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Razón Social / Titular Factura *</label>
                        <input
                            type="text"
                            placeholder="Ej: ATUPAÑA DYLAN"
                            {...register("payer_name", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            required
                        />
                    </div>
                </div>

                {/* Subtotal, IVA, Total y Proyecto */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Valor Unit / Subtotal</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="60.00"
                            {...register("subtotal")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">IVA (15%)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="9.00"
                            {...register("iva")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Monto Total ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="69.00"
                            {...register("amount", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-900 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Código de Proyecto</label>
                        <input
                            type="text"
                            placeholder="0607"
                            {...register("project_code")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 font-mono text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Pago</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                            value={selectedPaymentType}
                            onChange={(e) => handleSelected(e.target.value)}
                        >
                            <option value="">Seleccionar Tipo</option>
                            {paymentTypes.map((payment_type) => (
                                <option key={payment_type.payment_type_id} value={payment_type.payment_type_id}>
                                    {payment_type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Estudiante Vinculado (Opcional)</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedParticipant}
                        onChange={(e) => handleSelectedParticipant(e.target.value)}
                    >
                        <option value="">Seleccionar Estudiante</option>
                        {participants.map((participant) => (
                            <option key={participant.participant_id} value={participant.participant_id}>
                                {participant.name} ({participant.cid})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción / Concepto</label>
                    <textarea
                        rows={2}
                        placeholder="Detalle o referencia del comprobante"
                        {...register("description")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-3"
                >
                    {payment ? "Actualizar Factura" : "Guardar Factura"}
                </button>
            </form>
        </div>
    );
}

export default PaymentForm;
