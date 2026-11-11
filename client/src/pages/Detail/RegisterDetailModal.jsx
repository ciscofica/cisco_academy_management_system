import DetailForm from "../../components/detail/DetailForm";

function RegisterDetailModal({ isOpen, onClose, detail }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <DetailForm onClose={onClose} detail={detail} />
    </div>
  );
}

export default RegisterDetailModal;
