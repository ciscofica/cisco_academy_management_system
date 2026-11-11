import PaymentForm from "../../components/payment/PaymentForm";

function RegisterPaymentModal({ isOpen, onClose, payment, defaultCourseId }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <PaymentForm onClose={onClose} payment={payment} defaultCourseId={defaultCourseId} />
        </div>
    );
}

export default RegisterPaymentModal;
