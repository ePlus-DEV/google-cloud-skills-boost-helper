import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/duotone-regular-svg-icons";
import { createRoot } from "react-dom/client";

document.title = browser.i18n.getMessage("optionsPageTitle");

declare const messageH1: HTMLHeadingElement;
messageH1.textContent = browser.i18n.getMessage("optionsPageTitle");

// render fontawrsome icons vào id messageH2
const messageH2 = document.getElementById("messageH2");
if (messageH2) {
	const root = createRoot(messageH2);
	root.render(<FontAwesomeIcon icon={faCrown} />);
}
