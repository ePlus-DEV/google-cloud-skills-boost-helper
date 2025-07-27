import { UAParser } from "ua-parser-js";
import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import PopupUIService from "./popupUIService";
import type { ArcadeData } from "../types";

/**
 * Service to handle options page functionality
 */
const OptionsService = {
  /**
   * Initialize options page
   */
  async initialize(): Promise<void> {
    OptionsService.setupEventListeners();
    OptionsService.setupVersion();
    OptionsService.setupBrowserBadges();
    OptionsService.setupI18n();
    await OptionsService.loadExistingData();
    await OptionsService.loadSearchFeatureSetting();
  },

  /**
   * Setup event listeners for options page
   */
  setupEventListeners(): void {
    // Submit URL button
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
      submitUrlElement.addEventListener("click", () =>
        OptionsService.handleSubmit()
      );
    }

    // Video toggle button
    const toggleVideoButton = document.getElementById("toggle-video");
    if (toggleVideoButton) {
      toggleVideoButton.addEventListener("click", () => {
        const videoContainer = document.getElementById("video-container");
        if (videoContainer) {
          videoContainer.style.display =
            videoContainer.style.display === "none" ? "flex" : "none";
        }
      });
    }

    // Search feature toggle
    const searchFeatureToggle = document.getElementById(
      "search-feature-toggle"
    ) as HTMLInputElement;
    if (searchFeatureToggle) {
      searchFeatureToggle.addEventListener("change", () => {
        OptionsService.handleSearchFeatureToggle(searchFeatureToggle.checked);
      });
    }

    // Prize tiers with cache busting
    const prizeTiersElement =
      PopupUIService.querySelector<HTMLImageElement>("#prize-tiers");
    if (prizeTiersElement) {
      const currentTime = new Date().getTime();
      prizeTiersElement.src = `${prizeTiersElement.src}?t=${currentTime}`;
    }
  },

  /**
   * Setup version display
   */
  setupVersion(): void {
    const manifest = browser.runtime.getManifest();
    const versionElement = PopupUIService.querySelector("#version-number");
    if (versionElement) {
      versionElement.textContent = `v${manifest.version}`;
    }
  },

  /**
   * Setup browser-specific badges
   */
  setupBrowserBadges(): void {
    const parser = new UAParser();
    const browserName = parser.getBrowser().name;

    const badgeSelectors: Record<string, string> = {
      Chrome: "#chrome-web-store-badge",
      Firefox: "#firefox-addon-store",
    };

    const badgeSelector = badgeSelectors[browserName || ""];
    if (badgeSelector) {
      PopupUIService.querySelector(badgeSelector)?.classList.remove("hidden");
    }
  },

  /**
   * Setup i18n translations
   */
  setupI18n(): void {
    // Find all elements with data-i18n attribute
    const i18nElements = document.querySelectorAll("[data-i18n]");

    i18nElements.forEach((element) => {
      const messageKey = element.getAttribute("data-i18n");
      if (messageKey) {
        try {
          const translatedText = browser.i18n.getMessage(messageKey as Parameters<typeof browser.i18n.getMessage>[0]);
          if (translatedText) {
            element.textContent = translatedText;
          }
        } catch (error: unknown) {
          console.error("Error saving search feature setting:", error);
        }
      }
    });
  },

  /**
   * Load existing data from storage
   */
  async loadExistingData(): Promise<void> {
    const profileUrl = await StorageService.getProfileUrl();
    const profileUrlInput = PopupUIService.querySelector<HTMLInputElement>(
      "#public-profile-url"
    );

    if (profileUrlInput) {
      profileUrlInput.value = profileUrl;
    }

    const arcadeData = await StorageService.getArcadeData();
    if (arcadeData) {
      PopupUIService.updateOptionsUI(arcadeData);
    } else {
      PopupUIService.toggleElementVisibility("#arcade-points", false);
    }
  },

  /**
   * Handle form submission
   */
  async handleSubmit(): Promise<void> {
    const submitUrlElement = document.getElementById("submit-url");
    const profileUrlInput = PopupUIService.querySelector<HTMLInputElement>(
      "#public-profile-url"
    );

    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelLoading");
    }

    const profileUrl = profileUrlInput?.value;

    // Validate URL
    if (!profileUrl || !ArcadeApiService.isValidProfileUrl(profileUrl)) {
      PopupUIService.showMessage(
        "#error-message",
        browser.i18n.getMessage("errorInvalidUrl"),
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
      OptionsService.resetSubmitButton();
      return;
    }

    try {
      const arcadeData = await ArcadeApiService.fetchArcadeData(profileUrl);

      if (arcadeData) {
        await OptionsService.displayUserDetails(arcadeData);
        await StorageService.saveProfileUrl(profileUrl);
      } else {
        PopupUIService.showMessage(
          "#error-message",
          "Failed to fetch data. Please try again later.",
          ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
        );
      }
    } catch (error) {
      PopupUIService.showMessage(
        "#error-message",
        "An error occurred. Please try again.",
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
    } finally {
      OptionsService.resetSubmitButton();
    }
  },

  /**
   * Display user details after successful data fetch
   */
  async displayUserDetails(data: ArcadeData): Promise<void> {
    PopupUIService.showMessage(
      "#success-message",
      browser.i18n.getMessage("successSettingsSaved"),
      ["text-green-500", "font-bold", "mt-2", "animate-pulse"]
    );

    await StorageService.saveArcadeData(data);
    PopupUIService.updateOptionsUI(data);
  },

  /**
   * Reset submit button text
   */
  resetSubmitButton(): void {
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    }
  },

  /**
   * Load search feature setting from storage and update UI
   */
  async loadSearchFeatureSetting(): Promise<void> {
    const searchFeatureToggle = document.getElementById(
      "search-feature-toggle"
    ) as HTMLInputElement;
    if (searchFeatureToggle) {
      const isEnabled = await StorageService.isSearchFeatureEnabled();
      searchFeatureToggle.checked = isEnabled;
    }
  },

  /**
   * Handle search feature toggle change
   */
  async handleSearchFeatureToggle(enabled: boolean): Promise<void> {
    try {
      await StorageService.saveSearchFeatureEnabled(enabled);

      // Show feedback message
      const messageKey = enabled
        ? "messageSearchFeatureEnabled"
        : "messageSearchFeatureDisabled";
      const message = browser.i18n.getMessage(messageKey);

      // Create temporary message element
      const messageElement = document.createElement("div");
      messageElement.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      messageElement.textContent = message;
      document.body.appendChild(messageElement);

      // Remove message after 3 seconds
      setTimeout(() => {
        messageElement.remove();
      }, 3000);
    } catch (error) {
      console.error("Error saving search feature setting:", error);
    }
  },
};

export default OptionsService;
