import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { useParticipant } from "../../context/ParticipantContext";
import RegisterParticipantModal from "../participant/RegisterParticipantModal";
import ParticipantReportsModal from "./ParticipantReportModal";
import UploadExcelModal from "./UploadExcelModal";

function ParticipantPage() {

    const { participants, getParticipants, totalPages, currentPage, setCurrentPage } = useParticipant();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        getParticipants({ search: searchTerm, page: currentPage });

        console.log("-------------");
        console.log(participants);
        console.log("-------------");

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

    const handleEdit = (participant) => {
        setSelectedParticipant(participant);
        setIsRegisterModalOpen(true);
    };

    const handleDelete = (participantId) => {
        console.log(participantId);
        // deleteCertificates(participantId); // Llama a la función de eliminación
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen overflow-hidden">
            <div className="flex justify-between mb-6 gap-3 items-center">
                <input
                    type="text"
                    placeholder="Buscar participantes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full md:w-1/3 p-2 rounded-xl border border-gray-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#049fd9] focus:ring-2 focus:ring-[#049fd9]/20 transition text-sm"

                />
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setSelectedParticipant(null);
                            setIsRegisterModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl text-white bg-[#6cc24a] hover:bg-[#5aad3a] text-sm font-medium transition-colors shadow-sm"
                    >
                        Registrar Participante
                    </button>
                    <button
                        onClick={() => setIsReportsModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-slate-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        Reportes
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-slate-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        Cargar desde Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-x-auto max-h-[600px] min-h-[600px]">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Curso Actual</th>
                            {/* <th scope="col" className="px-6 py-3">Edad</th> */}
                            <th scope="col" className="px-6 py-3">CI</th>
                            <th scope="col" className="px-6 py-3">Teléfono</th>
                            <th scope="col" className="px-6 py-3">Dirección</th>
                            <th scope="col" className="px-6 py-3">Institución</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Registrado</th>
                            <th scope="col" className="px-6 py-3">Matriculado</th>
                            <th scope="col" className="px-6 py-3">Aprobado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant) => (
                            <tr key={participant.participant_id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                    {participant.participant_id}
                                </th>
                                <td className="px-6 py-4 text-slate-600">{participant.name}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.Courses[0]?.course_name ?? "Sin Registros"}</td>
                                {/* <td className="px-6 py-4">{participant.age}</td> */}
                                <td className="px-6 py-4 text-slate-600">{participant.cid}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.phone}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.address}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.institution}</td>
                                {/* <td className="px-6 py-4">{participant.ParticipantType != "" || participant.ParticipantType != null ? participant.ParticipantType.name : ""}</td> */}
                                <td className="px-6 py-4 text-slate-600">
                                    {participant.ParticipantType ? participant.ParticipantType.name : ""}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{participant.registered == 1 ? "Registrado" : "Pendiente"}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.enrolled == 1 ? "Matriculado" : "Pendiente"}</td>
                                <td className="px-6 py-4 text-slate-600">{participant.approval == 1 ? "Aprobado" : "Pendiente"}</td>
                                {/* <td className="px-6 py-4">{participant.is_international == false ? "NO" : "SI"}</td> */}
                                {/* <td className="px-6 py-4">{certificate.file_url}</td> */}

                                <td className="px-6 py-4 flex space-x-3">
                                    <button className="text-[#049fd9] hover:text-[#0380b0] transition-colors">
                                        <FontAwesomeIcon icon={faUser} />
                                    </button>
                                    <button className="text-amber-500 hover:text-amber-600 transition-colors" onClick={() => handleEdit(participant)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600 transition-colors" onClick={() => handleDelete(participant.participant_id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
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

            <RegisterParticipantModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} participant={selectedParticipant} />
            <ParticipantReportsModal isOpen={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} />
            <UploadExcelModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

        </div >
    );
}

export default ParticipantPage;
