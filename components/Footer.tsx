import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/duotone-regular-svg-icons";

function Footer() {
  return (
    <footer className="mt-4 text-center text-gray-500">
      <FontAwesomeIcon icon={faCopyright} /> {new Date().getFullYear()} -{" "}
      <a
        href="http://eplus.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600"
      >
        ePlus.DEV
      </a>
    </footer>
  );
}

export default Footer;
