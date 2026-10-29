import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCertificate } from "../../context/CertificateContext";
import { useInstructor } from "../../context/InstructorContext";

function CertificateForm({ onClose, certificate }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createCertificate, updateCertificate } = useCertificate();
    const { instructors, getInstructorsDropdown } = useInstructor();
    const [selectedInstructor, setSelectedInstructor] = useState("");

    useEffect(() => {
        getInstructorsDropdown();

        if (certificate) {
            setValue("name", certificate.name);
            setValue("year_of_issue", certificate.year_of_issue);
            setValue("is_international", certificate.is_international);
            setValue("file_url", certificate.file_url);
            setSelectedInstructor(certificate.Instructors[0]?.instructor_id);
        }
    }, [certificate, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (certificate) {
            updateCertificate({ ...data, id: certificate.certificate_id, instructor_id: selectedInstructor });
        } else {
            createCertificate({ ...data, instructor_id: selectedInstructor });
        }
        if (onClose) onClose();
    });

    const handleSelected = (id) => {
        setSelectedInstructor(id);
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
                {certificate ? "Editar Certificado" : "Nuevo Certificado"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre del Certificado</label>
                    <input
                        type="text"
                        placeholder="Ej: CCNA: Introduction to Networks"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Año de Emisión</label>
                    <input
                        type="number"
                        placeholder="Ej: 2024"
                        {...register("year_of_issue")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Instructor Asignado</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedInstructor}
                        onChange={(e) => handleSelected(e.target.value)}
                    >
                        <option value="">Seleccionar Instructor</option>
                        {instructors.map((instructor) => (
                            <option key={instructor.instructor_id} value={instructor.instructor_id}>
                                {instructor.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">URL del Archivo</label>
                    <input
                        type="text"
                        placeholder="https://..."
                        {...register("file_url")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2.5 rounded-xl w-full">
                        <input
                            type="checkbox"
                            value={true}
                            {...register("is_international")}
                            className="accent-[#6cc24a] w-4 h-4 rounded"
                        />
                        Certificación Internacional
                    </label>
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

export default CertificateForm;
