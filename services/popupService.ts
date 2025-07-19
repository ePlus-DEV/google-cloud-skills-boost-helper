import ArcadeApiService from "./arcadeApiService";
import ArcadeScrapingService from "./arcadeScrapingService";
import StorageService from "./storageService";
import PopupUIService from "./popupUIService";
import BadgeService from "./badgeService";
import type { ArcadeData } from "../types";

/**
 * Main service to handle popup functionality
 */
class PopupService {
  private static profileUrl = "";
  private static readonly SPINNER_CLASS = "animate-spin";

  /**
   * Initialize the popup
   */
  static async initialize(): Promise<void> {
    // Initialize profile URL
    this.profileUrl = await StorageService.getProfileUrl();

    // Load existing data
    const arcadeData = await StorageService.getArcadeData();

    console.log("PopupService: Profile URL:", this.profileUrl);
    console.log("PopupService: Stored arcade data:", arcadeData);

    if (!this.profileUrl) {
      this.showAuthScreen();
    } else if (arcadeData) {
      PopupUIService.updateMainUI(arcadeData);
      BadgeService.renderBadges(arcadeData.badges || []);
    } else {
      // Profile URL exists but no data - show loading state and try to fetch
      console.log(
        "PopupService: Profile URL exists but no data, showing loading state"
      );
      PopupUIService.showLoadingState();
      this.refreshData();
    }

    this.setupEventListeners();
    this.setupPrizeTiers();
  }

  /**
   * Show authentication screen
   */
  private static showAuthScreen(): void {
    PopupUIService.updateElementText(
      "#settings-message",
      browser.i18n.getMessage("textPleaseSetUpTheSettings")
    );
    PopupUIService.querySelector("#popup-content")?.classList.add("blur-sm");
    PopupUIService.querySelector("#auth-screen")?.classList.remove("invisible");
  }

  /**
   * Refresh arcade data
   */
  static async refreshData(): Promise<void> {
    if (!this.profileUrl) {
      console.error("Profile URL is not set.");
      return;
    }

    const refreshButtons = document.querySelectorAll(
      ".refresh-button"
    ) as NodeListOf<HTMLButtonElement>;
    const refreshIcons = document.querySelectorAll(
      ".refresh-icon"
    ) as NodeListOf<HTMLElement>;

    // Show loading state
    PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, true);
    PopupUIService.toggleButtonState(refreshButtons, true);

    try {
      // Try API first, then fallback to scraping
      let arcadeData = await ArcadeApiService.fetchArcadeData(this.profileUrl);

      if (!arcadeData) {
        console.log("PopupService: API failed, trying scraping method...");
        arcadeData = await ArcadeScrapingService.scrapeArcadeData(
          this.profileUrl
        );
      }

      console.log("PopupService: Fetched arcade data:", arcadeData);

      if (arcadeData) {
        await StorageService.saveArcadeData(arcadeData);
        PopupUIService.updateMainUI(arcadeData);
        BadgeService.renderBadges(arcadeData.badges || []);
      } else {
        console.error(
          "Failed to fetch arcade data from both API and scraping."
        );
        PopupUIService.showErrorState();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      PopupUIService.showErrorState();
    } finally {
      // Hide loading state
      PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, false);
      PopupUIService.toggleButtonState(refreshButtons, false);
    }
  }

  /**
   * Refresh arcade data using only scraping method (bypass API)
   */
  static async refreshDataByScraping(): Promise<void> {
    if (!this.profileUrl) {
      console.error("Profile URL is not set.");
      return;
    }

    const refreshButtons = document.querySelectorAll(
      ".refresh-button"
    ) as NodeListOf<HTMLButtonElement>;
    const refreshIcons = document.querySelectorAll(
      ".refresh-icon"
    ) as NodeListOf<HTMLElement>;

    // Show loading state
    PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, true);
    PopupUIService.toggleButtonState(refreshButtons, true);

    try {
      console.log("PopupService: Using scraping method only...");
      const arcadeData = await ArcadeScrapingService.scrapeArcadeData(
        this.profileUrl
      );

      console.log("PopupService: Scraped arcade data:", arcadeData);

      if (arcadeData) {
        await StorageService.saveArcadeData(arcadeData);
        PopupUIService.updateMainUI(arcadeData);
        BadgeService.renderBadges(arcadeData.badges || []);
      } else {
        console.error("Failed to scrape arcade data.");
        PopupUIService.showErrorState();
      }
    } catch (error) {
      console.error("Error scraping data:", error);
      PopupUIService.showErrorState();
    } finally {
      // Hide loading state
      PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, false);
      PopupUIService.toggleButtonState(refreshButtons, false);
    }
  }

  /**
   * Setup event listeners
   */
  private static setupEventListeners(): void {
    // Refresh buttons
    document.querySelectorAll(".refresh-button").forEach((button) => {
      button.addEventListener("click", () => this.refreshData());
    });

    // Settings buttons
    document.querySelectorAll(".settings-button").forEach((button) => {
      button.addEventListener("click", () => {
        window.open(browser.runtime.getURL("/options.html"), "_blank");
      });
    });
  }

  /**
   * Setup prize tiers image with cache busting
   */
  private static setupPrizeTiers(): void {
    const prizeTiersElement =
      PopupUIService.querySelector<HTMLImageElement>("#prize-tiers");
    if (prizeTiersElement) {
      const currentTime = new Date().getTime();
      prizeTiersElement.src = `${prizeTiersElement.src}?t=${currentTime}`;
    }
  }

  /**
   * Update profile URL (called from external sources)
   */
  static updateProfileUrl(url: string): void {
    this.profileUrl = url;
  }

  /**
   * Get current profile URL
   */
  static getProfileUrl(): string {
    return this.profileUrl;
  }
}

export default PopupService;
