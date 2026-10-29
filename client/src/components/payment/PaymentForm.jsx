import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { usePaymentType } from "../../context/PaymentTypeContext";
import { useParticipant } from "../../context/ParticipantContext";
import { usePayment } from "../../context/PaymentContext";

function PaymentForm({ onClose, payment }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createPayment, updatePayment } = usePayment();

    const { paymentTypes, getPaymentTypesDropdown } = usePaymentType();
    const { participants, getParticipantsDropdown } = useParticipant();
    
    const [selectedPaymentType, setSelectedPaymentType] = useState("");
    const [selectedParticipant, setSelectedParticipant] = useState("");

    useEffect(() => {
        getPaymentTypesDropdown();
        getParticipantsDropdown();

        if (payment) {
            setValue("description", payment.description);
            setValue("amount", payment.amount);
            setSelectedPaymentType(payment.payment_type_id);
            setSelectedParticipant(payment.Participants[0]?.participant_id);
        }
    }, [payment, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (payment) {
            updatePayment({ ...data, id: payment.payment_id, participant_id: selectedParticipant });
        } else {
            createPayment({ ...data, payment_type_id: selectedPaymentType, participant_id: selectedParticipant });
        }
        if (onClose) onClose();
    });

    const handleSelected = (id) => {
        setSelectedPaymentType(id);
    };

    const handleSelectedParticipant = (id) => {
        setSelectedParticipant(id);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 relative">
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
                {payment ? "Editar Pago" : "Nuevo Pago"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Participante</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedParticipant}
                        onChange={(e) => handleSelectedParticipant(e.target.value)}
                    >
                        <option value="">Seleccionar Participante</option>
                        {participants.map((participant) => (
                            <option key={participant.participant_id} value={participant.participant_id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Pago</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedPaymentType}
                        onChange={(e) => handleSelected(e.target.value)}
                    >
                        <option value="">Seleccionar Tipo de Pago</option>
                        {paymentTypes.map((payment_type) => (
                            <option key={payment_type.payment_type_id} value={payment_type.payment_type_id}>
                                {payment_type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Monto ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 50.00"
                        {...register("amount", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción</label>
                    <textarea
                        rows={3}
                        placeholder="Detalle o referencia del comprobante"
                        {...register("description")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-3"
                >
                    Guardar
                </button>
            </form>
        </div>
    );
}

export default PaymentForm;
