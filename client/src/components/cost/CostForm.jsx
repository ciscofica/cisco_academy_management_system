import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCosts } from "../../context/CostContext";
import { useCourse } from "../../context/CourseContext";

function CostForm({ onClose, cost }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createCost } = useCosts();
    const { courses, getCoursesDropdown } = useCourse();
    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        getCoursesDropdown();

        if (cost) {
            setValue("amount", cost.amount);
            setValue("description", cost.description);
            setSelectedCourse(cost.course_id || "");
        }
    }, []);

    const onSubmit = handleSubmit((data) => {
        if (!cost) {
            createCost({ ...data });
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
                {cost ? "Editar Costo" : "Nuevo Costo"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Monto ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 120.00"
                        {...register("amount", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción</label>
                    <textarea
                        rows={3}
                        placeholder="Descripción del costo"
                        {...register("description")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso Relacionado</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedCourse}
                        {...register("course_id")}
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

export default CostForm;
