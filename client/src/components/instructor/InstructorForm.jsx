import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCourse } from "../../context/CourseContext";
import { useInstructor } from "../../context/InstructorContext";

function InstructorForm({ onClose, instructor }) {
    const { register, handleSubmit, setValue } = useForm();
    const { courses, getCoursesDropdown } = useCourse();
    const { createInstructor, updateInstructor } = useInstructor();
    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        getCoursesDropdown();

        if (instructor) {
            setValue("identification_number", instructor.identification_number);
            setValue("name", instructor.name);
            setValue("phone", instructor.phone);
            setValue("email", instructor.email);
            setValue("ruc_number", instructor.ruc_number);
            setValue("banck_certificate_url", instructor.banck_certificate_url);

            if (instructor.Details && instructor.Details.length > 0) {
                setSelectedCourse(instructor.Details[0].Courses[0].course_id);
            } else {
                setSelectedCourse("");
            }
        }
    }, [instructor, setValue]);

    const handleSelected = (course_id) => {
        setSelectedCourse(course_id);
    };

    const onSubmit = handleSubmit((data) => {
        if (instructor) {
            updateInstructor({ ...data, id: instructor.instructor_id });
        } else {
            createInstructor(data);
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
                {instructor ? "Editar Instructor" : "Nuevo Instructor"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso Asignado</label>
                    <select
                        {...register("course_id")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedCourse}
                        onChange={(e) => handleSelected(e.target.value)}
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cédula de Identidad</label>
                    <input
                        type="text"
                        placeholder="Ej: 1002345678"
                        {...register("identification_number", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">RUC</label>
                    <input
                        type="text"
                        placeholder="Ej: 1002345678001"
                        {...register("ruc_number", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        placeholder="Ej: Ing. Carlos Morales"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Teléfono</label>
                    <input
                        type="text"
                        placeholder="Ej: 0987654321"
                        {...register("phone", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Correo Electrónico</label>
                    <input
                        type="email"
                        placeholder="docente@utn.edu.ec"
                        {...register("email", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Certificado Bancario (URL)</label>
                    <input
                        type="text"
                        placeholder="URL de certificado bancario"
                        {...register("banck_certificate_url", { required: true })}
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

export default InstructorForm;
