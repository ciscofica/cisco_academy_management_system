import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import CourseReportModal from './CourseReportModal';

const PreviewCoursePage = () => {
    const { id } = useParams();
    const { getCourse, course } = useCourse();
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [isChaptersOpen, setIsChaptersOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

    useEffect(() => {
        getCourse(id);
    }, [id]);

    if (!course) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50 text-slate-600">
                <p>Cargando curso...</p>
            </div>
        );
    }

    const toggleChapters = () => {
        setIsChaptersOpen(!isChaptersOpen);
    };

    const toggleParticipants = () => {
        setIsParticipantsOpen(!isParticipantsOpen);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'En Progreso':
                return 'bg-blue-50 text-[#049fd9] border border-blue-200';
            case 'Finalizado':
                return 'bg-[#edf7e6] text-[#3a8c25] border border-green-200';
            case 'Pendiente':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            default:
                return 'bg-gray-100 text-slate-600 border border-gray-200';
        }
    };

    const parseDays = (days) => {
        if (!days) return "Días no disponibles";

        const dayMap = {
            '1': 'Lunes',
            '2': 'Martes',
            '3': 'Miércoles',
            '4': 'Jueves',
            '5': 'Viernes',
            '6': 'Sábado',
            '7': 'Domingo'
        };

        return days.split('-').map(day => dayMap[day.trim()]).join(', ');
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-6xl mx-auto">
                {/* ── Barra superior ── */}
                <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Regresar
                    </button>

                    <button
                        onClick={() => setIsReportsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#049fd9] text-white rounded-xl hover:bg-[#0380b0] text-sm font-medium transition-colors shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Descargar Documentos
                    </button>
                </div>

                {/* ── Encabezado del curso ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {course.course_name}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(course.status)}`}>
                            {course.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        Registrado el: {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* ── Métricas estilo NetAcad ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <span className="text-4xl font-extrabold text-[#005073]">
                            {course.Detail?.num_enrolled ?? "0"}
                        </span>
                        <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 mt-2">
                            Inscritos
                        </span>
                    </div>
                    <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <span className="text-4xl font-extrabold text-[#6cc24a]">
                            {course.Detail?.num_registered ?? "0"}
                        </span>
                        <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 mt-2">
                            Matriculados
                        </span>
                    </div>
                    <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <span className="text-4xl font-extrabold text-red-500">
                            {course.Detail?.num_failed ?? "0"}
                        </span>
                        <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 mt-2">
                            Reprobados
                        </span>
                    </div>
                </div>

                {/* ── Fechas del curso ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-4">
                        Fechas Importantes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl">
                            <p className="text-sm text-slate-600">
                                <strong className="text-slate-800">Fecha Inicio: </strong>{" "}
                                {course.start_date ? new Date(course.start_date).toLocaleDateString() : "No Asignado"}
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl">
                            <p className="text-sm text-slate-600">
                                <strong className="text-slate-800">Fecha Fin: </strong>{" "}
                                {course.end_date ? new Date(course.end_date).toLocaleDateString() : "No Asignado"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Descripción del curso ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-4">
                        Descripción del Curso
                    </h3>
                    {course.Detail ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-3">
                                <p className="text-base text-slate-700">
                                    {course.Detail.course_description || "No Asignado"}
                                </p>

                                {course.Detail?.Costs && course.Detail.Costs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-xs uppercase font-bold text-slate-600 tracking-wider mb-2">Costos</h4>
                                        <div className="space-y-2">
                                            {course.Detail.Costs.map((cost) => (
                                                <div key={cost.cost_id} className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-600">
                                                    <p><strong className="text-slate-800">Monto:</strong> ${cost.amount}</p>
                                                    <p><strong className="text-slate-800">Descripción:</strong> {cost.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200 text-sm">
                                    <p className="text-slate-600">
                                        <strong className="text-slate-800">Horas:</strong> {course.Detail.total_hours || "No Asignado"}
                                    </p>
                                    <p className="text-slate-600">
                                        <strong className="text-slate-800">Horas Instructor:</strong> {course.Detail.instructor_hours || "No Asignado"}
                                    </p>
                                    <p className="text-slate-600">
                                        <strong className="text-slate-800">Horas Actividades:</strong> {course.Detail.activities_hours || "No Asignado"}
                                    </p>
                                </div>

                                <div className="pt-2 text-sm">
                                    <strong className="text-slate-800">Modalidad/es: </strong>
                                    {course.Detail.Modalities && course.Detail.Modalities.length > 0 ? (
                                        course.Detail.Modalities.map((modality, index) => (
                                            <span key={index} className="inline-block bg-blue-50 text-[#049fd9] border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium mr-2">
                                                {modality.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500">No disponible</span>
                                    )}
                                </div>
                                <p className="text-sm text-red-600">
                                    <strong>Requerimiento Participantes: </strong> {course.Detail.participant_requeriment || "No Asignado"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl text-slate-500 text-sm">
                            No hay información de detalle relacionada.
                        </div>
                    )}
                </div>

                {/* ── Horarios ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-4">
                        Horarios
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {course.Detail && course.Detail.Schedules && course.Detail.Schedules.length > 0 ? (
                            course.Detail.Schedules.map((schedule, index) => (
                                <div key={index} className="flex items-center space-x-4 bg-slate-50 border border-gray-200 p-4 rounded-xl">
                                    <div className="flex-shrink-0">
                                        <div className="bg-[#049fd9] text-white p-3 rounded-xl shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 0v4M3 9h18M5 21h14a2 2 0 002-2V9H3v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-slate-800">Días: {parseDays(schedule.days)}</p>
                                        <p className="text-slate-500"><strong>Inicio:</strong> {schedule.start_time}</p>
                                        <p className="text-slate-500"><strong>Fin:</strong> {schedule.end_time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No hay horarios disponibles</p>
                        )}
                    </div>
                </div>

                {/* ── Sección de Capítulos (Acordeón) ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3
                        className="uppercase flex items-center justify-between cursor-pointer text-base font-bold text-slate-800 tracking-wider"
                        onClick={toggleChapters}
                        aria-expanded={isChaptersOpen}
                    >
                        <span>Capítulos</span>
                        <span className={`text-sm text-slate-400 transition-transform ${isChaptersOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </h3>
                    {isChaptersOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            {course?.Chapters?.length > 0 ? (
                                course.Chapters.map((chapter) => (
                                    <div key={chapter.chapter_id} className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-700">{chapter.chapter_name}</span>
                                        <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-slate-600 font-medium">
                                            {chapter.hours} horas
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500">No hay capítulos disponibles</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Sección de Participantes (Acordeón) ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-12">
                    <h3
                        className="uppercase flex items-center justify-between cursor-pointer text-base font-bold text-slate-800 tracking-wider"
                        onClick={toggleParticipants}
                        aria-expanded={isParticipantsOpen}
                    >
                        <span>Participantes ({course?.Participants?.length ?? 0})</span>
                        <span className={`text-sm text-slate-400 transition-transform ${isParticipantsOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </h3>
                    {isParticipantsOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
                            {course?.Participants?.length > 0 ? (
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Facultad</th>
                                            <th className="px-4 py-3">Carrera</th>
                                            <th className="px-4 py-3">Institución</th>
                                            <th className="px-4 py-3">Estado Aprobación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.Participants.map((participant) => (
                                            <tr key={participant.participant_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800">{participant.name}</td>
                                                <td className="px-4 py-3">{participant.ParticipantType ? participant.ParticipantType.name : 'No disponible'}</td>
                                                <td className="px-4 py-3">{participant.InfoUtn ? participant.InfoUtn.faculty : 'No registrado'}</td>
                                                <td className="px-4 py-3">{participant.InfoUtn ? participant.InfoUtn.degree : 'No registrado'}</td>
                                                <td className="px-4 py-3">{participant.InfoUtn ? participant.institution : 'No registrado'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${participant.approval ? 'bg-[#edf7e6] text-[#3a8c25]' : 'bg-gray-100 text-slate-600'}`}>
                                                        {participant.approval ? "Aprobó" : "Pendiente"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <span className="text-sm text-slate-500">No hay participantes disponibles</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CourseReportModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} course={course} />
        </div>
    );
};

export default PreviewCoursePage;
