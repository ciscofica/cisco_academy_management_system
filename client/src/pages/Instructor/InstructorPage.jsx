import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useInstructor } from "../../context/InstructorContext";
import RegisterInstructorModal from "./RegisterInstructorModal";

function PermissionPage() {
  const { getInstructors, instructors, totalPages, currentPage, setCurrentPage } = useInstructor();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);


  useEffect(() => {
    getInstructors({ search: searchTerm, page: currentPage });
  }, [searchTerm, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (instructor) => {
    setSelectedInstructor(instructor);
    setIsRegisterModalOpen(true);
  };
  console.log("--------")
  console.log(instructors);
  console.log("--------")


  return (
    <div className="p-6 bg-slate-50 min-h-screen overflow-hidden">
      <div className="flex justify-between mb-6 gap-3 items-center">
        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar Instructor..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 p-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm"
        />
        <div className="flex space-x-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-sm font-medium transition-colors shadow-sm"
          >
            Registrar Instructor
          </button>
          </div>
      </div>

      {/* Tabla de permisos con formato actualizado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-x-auto max-h-[600px] min-h-[600px]">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Identificación</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Celular</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">RUC</th>
              <th scope="col" className="px-6 py-3">Certificado Bancario Url</th>
              {/* <th scope="col" className="px-6 py-3 text-red-500">DETAIL TEST</th> */}
              <th scope="col" className="px-6 py-3">Acciones</th>

            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.instructor_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                  {instructor.instructor_id}
                </th>
                <td className="px-6 py-4 text-slate-600">{instructor.identification_number}</td>
                <td className="px-6 py-4 text-slate-600">{instructor.name}</td>
                <td className="px-6 py-4 text-slate-600">{instructor.phone}</td>
                <td className="px-6 py-4 text-slate-600">{instructor.email}</td>
                <td className="px-6 py-4 text-slate-600">{instructor.ruc_number}</td>
                <td className="px-6 py-4 text-slate-600">{instructor.banck_certificate_url}</td>
                {/* <td className="px-6 py-4">{instructor.Details[0]?.detail_id}</td> */}
                <td className="px-6 py-4 flex space-x-3">
                  <button className="text-amber-500 hover:text-amber-600 transition-colors" onClick={() => handleEdit(instructor)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-6 space-x-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors'}`}
        >
          Anterior
        </button>
        <span className="text-sm text-slate-500">Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors'}`}
        >
          Siguiente
        </button>
      </div>

      {/* Modales */}
      <RegisterInstructorModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} instructor={selectedInstructor} />

    </div>
  );
}

export default PermissionPage;
