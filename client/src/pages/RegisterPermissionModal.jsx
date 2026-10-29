import PermissionFormPage from "./PermissionFormPage";

function RegisterPermissionModal({ isOpen, onClose, permission }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <PermissionFormPage onClose={onClose} permission={permission} />
    </div>
  );
}

export default RegisterPermissionModal;
