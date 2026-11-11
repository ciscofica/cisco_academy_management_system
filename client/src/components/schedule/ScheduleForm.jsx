import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSchedule } from "../../context/ScheduleContext";

function ScheduleForm({ onClose, schedule }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createSchedule, updateSchedule } = useSchedule();

    const daysOfWeek = [
        { label: "Lunes", value: 1 },
        { label: "Martes", value: 2 },
        { label: "Miércoles", value: 3 },
        { label: "Jueves", value: 4 },
        { label: "Viernes", value: 5 },
        { label: "Sábado", value: 6 },
        { label: "Domingo", value: 7 },
    ];

    const formatDaysForInput = (daysString) => {
        if (!daysString) return [];
        return daysString.split('-').map(Number);
    };

    const formatDaysForStorage = (daysArray) => {
        return daysArray.join('-');
    };

    useEffect(() => {
        if (schedule) {
            setValue("start_time", schedule.start_time);
            setValue("end_time", schedule.end_time);
            setValue("days", formatDaysForInput(schedule.days));
        }
    }, [schedule, setValue]);

    const onSubmit = handleSubmit((data) => {
        const formattedData = {
            ...data,
            days: formatDaysForStorage(data.days || []), 
        };
        if (schedule) {
            updateSchedule({ ...formattedData, id: schedule.schedule_id });
        } else {
            createSchedule(formattedData);
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
                {schedule ? "Editar Horario" : "Nuevo Horario"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Selecciona los días:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {daysOfWeek.map((day) => (
                            <label key={day.value} className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 p-2 rounded-xl">
                                <input
                                    type="checkbox"
                                    value={day.value}
                                    {...register("days")}
                                    className="accent-[#6cc24a] w-3.5 h-3.5 rounded"
                                />
                                {day.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Hora de Inicio:</label>
                    <input
                        type="time"
                        {...register("start_time")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Hora de Fin:</label>
                    <input
                        type="time"
                        {...register("end_time")}
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

export default ScheduleForm;
