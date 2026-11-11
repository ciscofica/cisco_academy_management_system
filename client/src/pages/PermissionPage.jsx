import { useEffect, useState } from "react";
import { usePermission } from "../context/PermissionContext";

function PermissionPage() {
  const { getPermissions, permissions, totalPages, currentPage, setCurrentPage } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getPermissions({ search: searchTerm, page: currentPage });
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

  return (
    <div className="p-6 bg-slate-50 min-h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Permisos del sistema</h1>
          <p className="text-sm text-slate-500 mt-1">Estas capacidades corresponden a funciones disponibles. Asígnelas a cada rol desde la gestión de roles.</p>
        </div>
        <input
          type="text"
          placeholder="Buscar permisos..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 p-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-x-auto max-h-[600px] min-h-[600px]">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.permission_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                  {permission.permission_id}
                </th>
                <td className="px-6 py-4 font-medium text-slate-700">{permission.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${permission.status === 'Activo' ? 'bg-[#edf7e6] text-[#3a8c25]' : 'bg-red-50 text-red-600'}`}>
                    {permission.status}
                  </span>
                </td>

                <td className="px-6 py-4">{permission.description}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

    </div>
  );
}

export default PermissionPage;
