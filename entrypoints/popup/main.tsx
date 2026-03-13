import { PopupService, AccountService } from "../../services";
import PopupUIService from "../../services/popupUIService";

// Theme management
type Theme =
  | "dark"
  | "light"
  | "ocean"
  | "sunset"
  | "forest"
  | "purple"
  | "midnight"
  | "rose";

// Define WXT storage item for theme
const themeStorage = storage.defineItem<Theme>("local:popupTheme", {
  defaultValue: "dark",
});

// Function to apply theme
async function applyTheme(theme: Theme) {
  const body = document.body;

  // Remove all theme classes
  const themeClasses = [
    "theme-dark",
    "theme-light",
    "theme-ocean",
    "theme-sunset",
    "theme-forest",
    "theme-purple",
    "theme-midnight",
    "theme-rose",
  ];
  themeClasses.forEach((cls) => body.classList.remove(cls));

  // Add new theme class (except for default dark)
  if (theme !== "dark") {
    body.classList.add(`theme-${theme}`);
  }

  // Update active state in modal
  document.querySelectorAll(".theme-option").forEach((option) => {
    option.classList.remove("active");
    const optionElement = option as HTMLElement;
    if (optionElement.dataset.theme === theme) {
      option.classList.add("active");
    }
  });

  // Save theme preference using WXT storage
  await themeStorage.setValue(theme);
}

// Function to get saved theme
async function getSavedTheme(): Promise<Theme> {
  return await themeStorage.getValue();
}

// Function to open theme modal
function openThemeModal() {
  const modal = document.getElementById("theme-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

// Function to close theme modal
function closeThemeModal() {
  const modal = document.getElementById("theme-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/**
 * Shows a temporary tooltip message on the copy button.
 */
function showCopyTooltip(
  button: HTMLButtonElement,
  message: string,
  duration = 1500,
): void {
  const previousTooltipTimer = Number(button.dataset.tooltipTimerId || "0");
  if (previousTooltipTimer) {
    clearTimeout(previousTooltipTimer);
    delete button.dataset.tooltipTimerId;
  }

  button.dataset.copyTooltip = message;

  const tooltipTimerId = globalThis.setTimeout(() => {
    const defaultMessage =
      chrome.i18n.getMessage("copyProfileUrl") || "Copy Profile URL";
    button.dataset.copyTooltip = defaultMessage;
    delete button.dataset.tooltipTimerId;
  }, duration);
  button.dataset.tooltipTimerId = String(tooltipTimerId);
}

/**
 * Initializes copy-profile-url button behavior and visual state transitions.
 */
function setupCopyProfileButton(): void {
  const copyBtn = document.getElementById(
    "copy-profile-url",
  ) as HTMLButtonElement | null;
  if (!copyBtn) return;
  if (copyBtn.dataset.bound === "1") return;

  const defaultMessage =
    chrome.i18n.getMessage("copyProfileUrl") || "Copy Profile URL";

  /**
   * Renders the icon content for the copy profile URL button.
   */
  const renderCopyButtonContent = (iconClass: string) => {
    copyBtn.innerHTML = `<i class="fa-solid ${iconClass} text-xs"></i>`;
  };

  /**
   * Restores copy button state and optionally keeps the current tooltip message.
   */
  const resetCopyButton = (preserveTooltip = false) => {
    copyBtn.disabled = false;
    renderCopyButtonContent("fa-copy");
    copyBtn.classList.remove(
      "text-green-400",
      "bg-green-400/20",
      "border-green-400/50",
      "text-amber-300",
      "bg-amber-400/20",
      "border-amber-400/50",
    );
    copyBtn.classList.add(
      "text-blue-400",
      "bg-blue-400/20",
      "border-blue-400/30",
    );
    if (!preserveTooltip) {
      copyBtn.dataset.copyTooltip = defaultMessage;
    }
  };

  resetCopyButton();
  copyBtn.dataset.bound = "1";

  copyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const previousTimerId = Number(copyBtn.dataset.resetTimerId || "0");
    if (previousTimerId) {
      clearTimeout(previousTimerId);
      delete copyBtn.dataset.resetTimerId;
    }

    copyBtn.disabled = true;
    renderCopyButtonContent("fa-spinner fa-spin");
    copyBtn.classList.add(
      "text-amber-300",
      "bg-amber-400/20",
      "border-amber-400/50",
    );
    copyBtn.classList.remove(
      "text-blue-400",
      "bg-blue-400/20",
      "border-blue-400/30",
      "text-green-400",
      "bg-green-400/20",
      "border-green-400/50",
    );

    const activeAccount = await AccountService.getActiveAccount();
    const profileUrl = activeAccount?.profileUrl || PopupService.profileUrl;

    if (!profileUrl) {
      showCopyTooltip(
        copyBtn,
        chrome.i18n.getMessage("errorNoActiveAccountOrProfileUrl") ||
          defaultMessage,
      );
      resetCopyButton(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(profileUrl);

      renderCopyButtonContent("fa-check");
      copyBtn.classList.add(
        "text-green-400",
        "bg-green-400/20",
        "border-green-400/50",
      );
      copyBtn.classList.remove(
        "text-amber-300",
        "bg-amber-400/20",
        "border-amber-400/50",
        "text-blue-400",
        "bg-blue-400/20",
        "border-blue-400/30",
      );

      const copiedMessage =
        chrome.i18n.getMessage("messageLinkCopiedToClipboard") ||
        defaultMessage;
      showCopyTooltip(copyBtn, copiedMessage);

      const resetTimerId = globalThis.setTimeout(() => {
        resetCopyButton();
        delete copyBtn.dataset.resetTimerId;
      }, 1500);
      copyBtn.dataset.resetTimerId = String(resetTimerId);
    } catch (error) {
      showCopyTooltip(
        copyBtn,
        chrome.i18n.getMessage("accountErrorFallback") || defaultMessage,
      );
      resetCopyButton(true);
      console.error("Main.tsx: Copy failed:", error);
    }
  });
}

// Set document title
document.title =
  chrome.i18n.getMessage("extName") || "Google Cloud Skills Boost - Helper";

// Function to localize elements with data-i18n attributes
function localizeElements() {
  const elements = document.querySelectorAll("[data-i18n]");
  for (const element of elements) {
    const key = (element as HTMLElement).dataset.i18n;
    if (key && chrome.i18n) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        element.textContent = message;
      }
    }
  }

  const titleElements = document.querySelectorAll("[data-i18n-title]");
  for (const element of titleElements) {
    const key = (element as HTMLElement).dataset.i18nTitle;
    if (key && chrome.i18n) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        element.setAttribute("title", message);
      }
    }
  }
}

// Set document title
document.title =
  chrome.i18n.getMessage("extName") || "Google Cloud Skills Boost - Helper";

// Initialize theme
(async () => {
  const savedTheme = await getSavedTheme();
  await applyTheme(savedTheme);
})();

// Bind copy handler immediately so first click always works.
setupCopyProfileButton();

// Initialize the popup when the script loads
PopupService.initialize().then(() => {
  // Apply i18n translations
  localizeElements();

  // Initialize milestones section and countdown with Firebase Remote Config
  PopupUIService.updateMilestoneSection().then(async () => {
    // Start Firebase-powered countdown
    try {
      await PopupUIService.startFacilitatorCountdown();
    } catch (err) {
      console.error("popup: failed to start facilitator countdown:", err);
    }

    // Add copy button event listener after initialization
    setTimeout(() => {
      setupCopyProfileButton();

      // Theme modal event listeners
      const themeToggleBtn = document.querySelector(
        ".theme-toggle-button",
      ) as HTMLButtonElement;
      const closeModalBtn = document.getElementById("close-theme-modal");
      const themeOptions = document.querySelectorAll(".theme-option");

      // Open theme modal
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
          openThemeModal();
        });
      }

      // Close theme modal
      if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
          closeThemeModal();
        });
      }

      // Close modal when clicking outside
      const themeModal = document.getElementById("theme-modal");
      if (themeModal) {
        themeModal.addEventListener("click", (e) => {
          if (e.target === themeModal) {
            closeThemeModal();
          }
        });
      }

      // Apply theme when option is clicked
      themeOptions.forEach((option) => {
        option.addEventListener("click", async () => {
          const optionElement = option as HTMLElement;
          const selectedTheme = optionElement.dataset.theme as Theme;
          if (selectedTheme) {
            await applyTheme(selectedTheme);
            // Optional: close modal after selection
            setTimeout(() => {
              closeThemeModal();
            }, 300);
          }
        });
      });
    }, 0);
  });
});
