import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
// import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, errors: RegisterErrors } = useAuth();
    const navigate = useNavigate();
    // console.log(user);

    // useEffect(() => {
    //     if (isAuthenticated) navigate("/permissions");
    // }, [isAuthenticated, navigate]);

    const onSubmit = handleSubmit(async (values) => {
        const ok = await signup(values);
        if (ok) {
            Swal.fire({
                icon: "success",
                title: "Usuario registrado",
                text: "El usuario se registró correctamente. Ahora puedes iniciar sesión.",
                confirmButtonText: "Ir al login",
            }).then(() => {
                navigate("/login");
            });
        }
    });

    return (
        /* ── Contenedor de pantalla completa con fondo gris claro ── */
        <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-slate-50 px-4">

            {/* ── Tarjeta de registro ── */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-10">

                <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">
                    Crear cuenta
                </h1>
                <p className="text-sm text-slate-500 text-center mb-8">
                    Completa los datos para registrarte
                </p>

                {/* ── Error del servidor ── */}
                {RegisterErrors && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                        {RegisterErrors}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">

                    {/* ── Nombre ── */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            {...register("name", { required: true })}
                            placeholder="Ej: Juan Pérez"
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
                        )}
                    </div>

                    {/* ── Email ── */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            placeholder="usuario@utn.edu.ec"
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">El email es requerido</p>
                        )}
                    </div>

                    {/* ── Contraseña ── */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            {...register("password", { required: true })}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">La contraseña es requerida</p>
                        )}
                    </div>

                    {/* ── Dirección ── */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Dirección
                        </label>
                        <input
                            type="text"
                            {...register("address", { required: true })}
                            placeholder="Ej: Av. 17 de Julio, Ibarra"
                            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">La dirección es requerida</p>
                        )}
                    </div>

                    {/* ── Botón Registrar ── */}
                    <button
                        type="submit"
                        className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-2"
                    >
                        Crear cuenta
                    </button>
                </form>

                {/* ── Enlace login ── */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        to="/login"
                        className="text-[#6cc24a] hover:text-[#5aad3a] font-semibold hover:underline transition-colors"
                    >
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
