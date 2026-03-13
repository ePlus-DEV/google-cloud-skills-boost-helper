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
  | "rose"
  | "custom";

type BaseTheme = Exclude<Theme, "custom">;

type CustomThemePalette = {
  backgroundStart: string;
  backgroundMiddle: string;
  backgroundEnd: string;
  accent: string;
  arcadePoints: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  text?: string;
};

const DEFAULT_CUSTOM_THEME: CustomThemePalette = {
  backgroundStart: "#0f172a",
  backgroundMiddle: "#581c87",
  backgroundEnd: "#0f172a",
  accent: "#a855f7",
  arcadePoints: "#ffffff",
  textPrimary: "#ffffff",
  textSecondary: "#b3b3b3",
  textMuted: "#999999",
};

const CUSTOM_THEME_BASELINES: Record<BaseTheme, CustomThemePalette> = {
  dark: { ...DEFAULT_CUSTOM_THEME },
  light: {
    backgroundStart: "#f8fafc",
    backgroundMiddle: "#e0e7ff",
    backgroundEnd: "#f8fafc",
    accent: "#6366f1",
    arcadePoints: "#7c3aed",
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textMuted: "#64748b",
  },
  ocean: {
    backgroundStart: "#0c1a2e",
    backgroundMiddle: "#0d2d4a",
    backgroundEnd: "#0a2236",
    accent: "#38bdf8",
    arcadePoints: "#38bdf8",
    textPrimary: "#e2f3ff",
    textSecondary: "#b2d8ef",
    textMuted: "#7db6d9",
  },
  sunset: {
    backgroundStart: "#18100a",
    backgroundMiddle: "#2c1810",
    backgroundEnd: "#1e1008",
    accent: "#fb923c",
    arcadePoints: "#fb923c",
    textPrimary: "#fff2e5",
    textSecondary: "#ffd6b3",
    textMuted: "#e5b88f",
  },
  forest: {
    backgroundStart: "#0a1a12",
    backgroundMiddle: "#0f2b1c",
    backgroundEnd: "#0a1e13",
    accent: "#34d399",
    arcadePoints: "#34d399",
    textPrimary: "#e9fff4",
    textSecondary: "#b8e8d1",
    textMuted: "#8bc9ad",
  },
  purple: {
    backgroundStart: "#130d26",
    backgroundMiddle: "#1e1040",
    backgroundEnd: "#130d26",
    accent: "#a78bfa",
    arcadePoints: "#a78bfa",
    textPrimary: "#f3efff",
    textSecondary: "#d2c7ff",
    textMuted: "#afa2dc",
  },
  midnight: {
    backgroundStart: "#0f172a",
    backgroundMiddle: "#1e293b",
    backgroundEnd: "#334155",
    accent: "#94a3b8",
    arcadePoints: "#cbd5e1",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
  },
  rose: {
    backgroundStart: "#1a0c12",
    backgroundMiddle: "#2a1020",
    backgroundEnd: "#1a0c12",
    accent: "#f472b6",
    arcadePoints: "#f472b6",
    textPrimary: "#ffeef7",
    textSecondary: "#f7c9df",
    textMuted: "#d9a7bf",
  },
};

// Define WXT storage item for theme
const themeStorage = storage.defineItem<Theme>("local:popupTheme", {
  defaultValue: "dark",
});

const customThemeStorage = storage.defineItem<CustomThemePalette>(
  "local:popupCustomTheme",
  {
    defaultValue: DEFAULT_CUSTOM_THEME,
  },
);

function getBaselinePalette(theme: BaseTheme): CustomThemePalette {
  return { ...CUSTOM_THEME_BASELINES[theme] };
}

function toRgbChannels(hexColor: string): string {
  const normalized = hexColor.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "34, 211, 238";
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color.trim());
}

function normalizePaletteValue(value: string, fallback: string): string {
  return isValidHexColor(value) ? value.trim() : fallback;
}

function applyCustomThemeVariables(palette: CustomThemePalette): void {
  const root = document.documentElement;

  root.style.setProperty("--custom-bg-start", palette.backgroundStart);
  root.style.setProperty("--custom-bg-middle", palette.backgroundMiddle);
  root.style.setProperty("--custom-bg-end", palette.backgroundEnd);
  root.style.setProperty("--custom-accent", palette.accent);
  root.style.setProperty("--custom-accent-rgb", toRgbChannels(palette.accent));
  root.style.setProperty("--custom-arcade-points", palette.arcadePoints);
  root.style.setProperty("--custom-text-primary", palette.textPrimary);
  root.style.setProperty("--custom-text-secondary", palette.textSecondary);
  root.style.setProperty("--custom-text-muted", palette.textMuted);
}

function sanitizePalette(
  palette: Partial<CustomThemePalette>,
): CustomThemePalette {
  const legacyText = normalizePaletteValue(
    palette.text || "",
    DEFAULT_CUSTOM_THEME.textPrimary,
  );

  return {
    backgroundStart: normalizePaletteValue(
      palette.backgroundStart || "",
      DEFAULT_CUSTOM_THEME.backgroundStart,
    ),
    backgroundMiddle: normalizePaletteValue(
      palette.backgroundMiddle || "",
      DEFAULT_CUSTOM_THEME.backgroundMiddle,
    ),
    backgroundEnd: normalizePaletteValue(
      palette.backgroundEnd || "",
      DEFAULT_CUSTOM_THEME.backgroundEnd,
    ),
    accent: normalizePaletteValue(
      palette.accent || "",
      DEFAULT_CUSTOM_THEME.accent,
    ),
    arcadePoints: normalizePaletteValue(
      palette.arcadePoints || "",
      DEFAULT_CUSTOM_THEME.arcadePoints,
    ),
    textPrimary: normalizePaletteValue(palette.textPrimary || "", legacyText),
    textSecondary: normalizePaletteValue(
      palette.textSecondary || "",
      DEFAULT_CUSTOM_THEME.textSecondary,
    ),
    textMuted: normalizePaletteValue(
      palette.textMuted || "",
      DEFAULT_CUSTOM_THEME.textMuted,
    ),
  };
}

function syncCustomThemeInputs(palette: CustomThemePalette): void {
  const startInput = document.getElementById(
    "custom-theme-bg-start",
  ) as HTMLInputElement | null;
  const middleInput = document.getElementById(
    "custom-theme-bg-middle",
  ) as HTMLInputElement | null;
  const endInput = document.getElementById(
    "custom-theme-bg-end",
  ) as HTMLInputElement | null;
  const accentInput = document.getElementById(
    "custom-theme-accent",
  ) as HTMLInputElement | null;
  const arcadePointsInput = document.getElementById(
    "custom-theme-arcade-points",
  ) as HTMLInputElement | null;
  const textPrimaryInput = document.getElementById(
    "custom-theme-text-primary",
  ) as HTMLInputElement | null;
  const textSecondaryInput = document.getElementById(
    "custom-theme-text-secondary",
  ) as HTMLInputElement | null;
  const textMutedInput = document.getElementById(
    "custom-theme-text-muted",
  ) as HTMLInputElement | null;

  if (startInput) startInput.value = palette.backgroundStart;
  if (middleInput) middleInput.value = palette.backgroundMiddle;
  if (endInput) endInput.value = palette.backgroundEnd;
  if (accentInput) accentInput.value = palette.accent;
  if (arcadePointsInput) arcadePointsInput.value = palette.arcadePoints;
  if (textPrimaryInput) textPrimaryInput.value = palette.textPrimary;
  if (textSecondaryInput) textSecondaryInput.value = palette.textSecondary;
  if (textMutedInput) textMutedInput.value = palette.textMuted;
}

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
    "theme-custom",
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

async function getSavedCustomTheme(): Promise<CustomThemePalette> {
  const storedPalette = await customThemeStorage.getValue();
  return sanitizePalette(storedPalette || DEFAULT_CUSTOM_THEME);
}

async function getResetPaletteFromBaseTheme(): Promise<CustomThemePalette> {
  return getBaselinePalette("dark");
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
  const savedPalette = await getSavedCustomTheme();
  applyCustomThemeVariables(savedPalette);
  syncCustomThemeInputs(savedPalette);

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
      const applyCustomThemeButton = document.getElementById(
        "apply-custom-theme",
      ) as HTMLButtonElement | null;
      const resetCustomThemeButton = document.getElementById(
        "reset-custom-theme",
      ) as HTMLButtonElement | null;
      const openThemeStudioButton = document.getElementById(
        "open-theme-studio",
      ) as HTMLButtonElement | null;

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

            if (selectedTheme !== "custom") {
              // Optional: close modal after selection
              setTimeout(() => {
                closeThemeModal();
              }, 300);
            }
          }
        });
      });

      if (applyCustomThemeButton) {
        applyCustomThemeButton.addEventListener("click", async () => {
          const startInput = document.getElementById(
            "custom-theme-bg-start",
          ) as HTMLInputElement | null;
          const middleInput = document.getElementById(
            "custom-theme-bg-middle",
          ) as HTMLInputElement | null;
          const endInput = document.getElementById(
            "custom-theme-bg-end",
          ) as HTMLInputElement | null;
          const accentInput = document.getElementById(
            "custom-theme-accent",
          ) as HTMLInputElement | null;
          const arcadePointsInput = document.getElementById(
            "custom-theme-arcade-points",
          ) as HTMLInputElement | null;
          const textPrimaryInput = document.getElementById(
            "custom-theme-text-primary",
          ) as HTMLInputElement | null;
          const textSecondaryInput = document.getElementById(
            "custom-theme-text-secondary",
          ) as HTMLInputElement | null;
          const textMutedInput = document.getElementById(
            "custom-theme-text-muted",
          ) as HTMLInputElement | null;

          const nextPalette = sanitizePalette({
            backgroundStart:
              startInput?.value || DEFAULT_CUSTOM_THEME.backgroundStart,
            backgroundMiddle:
              middleInput?.value || DEFAULT_CUSTOM_THEME.backgroundMiddle,
            backgroundEnd:
              endInput?.value || DEFAULT_CUSTOM_THEME.backgroundEnd,
            accent: accentInput?.value || DEFAULT_CUSTOM_THEME.accent,
            arcadePoints:
              arcadePointsInput?.value || DEFAULT_CUSTOM_THEME.arcadePoints,
            textPrimary:
              textPrimaryInput?.value || DEFAULT_CUSTOM_THEME.textPrimary,
            textSecondary:
              textSecondaryInput?.value || DEFAULT_CUSTOM_THEME.textSecondary,
            textMuted: textMutedInput?.value || DEFAULT_CUSTOM_THEME.textMuted,
          });

          await customThemeStorage.setValue(nextPalette);
          applyCustomThemeVariables(nextPalette);
          syncCustomThemeInputs(nextPalette);
          await applyTheme("custom");
        });
      }

      if (resetCustomThemeButton) {
        resetCustomThemeButton.addEventListener("click", async () => {
          const basePalette = await getResetPaletteFromBaseTheme();
          await customThemeStorage.setValue(basePalette);
          applyCustomThemeVariables(basePalette);
          syncCustomThemeInputs(basePalette);
          await applyTheme("custom");
        });
      }

      if (openThemeStudioButton) {
        openThemeStudioButton.addEventListener("click", () => {
          const studioUrl = chrome.runtime.getURL("theme-studio.html");
          window.open(studioUrl, "_blank");
        });
      }
    }, 0);
  });
});
