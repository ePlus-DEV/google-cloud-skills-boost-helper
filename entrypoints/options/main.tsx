import { OptionsService, BrowserService } from "../../services";

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
      const message = chrome.i18n.getMessage(key);
      if (message) {
        element.textContent = message;
      }
    }
  }
}

// Show appropriate store badge based on browser
async function showBrowserStoreBadge() {
  const isFirefoxBrowser = await BrowserService.isFirefox();
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
});
