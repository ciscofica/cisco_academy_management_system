import InfoUtnForm from "../../components/infoUtn/InfoUtnForm";

function RegisterInfoUtnModal({ isOpen, onClose, info_utn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <InfoUtnForm onClose={onClose} info_utn={info_utn} />
    </div>
  );
}

export default RegisterInfoUtnModal;
