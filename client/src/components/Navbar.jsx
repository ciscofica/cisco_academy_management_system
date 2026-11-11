import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faUsers,
    faCogs,
    faUser,
    faBookOpen,
    faPerson,
    faMoneyBill,
    faMoneyCheck,
    faCertificate,
    faScaleBalanced,
    faUserAlt,
    faMoneyBill1Wave,
    faComputer,
    faBookOpenReader,
    faBan,
    faBuildingUser,
    faSwatchbook,
    faDiagramProject,
    faHourglass,
    faInfo,
    faMoneyCheckDollar,
    faPlayCircle,
    faChartBar,
    faDatabase
} from '@fortawesome/free-solid-svg-icons';

import profilePicture from '../assets/usuario.webp';
// import { faMoneyCheckDollar } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
    const { logout, isAuthenticated, user } = useAuth();
    const roleName = user?.userExists?.Role?.name || user?.user?.Role?.name;
    const rolePermissions = (user?.userExists?.Role?.Permissions || user?.user?.Role?.Permissions || []).filter((permission) => permission.status === "Activo" || permission.status === "1").map((permission) => permission.name);
    const isAdmin = roleName === "Administrador";
    const isStaff = isAdmin || roleName === "Gestor";
    const canManageCourses = isStaff || rolePermissions.includes("Gestionar cursos");
    const canManagePayments = isStaff || rolePermissions.includes("Gestionar pagos");
    const canReadInformation = rolePermissions.includes("Consultar información") || rolePermissions.includes("Consultar dashboard");
    const canViewCourses = canManageCourses || canReadInformation;
    const canViewPayments = canManagePayments || canReadInformation;
    const canManage = canViewCourses || canViewPayments;
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const drawerRef = useRef(null);

    const handleLogout = async () => {
        Cookies.remove('token');
        await logout();
        navigate('/login');
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(prevState => !prevState); // Alterna el estado del drawer
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsDrawerOpen(false); // Cierra el drawer si se hace clic fuera
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSection = (section) => {
        setExpandedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section], // Alterna la sección seleccionada
        }));
    };

    return (
        <>
            {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
            <nav className="bg-white border-b border-gray-200 flex justify-between items-center py-4 px-10 shadow-sm">
                <div className="flex items-center gap-3">
                    {isAuthenticated && canManage && (
                        <button
                            className="text-slate-500 hover:text-slate-800 hover:bg-gray-100 focus:outline-none rounded-lg p-2 transition-colors"
                            type="button"
                            onClick={toggleDrawer}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    )}
                    <Link to={'/'} className="flex items-center gap-2">
                        {/* Franja verde NetAcad a la izquierda del título */}
                        <span className="inline-block w-1 h-6 rounded-full bg-[#6cc24a]"></span>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            UTN CMS
                        </h1>
                    </Link>
                </div>

                <ul className="flex items-center gap-x-3">
                    {isAuthenticated ? (
                        <>
                            <li>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 text-sm text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
                                >
                                    <img className="w-6 h-6 rounded-full" src={profilePicture} alt="Profile Image" />
                                    <span className="font-medium">{user.userExists.name}</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-gray-300 rounded-full hover:bg-gray-100 hover:text-slate-800 transition-colors"
                                >
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link
                                to={"/login"}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#6cc24a] hover:bg-[#5aad3a] rounded-full transition-colors shadow-sm"
                            >
                                Iniciar Sesión
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            {/* ── DRAWER LATERAL ─────────────────────────────────────────────── */}
            {isAuthenticated && canManage && (
                <div
                    ref={drawerRef}
                    className={`fixed top-0 left-0 z-40 h-screen p-5 overflow-y-auto transition-transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} bg-white w-64 border-r border-gray-200 shadow-lg`}
                    tabIndex="-1"
                >
                    {/* Header del drawer */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <span className="inline-block w-1 h-5 rounded-full bg-[#6cc24a]"></span>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Menú</span>
                    </div>

                    {/* Sección: Gestión de Cursos */}
                    {canViewCourses && <>
                    <div className="pb-5">
                        <button
                            className="w-full text-left text-slate-700 font-semibold py-2 flex items-center gap-2 hover:text-[#6cc24a] transition-colors"
                            onClick={() => toggleSection("cursos")}
                        >
                            <FontAwesomeIcon icon={faBook} className="text-[#6cc24a]" />
                            Gestión de Cursos
                        </button>
                        {expandedSections.cursos && (
                            <ul className="pl-5 mt-1 space-y-1">
                                {canViewCourses && <><li><Link to="/courses" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faDiagramProject} className="w-3.5" />Cursos y catálogo</Link></li>{canManageCourses && <li><Link to="/course/start" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faPlayCircle} className="w-3.5" />Iniciar nuevo curso</Link></li>}<li><Link to="/courses/report" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faChartBar} className="w-3.5" />Reporte de cursos</Link></li></>}
                                {isStaff && <><li><Link to="/participant-types" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faPerson} className="w-3.5" />Tipos de Participante</Link></li><li><Link to="/infos_utn" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faInfo} className="w-3.5" />Info UTN</Link></li><li><Link to="/instructors" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faUserAlt} className="w-3.5" />Instructor</Link></li></>}
                            </ul>
                        )}
                    </div>
                    </>}

                    {/* Sección: Gestión de Detalle */}
                    {canViewPayments && <>
                    <div className="pb-5">
                        <button
                            className="w-full text-left text-slate-700 font-semibold py-2 flex items-center gap-2 hover:text-[#6cc24a] transition-colors"
                            onClick={() => toggleSection("detail")}
                        >
                            <FontAwesomeIcon icon={faCogs} className="text-[#6cc24a]" />
                            Gestión de Detalle
                        </button>
                        {expandedSections.detail && (
                            <ul className="pl-5 mt-1 space-y-1">
                                {canViewPayments && <li><Link to="/payments" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faMoneyBill} className="w-3.5" />Facturación y pagos</Link></li>}
                                {isStaff && <><li><Link to="/payment-types" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faMoneyCheck} className="w-3.5" />Tipos de pago</Link></li><li><Link to="/modalities" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faCogs} className="w-3.5" />Modalidades</Link></li></>}
                            </ul>
                        )}
                    </div>
                    </>}

                    {canReadInformation && !isStaff && <div className="pb-5">
                        <button className="w-full text-left text-slate-700 font-semibold py-2 flex items-center gap-2" onClick={() => toggleSection("consultas")}>
                            <FontAwesomeIcon icon={faUsers} className="text-[#6cc24a]" /> Consultas
                        </button>
                        {expandedSections.consultas && <ul className="pl-5 mt-1 space-y-1">
                            <li><Link to="/participants" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faPerson} className="w-3.5" />Participantes</Link></li>
                            <li><Link to="/users" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faUser} className="w-3.5" />Usuarios del sistema</Link></li>
                        </ul>}
                    </div>}

                    {isAdmin && <div className="pb-5">
                        <Link to="/backups" className="w-full text-left text-slate-700 font-semibold py-2 flex items-center gap-2 hover:text-[#6cc24a] transition-colors" onClick={() => setIsDrawerOpen(false)}>
                            <FontAwesomeIcon icon={faDatabase} className="text-[#6cc24a]" />
                            Respaldos de base de datos
                        </Link>
                    </div>}

                    {/* Sección: Gestión de Usuarios */}
                    {isAdmin && <div className="pb-5">
                        <button
                            className="w-full text-left text-slate-700 font-semibold py-2 flex items-center gap-2 hover:text-[#6cc24a] transition-colors"
                            onClick={() => toggleSection("usuarios")}
                        >
                            <FontAwesomeIcon icon={faUsers} className="text-[#6cc24a]" />
                            Gestión de Usuarios
                        </button>
                        {expandedSections.usuarios && (
                            <ul className="pl-5 mt-1 space-y-1">
                                {isAdmin && <><li><Link to="/users" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faUser} className="w-3.5" />Usuarios</Link></li><li><Link to="/roles" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faBuildingUser} className="w-3.5" />Roles</Link></li><li><Link to="/permissions" className="flex items-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setIsDrawerOpen(false)}><FontAwesomeIcon icon={faBan} className="w-3.5" />Permisos</Link></li></>}
                            </ul>
                        )}
                    </div>}
                </div>
            )}
        </>
    );
}

export default Navbar;
