import { UAParser } from "ua-parser-js";
import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import PopupUIService from "./popupUIService";
import type { ArcadeData } from "../types";

/**
 * Service to handle options page functionality
 */
class OptionsService {
  /**
   * Initialize options page
   */
  static async initialize(): Promise<void> {
    this.setupEventListeners();
    this.setupVersion();
    this.setupBrowserBadges();
    await this.loadExistingData();
  }

  /**
   * Setup event listeners for options page
   */
  private static setupEventListeners(): void {
    // Submit URL button
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
      submitUrlElement.addEventListener("click", () => this.handleSubmit());
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

    // Prize tiers with cache busting
    const prizeTiersElement =
      PopupUIService.querySelector<HTMLImageElement>("#prize-tiers");
    if (prizeTiersElement) {
      const currentTime = new Date().getTime();
      prizeTiersElement.src = `${prizeTiersElement.src}?t=${currentTime}`;
    }
  }

  /**
   * Setup version display
   */
  private static setupVersion(): void {
    const manifest = browser.runtime.getManifest();
    const versionElement = PopupUIService.querySelector("#version-number");
    if (versionElement) {
      versionElement.textContent = `v${manifest.version}`;
    }
  }

  /**
   * Setup browser-specific badges
   */
  private static setupBrowserBadges(): void {
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
  }

  /**
   * Load existing data from storage
   */
  private static async loadExistingData(): Promise<void> {
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
  }

  /**
   * Handle form submission
   */
  private static async handleSubmit(): Promise<void> {
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
      this.resetSubmitButton();
      return;
    }

    try {
      const arcadeData = await ArcadeApiService.fetchArcadeData(profileUrl);

      if (arcadeData) {
        await this.displayUserDetails(arcadeData);
        await StorageService.saveProfileUrl(profileUrl);
      } else {
        console.error("Failed to fetch arcade data.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      this.resetSubmitButton();
    }
  }

  /**
   * Display user details after successful data fetch
   */
  private static async displayUserDetails(data: ArcadeData): Promise<void> {
    PopupUIService.showMessage(
      "#success-message",
      browser.i18n.getMessage("successSettingsSaved"),
      ["text-green-500", "font-bold", "mt-2", "animate-pulse"]
    );

    await StorageService.saveArcadeData(data);
    PopupUIService.updateOptionsUI(data);
  }

  /**
   * Reset submit button text
   */
  private static resetSubmitButton(): void {
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    }
  }
}

export default OptionsService;
