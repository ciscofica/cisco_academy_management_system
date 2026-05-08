import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
// import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="flex dark:bg-gray-700 bg-gray-200 h-[calc(100vh-100px)] items-center justify-center">
            <div className="max-w-md w-full bg-red-700 dark:bg-gray-800 p-10 rounded-md">
                <h1 className="text-2xl font-semibold text-center text-white mb-4">
                    Registro de Usuario
                </h1>

                {RegisterErrors && (
                    <div className="bg-red-500 p-2 text-white rounded-md mb-3">
                        {RegisterErrors}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-md my-2"
                        placeholder="nombre"
                    />
                    {errors.name && <p className="text-red-300">Nombre requerido</p>}

                    <input
                        type="email"
                        {...register("email", { required: true })}
                        className="w-full bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-md my-2"
                        placeholder="email"
                    />
                    {errors.email && <p className="text-red-300">Email requerido</p>}

                    <input
                        type="password"
                        {...register("password", { required: true })}
                        className="w-full bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-md my-2"
                        placeholder="contraseña"
                    />
                    {errors.password && <p className="text-red-300">Contraseña requerida</p>}

                    <input
                        type="text"
                        {...register("address", { required: true })}
                        className="w-full bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-md my-2"
                        placeholder="dirección"
                    />
                    {errors.address && <p className="text-red-300">Dirección requerida</p>}

                    <button
                        type="submit"
                        className="w-full bg-gray-800 dark:bg-blue-600 hover:bg-gray-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-md my-2 transition-colors"
                    >
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage