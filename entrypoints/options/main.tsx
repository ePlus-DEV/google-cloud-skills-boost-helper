import { OptionsService } from "../../services";

// Function to localize elements with data-i18n attributes
function localizeElements() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key && browser.i18n) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (browser.i18n as any).getMessage(key);
      if (message) {
        element.textContent = message;
      }
    }
  });
}

// Initialize options page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  OptionsService.initialize();
  localizeElements();
});
