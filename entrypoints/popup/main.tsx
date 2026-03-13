import { PopupService, AccountService } from "../../services";
import PopupUIService from "../../services/popupUIService";

// Theme management
type Theme = "dark" | "light" | "ocean" | "sunset" | "forest" | "purple" | "midnight" | "rose";

// Define WXT storage item for theme
const themeStorage = storage.defineItem<Theme>("local:popupTheme", {
  defaultValue: "dark",
});

// Function to apply theme
async function applyTheme(theme: Theme) {
  const body = document.body;
  
  // Remove all theme classes
  const themeClasses = ["theme-dark", "theme-light", "theme-ocean", "theme-sunset", "theme-forest", "theme-purple", "theme-midnight", "theme-rose"];
  themeClasses.forEach(cls => body.classList.remove(cls));
  
  // Add new theme class (except for default dark)
  if (theme !== "dark") {
    body.classList.add(`theme-${theme}`);
  }
  
  // Update active state in modal
  document.querySelectorAll(".theme-option").forEach(option => {
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

// Set document title
document.title =
  chrome.i18n.getMessage("extName") || "Google Cloud Skills Boost - Helper";

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

// Set document title
document.title =
  chrome.i18n.getMessage("extName") || "Google Cloud Skills Boost - Helper";

// Initialize theme
(async () => {
  const savedTheme = await getSavedTheme();
  await applyTheme(savedTheme);
})();

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
      const copyBtn = document.getElementById("copy-profile-url");
      if (copyBtn) {
        copyBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get URL from active account
          const activeAccount = await AccountService.getActiveAccount();
          const profileUrl =
            activeAccount?.profileUrl || PopupService.profileUrl;

          if (profileUrl) {
            try {
              await navigator.clipboard.writeText(profileUrl);

              // Visual feedback
              const originalIcon = copyBtn.innerHTML;
              copyBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
              copyBtn.classList.add(
                "text-green-400",
                "bg-green-400/20",
                "border-green-400/50",
              );
              copyBtn.classList.remove(
                "text-blue-400",
                "bg-blue-400/20",
                "border-blue-400/30",
              );
              copyBtn.title = "Copied!";

              setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.classList.remove(
                  "text-green-400",
                  "bg-green-400/20",
                  "border-green-400/50",
                );
                copyBtn.classList.add(
                  "text-blue-400",
                  "bg-blue-400/20",
                  "border-blue-400/30",
                );
                copyBtn.title = "Copy Profile URL";
              }, 1500);
            } catch (error) {
              console.error("Main.tsx: Copy failed:", error);
            }
          }
        });
      }

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
    }, 500); // Wait 500ms to ensure DOM is ready
  });
});
