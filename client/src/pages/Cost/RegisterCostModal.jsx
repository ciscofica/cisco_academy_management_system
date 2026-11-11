import CostForm from "../../components/cost/CostForm";

function RegisterCostModal({ isOpen, onClose, cost }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <CostForm onClose={onClose} cost={cost} />
        </div>
    );
}

export default RegisterCostModal;
