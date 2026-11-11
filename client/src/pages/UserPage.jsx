import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUsersRequest, createUserRequest, updateUserRequest } from "../api/user";
import { getAllRolesRequest } from "../api/role";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", address: "", password: "", role_id: "" };

export default function UserPage() {
  const { user } = useAuth();
  const role = user?.userExists?.Role || user?.user?.Role;
  const permissions = (role?.Permissions || []).filter((permission) => permission.status === "Activo" || permission.status === "1").map((permission) => permission.name);
  const isReadOnly = role?.name !== "Administrador" && (permissions.includes("Consultar información") || permissions.includes("Consultar dashboard"));
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const usersResponse = await getUsersRequest();
    setUsers(usersResponse.data || []);
    if (!isReadOnly) {
      const rolesResponse = await getAllRolesRequest({ limit: 1000 });
      setRoles((rolesResponse.data?.roles || []).filter((availableRole) => availableRole.status === "Activo"));
    }
  };
  useEffect(() => { load().catch((error) => Swal.fire("Error", error.response?.data?.message || "No se pudieron cargar los usuarios.", "error")); }, [isReadOnly]);
  const startEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, address: user.address || "", password: "", role_id: String(user.role_id || "") });
    setOpen(true);
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      if (editing) {
        const { password, ...fields } = form;
        await updateUserRequest(editing.id, password ? form : fields);
      } else await createUserRequest(form);
      setOpen(false); setForm(emptyForm); setEditing(null); await load();
      Swal.fire("Guardado", "La cuenta quedó actualizada.", "success");
    } catch (error) { Swal.fire("No se pudo guardar", error.response?.data?.message || "Revise los datos e inténtelo de nuevo.", "error"); }
    finally { setBusy(false); }
  };
  const toggleStatus = async (user) => {
    const result = await Swal.fire({ title: user.status === "1" ? "¿Desactivar cuenta?" : "¿Activar cuenta?", text: user.email, icon: "question", showCancelButton: true, confirmButtonText: "Continuar", cancelButtonText: "Cancelar" });
    if (!result.isConfirmed) return;
    try { await updateUserRequest(user.id, { status: user.status === "1" ? "0" : "1" }); await load(); }
    catch (error) { Swal.fire("No se pudo cambiar", error.response?.data?.message || "Inténtelo de nuevo.", "error"); }
  };
  return <main className="min-h-screen bg-slate-50 p-6 md:p-8"><section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-800">{isReadOnly ? "Consulta de usuarios" : "Gestión de usuarios"}</h1><p className="mt-1 text-sm text-slate-500">{isReadOnly ? "Cuentas del sistema, sus roles y estados. Esta vista no permite cambios." : "Cree cuentas, asigne roles y active o desactive accesos."}</p></div>{!isReadOnly && <button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="rounded-xl bg-[#6cc24a] px-4 py-2 font-semibold text-white">Nuevo usuario</button>}</header>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50 text-slate-500"><th className="p-3">Nombre</th><th className="p-3">Correo</th><th className="p-3">Rol</th><th className="p-3">Estado</th>{!isReadOnly && <th className="p-3">Acciones</th>}</tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b"><td className="p-3 font-medium">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3">{user.Role?.name || "Sin rol"}</td><td className="p-3">{user.status === "1" ? "Activo" : "Inactivo"}</td>{!isReadOnly && <td className="space-x-3 p-3"><button onClick={() => startEdit(user)} className="font-semibold text-blue-700">Editar</button><button onClick={() => toggleStatus(user)} className="font-semibold text-rose-700">{user.status === "1" ? "Desactivar" : "Activar"}</button></td>}</tr>)}</tbody></table></div>
  </section>
  {!isReadOnly && open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-bold">{editing ? "Editar usuario" : "Crear usuario"}</h2>{[["name","Nombre","text"],["email","Correo electrónico","email"],["address","Dirección","text"],["password",editing ? "Nueva contraseña (opcional)" : "Contraseña","password"]].map(([key,label,type]) => <label key={key} className="block text-sm font-medium">{label}<input type={type} required={!editing && key === "password" || key === "name" || key === "email"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>)}<label className="block text-sm font-medium">Rol<select required value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccione rol</option>{roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.name}</option>)}</select></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2">Cancelar</button><button disabled={busy} className="rounded-lg bg-[#6cc24a] px-4 py-2 font-semibold text-white">{busy ? "Guardando…" : "Guardar"}</button></div></form></div>}
  </main>;
}
