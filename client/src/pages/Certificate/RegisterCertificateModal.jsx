import CertificateForm from "../../components/certificate/CertificateForm";

function RegisterCertificateModal({ isOpen, onClose, certificate }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <CertificateForm onClose={onClose} certificate={certificate} />
        </div>
    );
}

export default RegisterCertificateModal;
