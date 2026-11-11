import ParticipantForm from "../../components/participant/ParticipantForm";

function RegisterParticipantModal({ isOpen, onClose, participant }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <ParticipantForm onClose={onClose} participant={participant} />
    </div>
  );
}

export default RegisterParticipantModal;
