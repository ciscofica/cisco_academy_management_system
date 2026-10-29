import InstructorForm from "../../components/instructor/InstructorForm";

function RegisterInstructorModal({ isOpen, onClose, instructor }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <InstructorForm onClose={onClose} instructor={instructor} />
        </div>
    );
}

export default RegisterInstructorModal;
