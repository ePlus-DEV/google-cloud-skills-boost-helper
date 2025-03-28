function Footer() {
    return (
        <footer className="mt-4 text-center text-gray-500">
            Copyright {new Date().getFullYear()} -{" "}
            <a href="http://eplus.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                ePlus.DEV
            </a>
        </footer>
    );
}


export default Footer;