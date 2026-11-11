import ScheduleForm from "../../components/schedule/ScheduleForm";

function RegisterScheduleModal({ isOpen, onClose, schedule }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <ScheduleForm onClose={onClose} schedule={schedule} />
    </div>
  );
}

export default RegisterScheduleModal;
