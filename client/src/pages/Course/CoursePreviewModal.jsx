import { useEffect } from "react";

const formatDate = (value) => {
  if (!value) return "Sin definir";
  const datePart = String(value).split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3 && parts.every((part) => /^\d+$/.test(part))) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin definir" : date.toLocaleDateString("es-EC");
};

const getStatusStyle = (status) => {
  if (["Finalizado"].includes(status)) return "border-slate-200 bg-slate-100 text-slate-700";
  if (["En ejecución", "Iniciado"].includes(status)) return "border-sky-200 bg-sky-50 text-sky-800";
  if (["En inscripción"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
};

function CoursePreviewModal({ isOpen, onClose, course }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  const detail = course.Detail || {};
  const templateDetail = course.TemplateCourse?.Detail || {};
  const participants = Array.isArray(course.Participants) ? course.Participants : [];
  const registeredCount = participants.length || Number(detail.num_registered) || 0;
  const enrolledCount = participants.length
    ? participants.filter((participant) => Boolean(participant.CourseParticipant?.enrolled && participant.CourseParticipant?.invoice_number)).length
    : Number(detail.num_enrolled) || 0;
  const failedCount = detail.num_failed !== null && detail.num_failed !== undefined
    ? Number(detail.num_failed)
    : participants.filter((participant) => {
        const record = participant.CourseParticipant || {};
        const grade = Number(record.grade_final);
        return record.approval === false || (record.grade_final !== null && record.grade_final !== undefined && Number.isFinite(grade) && grade < 70);
      }).length;
  const modalities = (detail.Modalities || []).map((modality) => modality.name).filter(Boolean);
  const instructorName = detail.Instructor?.name || "Sin asignar";
  const objective = detail.objective || templateDetail.objective;
  const targetAudience = detail.target_audience || templateDetail.target_audience;
  const description = detail.course_description || templateDetail.course_description;
  const costs = Array.isArray(detail.Costs) ? detail.Costs : [];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-preview-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detalle de la edición</p>
            <h2 id="course-preview-title" className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
              {course.course_name || "Curso sin nombre"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {course.class_code ? `Código de edición: ${course.class_code}` : course.TemplateCourse?.course_name ? `Curso de catálogo: ${course.TemplateCourse.course_name}` : `Edición #${course.course_id}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(course.status)}`}>
              {course.status || "Estado no definido"}
            </span>
            <button type="button" onClick={onClose} aria-label="Cerrar detalle" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <span aria-hidden="true" className="text-2xl leading-none">×</span>
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Inscritos", registeredCount],
              ["Matriculados", enrolledCount],
              ["Reprobados", failedCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Fechas de la edición</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Inicio</dt><dd className="text-right font-medium text-slate-800">{formatDate(course.start_date)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Fin</dt><dd className="text-right font-medium text-slate-800">{formatDate(course.end_date)}</dd></div>
              </dl>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Datos académicos</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Instructor</dt><dd className="text-right font-medium text-slate-800">{instructorName}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Modalidad</dt><dd className="text-right font-medium text-slate-800">{modalities.length ? modalities.join(", ") : "Sin definir"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Horas</dt><dd className="text-right font-medium text-slate-800">{detail.total_hours ? `${detail.total_hours} horas` : "Sin definir"}</dd></div>
              </dl>
            </div>
          </div>

          {description && <section className="mt-5 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Descripción</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{description}</p>
          </section>}

          {objective && <section className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Objetivo general</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{objective}</p>
          </section>}

          {targetAudience && <section className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Público destinatario</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{targetAudience}</p>
          </section>}

          {costs.length > 0 && <section className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Costos relacionados</h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {costs.map((cost) => (
                <li key={cost.cost_id} className="flex justify-between gap-4 py-2 text-sm">
                  <span className="text-slate-600">{cost.description || "Costo del curso"}</span>
                  <span className="shrink-0 font-semibold text-slate-800">${Number(cost.amount || 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </section>}
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#005073] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003f5c] focus:outline-none focus:ring-2 focus:ring-[#005073]/30">
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}

export default CoursePreviewModal;
