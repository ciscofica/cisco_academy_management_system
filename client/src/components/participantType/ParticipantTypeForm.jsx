import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useParticipantType } from "../../context/ParticipantTypeContext";

function ParticipantTypeForm({ onClose, participant_type }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createParticipantType, updateParticipantType } = useParticipantType();

    useEffect(() => {
        if (participant_type) {
            setValue("name", participant_type.name);
            setValue("status", participant_type.status);
        }
    }, [participant_type, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (participant_type) {
            updateParticipantType({ ...data, id: participant_type.participant_type_id });
        } else {
            createParticipantType(data);
        }
        if (onClose) onClose();
    });

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
                {participant_type ? "Editar Tipo de Participante" : "Nuevo Tipo de Participante"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nombre</label>
                    <input
                        type="text"
                        placeholder="Ej: Estudiante UTN, Público General"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-2"
                >
                    Guardar
                </button>
            </form>
        </div>
    );
}

export default ParticipantTypeForm;
