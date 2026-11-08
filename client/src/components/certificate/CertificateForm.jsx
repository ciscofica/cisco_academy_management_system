import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCertificate } from "../../context/CertificateContext";
import { useInstructor } from "../../context/InstructorContext";

function CertificateForm({ onClose, certificate }) {
    const { register, handleSubmit, setValue, watch } = useForm();
    const { createCertificate, updateCertificate } = useCertificate();
    const { instructors, getInstructorsDropdown } = useInstructor();
    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [signatoryType, setSignatoryType] = useState("instructor");

    useEffect(() => {
        getInstructorsDropdown();

        if (certificate) {
            setValue("name", certificate.name);
            setValue("year_of_issue", certificate.year_of_issue);
            setValue("is_international", certificate.is_international);
            setValue("file_url", certificate.file_url);
            setValue("signatory_name", certificate.signatory_name || "");
            setSignatoryType(certificate.signatory_type || "instructor");
            setSelectedInstructor(certificate.Instructors?.[0]?.instructor_id || "");
        } else {
            setValue("year_of_issue", new Date().getFullYear());
            setSignatoryType("instructor");
        }
    }, [certificate, setValue]);

    const onSubmit = handleSubmit((data) => {
        const payload = {
            ...data,
            signatory_type: signatoryType,
            instructor_id: signatoryType !== "lab_head" ? selectedInstructor : null,
            signatory_name:
                signatoryType === "instructor"
                    ? instructors.find((i) => String(i.instructor_id) === String(selectedInstructor))?.name || data.signatory_name
                    : data.signatory_name,
        };

        if (certificate) {
            updateCertificate({ ...payload, id: certificate.certificate_id });
        } else {
            createCertificate(payload);
        }
        if (onClose) onClose();
    });

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
                {certificate ? "Editar Certificado" : "Nuevo Certificado"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre del Certificado *</label>
                    <input
                        type="text"
                        placeholder="Ej: CCNA: Introduction to Networks"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Año de Emisión *</label>
                    <input
                        type="number"
                        placeholder="Ej: 2026"
                        {...register("year_of_issue", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        required
                    />
                </div>

                {/* Selección de Autoridad Firmante */}
                <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                        Autoridad que Firma el Certificado *
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all font-semibold ${signatoryType === 'instructor' ? 'bg-[#edf7e6] text-[#3a8c25] border-green-300 shadow-xs' : 'bg-white text-slate-600 border-gray-200'}`}>
                            <input
                                type="radio"
                                name="signatory_type"
                                value="instructor"
                                checked={signatoryType === "instructor"}
                                onChange={() => setSignatoryType("instructor")}
                                className="sr-only"
                            />
                            Instructor
                        </label>
                        <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all font-semibold ${signatoryType === 'lab_head' ? 'bg-[#edf7e6] text-[#3a8c25] border-green-300 shadow-xs' : 'bg-white text-slate-600 border-gray-200'}`}>
                            <input
                                type="radio"
                                name="signatory_type"
                                value="lab_head"
                                checked={signatoryType === "lab_head"}
                                onChange={() => setSignatoryType("lab_head")}
                                className="sr-only"
                            />
                            Jefe de Lab
                        </label>
                        <label className={`p-2 rounded-lg border text-center cursor-pointer transition-all font-semibold ${signatoryType === 'both' ? 'bg-[#edf7e6] text-[#3a8c25] border-green-300 shadow-xs' : 'bg-white text-slate-600 border-gray-200'}`}>
                            <input
                                type="radio"
                                name="signatory_type"
                                value="both"
                                checked={signatoryType === "both"}
                                onChange={() => setSignatoryType("both")}
                                className="sr-only"
                            />
                            Ambos
                        </label>
                    </div>

                    {(signatoryType === "instructor" || signatoryType === "both") && (
                        <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Instructor Responsable</label>
                            <select
                                className="w-full bg-white border border-gray-300 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#6cc24a]"
                                value={selectedInstructor}
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                            >
                                <option value="">Seleccionar Instructor</option>
                                {instructors.map((instructor) => (
                                    <option key={instructor.instructor_id} value={instructor.instructor_id}>
                                        {instructor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(signatoryType === "lab_head" || signatoryType === "both") && (
                        <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nombre / Cargo Jefe de Laboratorio</label>
                            <input
                                type="text"
                                placeholder="Ej: Ing. Martha Romero - Jefe de Laboratorio FICA"
                                {...register("signatory_name")}
                                className="w-full bg-white border border-gray-300 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#6cc24a]"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">URL o Ruta del Archivo</label>
                    <input
                        type="text"
                        placeholder="https://... o ruta del archivo"
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
                        Certificación Internacional Cisco
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-2"
                >
                    {certificate ? "Actualizar Certificado" : "Guardar Certificado"}
                </button>
            </form>
        </div>
    );
}

export default CertificateForm;
