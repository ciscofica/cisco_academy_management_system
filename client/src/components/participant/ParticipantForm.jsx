import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParticipantType } from "../../context/ParticipantTypeContext";
import { useCourse } from "../../context/CourseContext";
import { useParticipant } from "../../context/ParticipantContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";

function ParticipantForm({ onClose, participant }) {
    const { register, handleSubmit, setValue } = useForm();
    const { participant_types, getParticipantTypesDropdown } = useParticipantType();
    const { courses, getCoursesDropdown } = useCourse();

    const { createParticipant, updateParticipant } = useParticipant();
    const [selectedParticipantType, setSelectedParticipantType] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        getParticipantTypesDropdown();
        getCoursesDropdown();

        if (participant) {
            setValue("name", participant.name);
            setValue("age", participant.age);
            setValue("cid", participant.cid);
            setValue("phone", participant.phone);
            setValue("address", participant.address);
            setValue("institution", participant.institution);
            setValue("file_url", participant.file_url);
            setValue("certificate_required", participant.certificate_required);
            setValue("registered", participant.registered);
            setValue("enrolled", participant.enrolled);
            setValue("approval", participant.approval);
            setValue("total_payment", participant.total_payment);
            setValue("active", participant.active);

            if (participant.ParticipantType) {
                setSelectedParticipantType(participant.ParticipantType.participant_type_id);
            } else {
                setSelectedParticipantType("");
            }

            setSelectedCourse(participant.Courses[0]?.course_id);
        }
    }, [participant, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (participant) {
            updateParticipant({ ...data, id: participant.participant_id, course_id: selectedCourse });
        } else {
            createParticipant({ ...data });
        }
        if (onClose) onClose();
    });

    const handleSelected = (id) => {
        setSelectedParticipantType(id);
    };

    const handleSelectedCourse = (course_id) => {
        setSelectedCourse(course_id);
    };

    const handleCopy = () => {
        const urlInput = document.getElementById("file_url_input");
        if (urlInput) {
            navigator.clipboard.writeText(urlInput.value);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "URL copiada al portapapeles",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
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
                {participant ? "Editar Participante" : "Nuevo Participante"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                {participant && (
                    <div className="flex items-center gap-2 py-1">
                        <label className="text-sm font-medium text-emerald-700 flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value={true}
                                {...register("active")}
                                className="accent-[#6cc24a] w-4 h-4 rounded"
                            />
                            Participante Activo
                        </label>
                    </div>
                )}

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        placeholder="Ej: Ana Lucía Torres"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cédula de Identidad</label>
                    <input
                        type="text"
                        placeholder="Ej: 1004567890"
                        {...register("cid")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Teléfono</label>
                    <input
                        type="text"
                        placeholder="Ej: 0991234567"
                        {...register("phone")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Dirección</label>
                    <input
                        type="text"
                        placeholder="Ej: Ibarra, Imbabura"
                        {...register("address")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Institución / Empresa</label>
                    <input
                        type="text"
                        placeholder="Ej: Universidad Técnica del Norte"
                        {...register("institution")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Participante</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedParticipantType}
                        onChange={(e) => handleSelected(e.target.value)}
                    >
                        <option value="">Seleccionar Tipo de Participante</option>
                        {participant_types.map((participant_type) => (
                            <option key={participant_type.participant_type_id} value={participant_type.participant_type_id}>
                                {participant_type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedCourse}
                        onChange={(e) => handleSelectedCourse(e.target.value)}
                    >
                        <option value="">Seleccionar Curso</option>
                        {courses.map((course) => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">URL de Archivo</label>
                    <div className="flex items-center bg-gray-50 border border-gray-300 px-3 py-2 rounded-xl focus-within:border-[#6cc24a] focus-within:ring-2 focus-within:ring-[#6cc24a]/20 transition">
                        <input
                            type="text"
                            id="file_url_input"
                            placeholder="https://..."
                            {...register("file_url")}
                            className="w-full bg-transparent text-slate-800 text-sm outline-none placeholder-slate-400"
                        />
                        <button
                            type="button"
                            onClick={handleCopy}
                            title="Copiar URL"
                            className="ml-2 text-slate-400 hover:text-[#049fd9] transition-colors"
                        >
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                    </div>
                </div>

                {/* Checkboxes de estado */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2.5 rounded-xl">
                        <input
                            type="checkbox"
                            value={true}
                            {...register("certificate_required")}
                            className="accent-[#6cc24a] w-4 h-4 rounded"
                        />
                        Certificado
                    </label>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2.5 rounded-xl">
                        <input
                            type="checkbox"
                            value={true}
                            {...register("registered")}
                            className="accent-[#6cc24a] w-4 h-4 rounded"
                        />
                        Registrado
                    </label>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2.5 rounded-xl">
                        <input
                            type="checkbox"
                            value={true}
                            {...register("enrolled")}
                            className="accent-[#6cc24a] w-4 h-4 rounded"
                        />
                        Matriculado
                    </label>
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2.5 rounded-xl">
                        <input
                            type="checkbox"
                            value={true}
                            {...register("approval")}
                            className="accent-[#6cc24a] w-4 h-4 rounded"
                        />
                        Aprobado
                    </label>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Pago Total ($)</label>
                    <input
                        type="text"
                        placeholder="Ej: 50.00"
                        {...register("total_payment")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
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

export default ParticipantForm;
