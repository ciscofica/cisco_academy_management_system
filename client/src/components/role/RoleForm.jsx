import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import { getAllPermissionsRequest } from "../../api/permission";

function RoleForm({ onClose, role }) {
    const { register, handleSubmit, setValue } = useForm();
    const { createRole, updateRole } = useRole();
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        if (role) {
            setValue("name", role.name);
            setValue("description", role.description);
        } else {
            setValue("name", "");
            setValue("description", "");
            setSelectedPermissions([]);
        }
        getAllPermissionsRequest({ limit: 1000 }).then((response) => {
            const available = (response.data?.permissions || []).filter((permission) => permission.status === "Activo" || permission.status === "1");
            const availableIds = new Set(available.map((permission) => Number(permission.permission_id)));
            setPermissions(available);
            setSelectedPermissions(role ? (role.Permissions || []).map((permission) => Number(permission.permission_id)).filter((id) => availableIds.has(id)) : []);
        }).catch(() => {
            setPermissions([]);
            setSelectedPermissions([]);
        });
    }, [role, setValue]);

    const onSubmit = handleSubmit((data) => {
        const allowedIds = new Set(permissions.map((permission) => Number(permission.permission_id)));
        const payload = { ...data, permission_ids: selectedPermissions.filter((id) => allowedIds.has(id)) };
        if (role) {
            updateRole({ ...payload, id: role.role_id }).then((saved) => saved && onClose?.());
        } else {
            createRole(payload).then((saved) => saved && onClose?.());
        }
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
                <fieldset className="rounded-xl border border-gray-200 p-3">
                    <legend className="px-1 text-sm font-semibold text-slate-700">Permisos del rol</legend>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                        {permissions.filter((permission) => permission.status === "Activo" || permission.status === "1").map((permission) => (
                            <label key={permission.permission_id} className="flex items-start gap-2 text-sm text-slate-600">
                                <input type="checkbox" checked={selectedPermissions.includes(Number(permission.permission_id))} onChange={(event) => setSelectedPermissions((current) => event.target.checked ? [...new Set([...current, Number(permission.permission_id)])] : current.filter((id) => id !== Number(permission.permission_id)))} />
                                <span>{permission.name}{permission.description ? <small className="block text-xs text-slate-400">{permission.description}</small> : null}</span>
                            </label>
                        ))}
                        {!permissions.length && <p className="text-xs text-slate-400">No hay permisos disponibles. Reinicie la aplicación para sincronizar las funciones configuradas.</p>}
                    </div>
                </fieldset>
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
