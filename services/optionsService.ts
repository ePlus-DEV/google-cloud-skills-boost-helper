import { UAParser } from "ua-parser-js";
import ArcadeApiService from "./arcadeApiService";
import ArcadeScrapingService from "./arcadeScrapingService";
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

    // Scrape Only button
    const scrapeOnlyElement = document.getElementById("scrape-only-url");
    if (scrapeOnlyElement) {
      scrapeOnlyElement.addEventListener("click", () =>
        this.handleScrapeOnly()
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
      // Try API first, then fallback to scraping
      let arcadeData = await ArcadeApiService.fetchArcadeData(profileUrl);

      if (!arcadeData) {
        console.log("OptionsService: API failed, trying scraping method...");
        arcadeData = await ArcadeScrapingService.scrapeArcadeData(profileUrl);
      }

      if (arcadeData) {
        await this.displayUserDetails(arcadeData);
        await StorageService.saveProfileUrl(profileUrl);
      } else {
        console.error(
          "Failed to fetch arcade data from both API and scraping."
        );
        PopupUIService.showMessage(
          "#error-message",
          "Failed to fetch data. Please try again later.",
          ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
        );
      }
    } catch (error) {
      console.error("Error during submission:", error);
      PopupUIService.showMessage(
        "#error-message",
        "An error occurred. Please try again.",
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
    } finally {
      this.resetSubmitButton();
    }
  }

  /**
   * Handle scrape-only submission (bypass API, use scraping only)
   */
  private static async handleScrapeOnly(): Promise<void> {
    const scrapeOnlyElement = document.getElementById("scrape-only-url");
    const profileUrlInput = PopupUIService.querySelector<HTMLInputElement>(
      "#public-profile-url"
    );

    if (scrapeOnlyElement) {
      scrapeOnlyElement.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Scraping...';
    }

    const profileUrl = profileUrlInput?.value;

    // Validate URL
    if (!profileUrl || !ArcadeApiService.isValidProfileUrl(profileUrl)) {
      PopupUIService.showMessage(
        "#error-message",
        browser.i18n.getMessage("errorInvalidUrl"),
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
      this.resetScrapeOnlyButton();
      return;
    }

    try {
      console.log("OptionsService: Using scraping method only...");
      const arcadeData = await ArcadeScrapingService.scrapeArcadeData(
        profileUrl
      );

      if (arcadeData) {
        await this.displayUserDetails(arcadeData);
        await StorageService.saveProfileUrl(profileUrl);
        PopupUIService.showMessage(
          "#success-message",
          "✅ Data scraped successfully (API bypassed)!",
          ["text-green-500", "font-bold", "mt-2", "animate-pulse"]
        );
      } else {
        console.error("Failed to scrape arcade data.");
        PopupUIService.showMessage(
          "#error-message",
          "Failed to scrape data. Please ensure the profile is public and try again.",
          ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
        );
      }
    } catch (error) {
      console.error("Error during scraping:", error);
      PopupUIService.showMessage(
        "#error-message",
        "An error occurred during scraping. Please try again.",
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
    } finally {
      this.resetScrapeOnlyButton();
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

  /**
   * Reset scrape only button text
   */
  private static resetScrapeOnlyButton(): void {
    const scrapeOnlyElement = document.getElementById("scrape-only-url");
    if (scrapeOnlyElement) {
      scrapeOnlyElement.innerHTML = '<i class="fa-solid fa-search"></i> Scrape';
    }
  }
}

export default OptionsService;
