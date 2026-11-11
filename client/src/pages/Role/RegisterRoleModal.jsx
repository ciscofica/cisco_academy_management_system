import RoleForm from "../../components/role/RoleForm";

function RegisterRoleModal({ isOpen, onClose, role }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <RoleForm onClose={onClose} role={role} />
    </div>
  );
}

export default RegisterRoleModal;
