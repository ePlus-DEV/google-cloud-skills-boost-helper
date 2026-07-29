import OptionsService from "../../services/optionsService";
import { isFirefox } from "../../services/browserService";
import { initMarkdownToggle } from "./markdownToggle";
import { initDataManagementToggle } from "./dataManagementToggle";
import { initUIToggles } from "./uiToggles";
import { initNicknamePreview } from "./nicknamePreview";
import { initNotificationSettings } from "./notificationSettings";
import { initAccountCreationUX } from "./accountCreationUX";

type MessageKey = Parameters<typeof browser.i18n.getMessage>[0];

// Set document title
document.title =
  browser.i18n.getMessage("optionsPageTitle") ||
  "Options - Google Cloud Skills Boost Helper";

// Function to localize elements with data-i18n attributes
function localizeElements() {
  const elements = document.querySelectorAll("[data-i18n]");
  for (const element of elements) {
    const key = element.getAttribute("data-i18n");
    if (key && browser.i18n) {
      // Support the "[attr]key" form, e.g. data-i18n="[placeholder]nicknamePlaceholder"
      const attrMatch = key.match(/^\[([^\]]+)\](.+)$/);
      const lookupKey = attrMatch ? attrMatch[2] : key;
      const message = browser.i18n.getMessage(lookupKey as MessageKey);
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
  const chromeBadge = document.getElementById("chrome-store-badge");
  const firefoxBadge = document.getElementById("firefox-store-badge");

  if (await isFirefox()) {
    chromeBadge?.classList.add("hidden");
    firefoxBadge?.classList.remove("hidden");
  } else {
    firefoxBadge?.classList.add("hidden");
    chromeBadge?.classList.remove("hidden");
  }
}

async function initializeOptionsPage() {
  localizeElements();
  await showBrowserStoreBadge();
  await OptionsService.initialize();
  initMarkdownToggle();
  initDataManagementToggle();
  initUIToggles();
  initNicknamePreview();
  initNotificationSettings();
  initAccountCreationUX();
}

initializeOptionsPage().catch((error) => {
  console.error("Failed to initialize options page:", error);
});
