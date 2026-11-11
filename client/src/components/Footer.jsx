function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-5">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Facultad de Ingeniería en Ciencias Aplicadas · UTN. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
