import PaymentTypeForm from "../../components/paymentType/PaymentTypeForm";

function RegisterPaymentTypeModal({ isOpen, onClose, payment_type }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <PaymentTypeForm onClose={onClose} payment_type={payment_type} />
    </div>
  );
}

export default RegisterPaymentTypeModal;
