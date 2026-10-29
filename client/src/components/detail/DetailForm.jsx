import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDetail } from "../../context/DetailContext";
import { useCourse } from "../../context/CourseContext";
import { useInstructor } from "../../context/InstructorContext";
import { useModality } from "../../context/ModalityContext";

function DetailForm({ onClose, detail }) {
    const { register, handleSubmit, setValue } = useForm();
    const { courses, getCoursesDropdown } = useCourse();
    const { modalities, getModalitiesDropdown } = useModality();
    const { instructors, getInstructorsDropdown } = useInstructor();
    const { createDetail, updateDetail } = useDetail();

    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModality, setSelectedModality] = useState("");

    useEffect(() => {
        getCoursesDropdown();
        getInstructorsDropdown();
        getModalitiesDropdown();

        if (detail) {
            setValue("course_description", detail.course_description);
            setValue("total_hours", detail.total_hours);
            setValue("instructor_hours", detail.instructor_hours);
            setValue("activities_hours", detail.activities_hours);
            setValue("num_registered", detail.num_registered);
            setValue("num_enrolled", detail.num_enrolled);
            setValue("num_failed", detail.num_failed);
            setValue("participant_requeriment", detail.participant_requeriment);
            setValue("cost_per_hour", detail.cost_per_hour);

            if (detail.Courses && detail.Courses.length > 0) {
                setSelectedCourse(detail.Courses[0].course_id);
            } else {
                setSelectedCourse("");
            }

            if (detail.Instructor) {
                setSelectedInstructor(detail.Instructor.instructor_id);
            } else {
                setSelectedInstructor("");
            }

            if (detail.Modalities && detail.Modalities.length > 0) {
                setSelectedModality(detail.Modalities[0].modality_id);
            } else {
                setSelectedModality("");
            }
        }
    }, [detail, setValue]);

    const handleSelected = (course_id) => {
        setSelectedCourse(course_id);
    };

    const handleSelectedInstructor = (instructor_id) => {
        setSelectedInstructor(instructor_id);
    };

    const handleSelectedModality = (modality_id) => {
        setSelectedModality(modality_id);
    };

    const onSubmit = handleSubmit((data) => {
        if (detail) {
            updateDetail({ ...data, id: detail.detail_id });
        } else {
            createDetail(data);
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
                {detail ? "Editar Detalle" : "Nuevo Detalle"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Curso</label>
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción del Curso</label>
                    <textarea
                        rows={3}
                        placeholder="Descripción"
                        {...register("course_description")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Instructor</label>
                    <select
                        {...register("instructor_id")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedInstructor}
                        onChange={(e) => handleSelectedInstructor(e.target.value)}
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Modalidad</label>
                    <select
                        {...register("modality_id")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        value={selectedModality}
                        onChange={(e) => handleSelectedModality(e.target.value)}
                    >
                        <option value="">Seleccionar Modalidad</option>
                        {modalities.map((modality) => (
                            <option key={modality.modality_id} value={modality.modality_id}>
                                {modality.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Total Horas</label>
                        <input
                            type="number"
                            placeholder="Ej: 40"
                            {...register("total_hours", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Horas Docente</label>
                        <input
                            type="number"
                            placeholder="Ej: 30"
                            {...register("instructor_hours", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Horas Actividad</label>
                        <input
                            type="number"
                            placeholder="Ej: 10"
                            {...register("activities_hours", { required: true })}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Costo por Hora ($)</label>
                    <input
                        type="text"
                        placeholder="Ej: 15.00"
                        {...register("cost_per_hour", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">N° Registrados</label>
                        <input
                            type="number"
                            placeholder="0"
                            {...register("num_registered")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">N° Matriculados</label>
                        <input
                            type="number"
                            placeholder="0"
                            {...register("num_enrolled")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">N° Reprobados</label>
                        <input
                            type="number"
                            placeholder="0"
                            {...register("num_failed")}
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Requerimiento Participante</label>
                    <input
                        type="text"
                        placeholder="Ej: Conocimientos previos en redes"
                        {...register("participant_requeriment")}
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

export default DetailForm;
