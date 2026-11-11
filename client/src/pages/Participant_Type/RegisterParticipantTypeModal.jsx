import ParticipantTypeForm from "../../components/participantType/ParticipantTypeForm";

function RegisterParticipantTypeModal({ isOpen, onClose, participant_type }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <ParticipantTypeForm onClose={onClose} participant_type={participant_type} />
    </div>
  );
}

export default RegisterParticipantTypeModal;
