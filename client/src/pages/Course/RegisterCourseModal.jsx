import CourseForm from "../../components/course/CourseForm";

function RegisterCourseModal({ isOpen, onClose, course }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <CourseForm onClose={onClose} course={course} />
    </div>
  );
}

export default RegisterCourseModal;
