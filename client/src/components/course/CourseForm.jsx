import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useCourse } from "../../context/CourseContext"; // Contexto para manejar capítulos

function CourseForm({ onClose, course }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createCourse, updateCourse } = useCourse();
    const statusOptions = ["Aprobado", "Rechazado", "Iniciado", "Finalizado", "Pendiente"]; // Lista predefinida de estados

    // Función para convertir la fecha de la base de datos al formato de 'datetime-local'
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
    };

    useEffect(() => {
        if (course) {
            setValue("course_name", course.course_name);
            setValue("start_date", formatDateForInput(course.start_date));
            setValue("end_date", formatDateForInput(course.end_date));
            setValue("status", course.status); // Set initial value for status if available
        }
    }, [course, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (course) {
            updateCourse({ ...data, id: course.course_id });
        } else {
            createCourse(data);
        }
        onClose();
    });

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 relative">
            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center absolute top-4 right-4 transition-colors font-semibold"
            >
                ✕
            </button>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
                {course ? "Editar Curso" : "Nuevo Curso"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Nombre del Curso */}
                <div>
                    <label htmlFor="course_name" className="text-sm font-medium text-slate-700 block mb-1">
                        Nombre del Curso:
                    </label>
                    <input
                        id="course_name"
                        type="text"
                        placeholder="Nombre Curso"
                        {...register("course_name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                {/* Fecha de Inicio del Curso */}
                <div>
                    <label htmlFor="start_date" className="text-sm font-medium text-slate-700 block mb-1">
                        Fecha de Inicio:
                    </label>
                    <input
                        id="start_date"
                        type="datetime-local"
                        {...register("start_date")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                {/* Fecha de Fin del Curso */}
                <div>
                    <label htmlFor="end_date" className="text-sm font-medium text-slate-700 block mb-1">
                        Fecha de Fin:
                    </label>
                    <input
                        id="end_date"
                        type="datetime-local"
                        {...register("end_date")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                {/* Estado */}
                <div>
                    <label htmlFor="status" className="text-sm font-medium text-slate-700 block mb-1">
                        Estado:
                    </label>
                    <select
                        id="status"
                        {...register("status", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    >
                        <option value="">Seleccionar Estado</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botón Guardar */}
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

export default CourseForm;
