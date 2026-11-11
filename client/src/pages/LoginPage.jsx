import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signin, errors: signinErrors, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const onSubmit = handleSubmit(data => {
        signin(data);
    });

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated]);

    return (
        /* ── Contenedor de pantalla completa con fondo gris claro ── */
        <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-slate-50 px-4">

            {/* ── Tarjeta de login ── */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-10">

                <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">
                    Inicio de Sesión
                </h1>
                <p className="text-sm text-slate-500 text-center mb-8">
                    Ingresa tus credenciales institucionales
                </p>

                <form onSubmit={onSubmit} className="space-y-4">

                    {/* ── Campo Email ── */}
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

                    {/* ── Campo Contraseña ── */}
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

                    {/* ── Error del servidor ── */}
                    {signinErrors && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {signinErrors}
                        </div>
                    )}

                    {/* ── Botón Ingresar ── */}
                    <button
                        type="submit"
                        className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-2"
                    >
                        Ingresar
                    </button>
                </form>

                {/* ── Enlace registro ── */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    ¿No tienes cuenta?{" "}
                    <Link
                        to="/register"
                        className="text-[#6cc24a] hover:text-[#5aad3a] font-semibold hover:underline transition-colors"
                    >
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
