import { OptionsService } from "../../services";

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

// Initialize options page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  OptionsService.initialize();
  localizeElements();
});
