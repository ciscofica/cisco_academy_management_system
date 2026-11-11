import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDetailValues } from "../../context/DetailValuesContext";
import { useCourse } from "../../context/CourseContext";

function DetailValueForm({ onClose, detail_value }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createDetailValue, updateDetailValue } = useDetailValues();
    const { courses, getCoursesDropdown } = useCourse();

    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        getCoursesDropdown();

        if (detail_value) {
            setValue("total_amount", detail_value.total_amount);
            setValue("instructor_payment", detail_value.instructor_payment);
            setValue("balance", detail_value.balance);
        }
    }, [detail_value, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (detail_value) {
            updateDetailValue({ ...data, id: detail_value.detail_value_id });
        } else {
            createDetailValue(data);
        }
        if (onClose) onClose();
    });

    const handleSelectedCourse = (course_id) => {
        setSelectedCourse(course_id);
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
                {detail_value ? "Editar Detalle de Valores" : "Nuevo Detalle de Valores"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso Relacionado</label>
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Total Recaudado ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 500.00"
                        {...register("total_amount", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Pago Instructor ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 300.00"
                        {...register("instructor_payment")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
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

export default DetailValueForm;
