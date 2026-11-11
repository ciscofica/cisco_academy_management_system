import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

function ProtectedRoute({ allowedRoles }) {

    const { loading, isAuthenticated, user } = useAuth();
    const location = useLocation();

    // console.log(loading, isAuthenticated);
    if (loading) return <h1>Loading....</h1>
    
    if (!loading && !isAuthenticated) return <Navigate to="/login" replace />

    const role = user?.userExists?.Role || user?.user?.Role;
    const roleName = role?.name;
    const permissions = role?.Permissions?.filter((permission) => permission.status === "Activo" || permission.status === "1").map((permission) => permission.name) || [];
    const isStaff = roleName === "Administrador" || roleName === "Gestor";
    const hasInformationPermission = permissions.includes("Consultar información") || permissions.includes("Consultar dashboard");
    const routePermission = /payment|payments|factur/i.test(location.pathname)
        ? "Gestionar pagos"
        : /course|courses/i.test(location.pathname)
            ? "Gestionar cursos"
            : null;
    const readOnlyPaths = [
        /^\/courses$/,
        /^\/courses\/report$/,
        /^\/payments$/,
        /^\/course\/\d+\/participants-report$/,
        /^\/participants$/,
        /^\/users$/,
        /^\/preview-course\/\d+$/,
    ];
    const canReadRoute = hasInformationPermission && readOnlyPaths.some((pattern) => pattern.test(location.pathname));
    const canManageRoute = isStaff || (routePermission && permissions.includes(routePermission));
    if (location.pathname === "/users" && roleName === "Gestor") return <Navigate to="/" replace />;
    if (["/backups", "/roles", "/permissions"].includes(location.pathname) && roleName !== "Administrador") return <Navigate to="/" replace />;
    if (location.pathname === "/users" && roleName !== "Administrador" && !hasInformationPermission) return <Navigate to="/" replace />;
    if (routePermission && !canManageRoute && !canReadRoute) return <Navigate to="/" replace />;
    if (!routePermission && allowedRoles?.length && !allowedRoles.includes(roleName)) return <Navigate to="/" replace />;

    return < Outlet />;

}

export default ProtectedRoute
