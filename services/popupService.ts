import ArcadeApiService from "./arcadeApiService";
import ArcadeScrapingService from "./arcadeScrapingService";
import ArcadeDashboardService from "./arcadeDashboardService";
import StorageService from "./storageService";
import PopupUIService from "./popupUIService";
import BadgeService from "./badgeService";
import CSVExportService from "./csvExportService";
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
    const scrapeButtons = document.querySelectorAll(
      ".scrape-only-button"
    ) as NodeListOf<HTMLButtonElement>;

    // Show loading state
    PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, true);
    PopupUIService.toggleButtonState(refreshButtons, true);
    PopupUIService.toggleButtonState(scrapeButtons, true);

    // Update scrape button icon
    scrapeButtons.forEach((button) => {
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    });

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
      PopupUIService.toggleButtonState(scrapeButtons, false);

      // Reset scrape button icon
      scrapeButtons.forEach((button) => {
        button.innerHTML = '<i class="fa-solid fa-search"></i>';
      });
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

    // Scrape Only buttons
    document.querySelectorAll(".scrape-only-button").forEach((button) => {
      button.addEventListener("click", () => this.refreshDataByScraping());
    });

    // CSV Export buttons
    document.querySelectorAll(".export-csv-button").forEach((button) => {
      button.addEventListener("click", () => this.exportCSV());
    });

    // Arcade Dashboard buttons
    document.querySelectorAll(".arcade-dashboard-button").forEach((button) => {
      button.addEventListener("click", () => this.openArcadeDashboard());
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

  /**
   * Export current badge data to CSV
   */
  private static async exportCSV(): Promise<void> {
    try {
      console.log("PopupService: Starting CSV export...");

      // Get current stored data
      const arcadeData = await StorageService.getArcadeData();

      if (!arcadeData || !arcadeData.badges || arcadeData.badges.length === 0) {
        console.warn("PopupService: No badge data to export");

        // Show temporary message to user
        const exportButton = document.querySelector(".export-csv-button");
        if (exportButton) {
          const originalContent = exportButton.innerHTML;
          exportButton.innerHTML =
            '<i class="fa-solid fa-exclamation-triangle"></i>';
          exportButton.setAttribute("title", "No data to export");

          setTimeout(() => {
            exportButton.innerHTML = originalContent;
            exportButton.setAttribute("title", "Export badges data to CSV");
          }, 2000);
        }

        return;
      }

      // Show loading state
      const exportButton = document.querySelector(".export-csv-button");
      if (exportButton) {
        exportButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        exportButton.setAttribute("disabled", "true");
      }

      // Prepare arcade points data for CSV
      const arcadePoints = {
        totalPoints: arcadeData.arcadePoints?.totalPoints || 0,
        gamePoints: arcadeData.arcadePoints?.gamePoints || 0,
        triviaPoints: arcadeData.arcadePoints?.triviaPoints || 0,
        skillPoints: arcadeData.arcadePoints?.skillPoints || 0,
        specialPoints: arcadeData.arcadePoints?.specialPoints || 0,
      };

      // Export detailed badges CSV
      const today = new Date().toISOString().split("T")[0];
      CSVExportService.exportBadgesCSV(
        arcadeData.badges,
        `google-cloud-badges-${today}.csv`
      );

      // Also export summary CSV
      CSVExportService.exportSummaryCSV(
        arcadePoints,
        `arcade-points-summary-${today}.csv`
      );

      console.log(
        `PopupService: Exported ${arcadeData.badges.length} badges to CSV`
      );

      // Show success state
      if (exportButton) {
        exportButton.innerHTML = '<i class="fa-solid fa-check"></i>';
        exportButton.setAttribute("title", "Export completed!");

        setTimeout(() => {
          exportButton.innerHTML = '<i class="fa-solid fa-download"></i>';
          exportButton.setAttribute("title", "Export badges data to CSV");
          exportButton.removeAttribute("disabled");
        }, 2000);
      }
    } catch (error) {
      console.error("PopupService: CSV export failed:", error);

      // Show error state
      const exportButton = document.querySelector(".export-csv-button");
      if (exportButton) {
        exportButton.innerHTML = '<i class="fa-solid fa-times"></i>';
        exportButton.setAttribute("title", "Export failed");

        setTimeout(() => {
          exportButton.innerHTML = '<i class="fa-solid fa-download"></i>';
          exportButton.setAttribute("title", "Export badges data to CSV");
          exportButton.removeAttribute("disabled");
        }, 3000);
      }
    }
  }

  /**
   * Open arcade dashboard in new tab
   */
  private static openArcadeDashboard(): void {
    const arcadeUrl = "https://go.cloudskillsboost.google/arcade";
    window.open(arcadeUrl, "_blank");
    console.log("PopupService: Opened arcade dashboard");
  }

  /**
   * Try to scrape from current active tab (for arcade dashboard)
   */
  static async scrapeFromActiveTab(): Promise<void> {
    try {
      console.log("PopupService: Attempting to scrape from active tab...");

      // Use content script to check if current tab is arcade page
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) {
        console.warn("PopupService: No active tab found");
        return;
      }

      const activeTab = tabs[0];
      if (!activeTab.url?.includes("cloudskillsboost.google")) {
        console.warn(
          "PopupService: Active tab is not Google Cloud Skills Boost page"
        );
        return;
      }

      // Execute content script to scrape arcade data
      const results = await browser.scripting.executeScript({
        target: { tabId: activeTab.id! },
        func: () => {
          // Check if ArcadeDashboardService is available
          if (typeof (window as any).ArcadeDashboardService !== "undefined") {
            return (
              window as any
            ).ArcadeDashboardService.autoScrapeIfArcadePage();
          }

          // Fallback: simple extraction
          const url = window.location.href;
          if (url.includes("arcade")) {
            // Try to find arcade points in page
            const pointsElements = document.querySelectorAll(
              '[class*="point"], [class*="score"], [class*="arcade"]'
            );
            for (const element of pointsElements) {
              const text = element.textContent || "";
              const match = text.match(/(\d+)/);
              if (match) {
                const points = parseInt(match[1], 10);
                if (points >= 0 && points <= 1000) {
                  return {
                    totalArcadePoints: points,
                    currentLeague: "Unknown",
                    gameStatus: { isActive: true },
                  };
                }
              }
            }
          }
          return null;
        },
      });

      if (results && results[0]?.result) {
        const dashboardData = results[0].result;
        console.log("PopupService: Scraped from active tab:", dashboardData);

        // Update stored data
        const existingData = await StorageService.getArcadeData();
        const updatedData: ArcadeData = {
          ...existingData,
          arcadePoints: {
            ...existingData?.arcadePoints,
            totalPoints: dashboardData.totalArcadePoints,
          },
          userDetails: {
            ...existingData?.userDetails,
            points: dashboardData.totalArcadePoints,
            league:
              dashboardData.currentLeague !== "Unknown"
                ? dashboardData.currentLeague
                : existingData?.userDetails?.league,
          },
          lastUpdated: new Date().toISOString(),
        };

        await StorageService.saveArcadeData(updatedData);
        PopupUIService.updateMainUI(updatedData);

        console.log("PopupService: Updated data from active tab scraping");
      }
    } catch (error) {
      console.error("PopupService: Failed to scrape from active tab:", error);
    }
  }
}

export default PopupService;
