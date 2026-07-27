import OptionsService from "../../services/optionsService";
import { isFirefox } from "../../services/browserService";
import { initMarkdownToggle } from "./markdownToggle";
import { initDataManagementToggle } from "./dataManagementToggle";
import { initUIToggles } from "./uiToggles";
import { initNicknamePreview } from "./nicknamePreview";
import { initNotificationSettings } from "./notificationSettings";

// Set document title
document.title =
  chrome.i18n.getMessage("optionsPageTitle") ||
  "Options - Google Cloud Skills Boost Helper";

// Function to localize elements with data-i18n attributes
function localizeElements() {
  const elements = document.querySelectorAll("[data-i18n]");
  for (const element of elements) {
    const key = element.getAttribute("data-i18n");
    if (key && chrome.i18n) {
      // Support the "[attr]key" form, e.g. data-i18n="[placeholder]nicknamePlaceholder"
      const attrMatch = key.match(/^\[([^\]]+)\](.+)$/);
      const lookupKey = attrMatch ? attrMatch[2] : key;
      const message = chrome.i18n.getMessage(lookupKey);
      if (!message) continue;

      if (attrMatch) {
        element.setAttribute(attrMatch[1], message);
      } else if (element.childElementCount === 0) {
        element.textContent = message;
      } else {
        // Preserve child elements (icons, badges) — replace only the text node
        const textNode = Array.from(element.childNodes).find(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        if (textNode) {
          textNode.textContent = message;
        } else {
          element.insertBefore(
            document.createTextNode(message),
            element.firstChild,
          );
        }
      }
    }
  }
}

// Show appropriate store badge based on browser
async function showBrowserStoreBadge() {
  const isFirefoxBrowser = await isFirefox();
  const chromeStoreBadge = document.getElementById("chrome-web-store-badge");
  const firefoxAddonStore = document.getElementById("firefox-addon-store");

  if (isFirefoxBrowser) {
    // Firefox browser - show Firefox badge
    if (firefoxAddonStore) firefoxAddonStore.classList.remove("hidden");
    if (chromeStoreBadge) chromeStoreBadge.classList.add("hidden");
  } else {
    // Chrome/Edge/Brave browser - show Chrome badge
    if (chromeStoreBadge) chromeStoreBadge.classList.remove("hidden");
    if (firefoxAddonStore) firefoxAddonStore.classList.add("hidden");
  }
}

// Initialize options page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  OptionsService.initialize();
  localizeElements();
  showBrowserStoreBadge();

  // Initialize UI interactions
  initMarkdownToggle();
  initDataManagementToggle();
  initUIToggles();
  initNicknamePreview();
  initNotificationSettings();
});
