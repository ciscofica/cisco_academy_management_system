import DetailValueForm from "../../components/detailValue/DetailValueForm";

function RegisterDetailValueModal({ isOpen, onClose, detail_value }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <DetailValueForm onClose={onClose} detail_value={detail_value} />
    </div>
  );
}

export default RegisterDetailValueModal;
