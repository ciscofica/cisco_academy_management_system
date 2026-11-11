import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useChapter } from "../../context/ChapterContext";
import { useCourse } from "../../context/CourseContext";

function ChapterForm({ onClose, chapter }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createChapter, updateChapter } = useChapter();
    const { courses, getCoursesDropdown } = useCourse();
    const [selectedCourse, setSelectedCourse] = useState("");

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        getCoursesDropdown();

        if (chapter) {
            setValue("chapter_name", chapter.chapter_name);
            setValue("hours", chapter.hours);
            setValue("start_date", formatDateForInput(chapter.start_date));
            setValue("end_date", formatDateForInput(chapter.end_date));
            setSelectedCourse(chapter.Courses[0]?.course_id);
        }
    }, [chapter, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (chapter) {
            updateChapter({ ...data, id: chapter.chapter_id, course_id: selectedCourse });
        } else {
            createChapter({ ...data, course_id: selectedCourse });
        }
        if (onClose) onClose();
    });

    const handleSelected = (id) => {
        setSelectedCourse(id);
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
                {chapter ? "Editar Capítulo" : "Nuevo Capítulo"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso Relacionado</label>
                    <select
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre del Capítulo</label>
                    <input
                        type="text"
                        placeholder="Ej: Módulo 1: Conceptos Básicos"
                        {...register("chapter_name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Horas de Duración</label>
                    <input
                        type="number"
                        placeholder="Ej: 10"
                        {...register("hours")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha de Inicio</label>
                    <input
                        type="datetime-local"
                        {...register("start_date")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha de Fin</label>
                    <input
                        type="datetime-local"
                        {...register("end_date")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
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

export default ChapterForm;
