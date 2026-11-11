import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { usePermission } from "../context/PermissionContext";

function PermissionFormPage({ onClose, permission }) {
  const { register, handleSubmit, setValue } = useForm();
  const { createPermission, updatePermission } = usePermission();

  useEffect(() => {
    if (permission) {
      setValue("name", permission.name);
      setValue("description", permission.description);
    }
  }, [permission, setValue]);

  const onSubmit = handleSubmit((data) => {
    if (permission) {
      updatePermission({ ...data, id: permission.permission_id });
    } else {
      createPermission(data);
    }
    if (onClose) onClose();
  });

  return (
    <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {permission ? "Editar Permiso" : "Nuevo Permiso"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Nombre del permiso"
            {...register("name", { required: true })}
            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            rows={3}
            placeholder="Descripción del permiso"
            {...register("description")}
            className="w-full bg-gray-50 border border-gray-300 text-slate-800 text-sm px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#6cc24a] focus:ring-2 focus:ring-[#6cc24a]/20 transition resize-none"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-[#6cc24a] hover:bg-[#5aad3a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default PermissionFormPage;
