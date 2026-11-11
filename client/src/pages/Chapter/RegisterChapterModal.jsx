import ChapterForm from "../../components/chapter/ChapterForm";

function RegisterChapterModal({ isOpen, onClose, chapter }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <ChapterForm onClose={onClose} chapter={chapter} />
        </div>
    );
}

export default RegisterChapterModal;
