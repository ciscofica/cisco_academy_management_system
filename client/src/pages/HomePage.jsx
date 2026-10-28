import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-[calc(100vh-130px)] bg-slate-50 flex flex-col justify-center">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Plataforma de Gestión de{" "}
            <span className="text-[#6cc24a]">Cursos Cisco</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Facultad de Ingeniería en Ciencias Aplicadas · UTN.
            <br className="hidden sm:inline" />
            Administración centralizada de cursos, estudiantes y certificaciones.
          </p>

          <div className="flex justify-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold rounded-full shadow-sm hover:shadow transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESUMEN MINIMALISTA ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 text-center md:text-left">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">
              Cursos y Horarios
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Planificación académica, capítulos y modalidades de estudio.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">
              Participantes y Docentes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Control de matrículas, roles e instructores asignados.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">
              Certificaciones y Pagos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seguimiento de certificados emitidos y reportes de gestión.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;
