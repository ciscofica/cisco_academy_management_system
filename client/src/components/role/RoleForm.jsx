import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useRole } from "../../context/RoleContext";

function RoleForm({ onClose, role }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createRole, updateRole } = useRole();

    useEffect(() => {
        if (role) {
            setValue("name", role.name);
            setValue("description", role.description);
        }
    }, [role, setValue]);

    const onSubmit = handleSubmit((data) => {
        if (role) {
            updateRole({ ...data, id: role.role_id });
        } else {
            createRole(data);
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
                {role ? "Editar Rol" : "Nuevo Rol"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nombre del Rol</label>
                    <input
                        type="text"
                        placeholder="Ej: Administrador"
                        {...register("name", { required: true })}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Descripción</label>
                    <textarea
                        rows={3}
                        placeholder="Descripción de las funciones del rol"
                        {...register("description")}
                        className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
                    ></textarea>
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

export default RoleForm;
