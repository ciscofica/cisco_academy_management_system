import ModalityForm from "../../components/modality/ModalityForm";

function RegisterModalityModal({ isOpen, onClose, modality }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <ModalityForm onClose={onClose} modality={modality} />
    </div>
  );
}

export default RegisterModalityModal;
