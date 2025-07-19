import ArcadeScrapingService from "./arcadeScrapingService";
import StorageService from "./storageService";
import type { ArcadeData } from "../types";

/**
 * Service to handle profile detection and auto-scraping on Google Cloud Skills Boost pages
 */
class ProfileDetectionService {
  private static isInitialized = false;
  private static observer: MutationObserver | null = null;

  /**
   * Initialize profile detection when on Google Cloud Skills Boost pages
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("ProfileDetectionService: Initializing...");

    // Check if we're on a relevant page
    if (!this.isRelevantPage()) {
      return;
    }

    this.isInitialized = true;
    await this.setupAutoDetection();
  }

  /**
   * Check if current page is relevant for profile detection
   */
  private static isRelevantPage(): boolean {
    const url = window.location.href;
    const relevantPatterns = [
      "cloudskillsboost.google/public_profiles",
      "cloudskillsboost.google/profile",
      "cloudskillsboost.google/my_account/profile",
    ];

    return relevantPatterns.some((pattern) => url.includes(pattern));
  }

  /**
   * Setup automatic detection and scraping
   */
  private static async setupAutoDetection(): Promise<void> {
    // Wait for page to load
    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        window.addEventListener("load", resolve);
      });
    }

    // Initial check
    await this.checkAndScrapePage();

    // Setup mutation observer to detect dynamic content
    this.setupMutationObserver();

    // Setup periodic checks (fallback)
    this.setupPeriodicChecks();
  }

  /**
   * Setup mutation observer to detect when badges are loaded dynamically
   */
  private static setupMutationObserver(): void {
    this.observer = new MutationObserver(async (mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if any added nodes might be badges
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (this.elementMightBeBadge(element)) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
      });

      if (shouldCheck) {
        console.log(
          "ProfileDetectionService: New content detected, checking for badges..."
        );
        await this.checkAndScrapePage();
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Check if an element might be a badge (prioritize elements within .profile-badges)
   */
  private static elementMightBeBadge(element: Element): boolean {
    // First check if element is within .profile-badges container
    const isInProfileBadges = element.closest(".profile-badges") !== null;
    if (isInProfileBadges) {
      return true; // Any element in .profile-badges is potentially a badge
    }

    // Fallback to old method for elements outside .profile-badges
    const className = element.className || "";
    const id = element.id || "";
    const tagName = element.tagName?.toLowerCase() || "";

    const badgeIndicators = [
      "badge",
      "achievement",
      "completion",
      "skill",
      "arcade",
      "trivia",
      "game",
      "lab",
      "quest",
      "cert",
    ];

    return badgeIndicators.some(
      (indicator) =>
        className.toLowerCase().includes(indicator) ||
        id.toLowerCase().includes(indicator) ||
        (tagName === "img" &&
          (element as HTMLImageElement).src?.toLowerCase().includes(indicator))
    );
  }

  /**
   * Setup periodic checks as fallback
   */
  private static setupPeriodicChecks(): void {
    // Check every 30 seconds
    setInterval(async () => {
      await this.checkAndScrapePage();
    }, 30000);
  }

  /**
   * Check current page and scrape if badges are found
   */
  private static async checkAndScrapePage(): Promise<void> {
    try {
      // First check if .profile-badges container exists
      const profileBadgesContainer = document.querySelector(".profile-badges");
      if (!profileBadgesContainer) {
        console.log(
          "ProfileDetectionService: .profile-badges container not found on current page"
        );
        return;
      }

      console.log(
        "ProfileDetectionService: Found .profile-badges container, checking for badges..."
      );

      // Wait a bit for content to load
      await ArcadeScrapingService.waitForBadgesToLoad(5000);

      const arcadeData =
        ArcadeScrapingService.extractArcadeDataFromCurrentPage();

      if (arcadeData && arcadeData.badges && arcadeData.badges.length > 0) {
        console.log(
          `ProfileDetectionService: Found ${arcadeData.badges.length} badges on current page`
        );

        // Check if we should update stored data
        const shouldUpdate = await this.shouldUpdateStoredData(arcadeData);

        if (shouldUpdate) {
          await StorageService.saveArcadeData(arcadeData);
          console.log("ProfileDetectionService: Updated stored arcade data");

          // Notify if extension popup is open
          this.notifyExtensionOfUpdate();
        }
      }
    } catch (error) {
      console.error("ProfileDetectionService: Error checking page:", error);
    }
  }

  /**
   * Check if we should update the stored data
   */
  private static async shouldUpdateStoredData(
    newData: ArcadeData
  ): Promise<boolean> {
    try {
      const existingData = await StorageService.getArcadeData();

      // If no existing data, always update
      if (!existingData) {
        return true;
      }

      // Update if we found more badges
      const existingBadgeCount = existingData.badges?.length || 0;
      const newBadgeCount = newData.badges?.length || 0;

      if (newBadgeCount > existingBadgeCount) {
        return true;
      }

      // Update if total points increased
      const existingPoints = existingData.arcadePoints?.totalPoints || 0;
      const newPoints = newData.arcadePoints?.totalPoints || 0;

      if (newPoints > existingPoints) {
        return true;
      }

      // Update if data is older than 1 hour
      const existingTime = new Date(existingData.lastUpdated || 0).getTime();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      if (existingTime < oneHourAgo) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "ProfileDetectionService: Error checking if should update:",
        error
      );
      return true; // Default to updating if there's an error
    }
  }

  /**
   * Notify extension popup of data update
   */
  private static notifyExtensionOfUpdate(): void {
    try {
      // Send message to popup if it's open
      browser.runtime
        .sendMessage({
          type: "ARCADE_DATA_UPDATED",
          timestamp: Date.now(),
        })
        .catch(() => {
          // Ignore errors - popup might not be open
        });
    } catch (error) {
      // Ignore errors - not critical
    }
  }

  /**
   * Manually trigger a check and scrape
   */
  static async manualCheck(): Promise<ArcadeData | null> {
    console.log("ProfileDetectionService: Manual check triggered");

    const arcadeData = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

    if (arcadeData) {
      const shouldUpdate = await this.shouldUpdateStoredData(arcadeData);

      if (shouldUpdate) {
        await StorageService.saveArcadeData(arcadeData);
        this.notifyExtensionOfUpdate();
      }
    }

    return arcadeData;
  }

  /**
   * Get current profile URL if we're on a public profile page
   */
  static getCurrentProfileUrl(): string | null {
    const url = window.location.href;

    if (url.includes("cloudskillsboost.google/public_profiles/")) {
      return url;
    }

    // Try to find profile URL in the page
    const profileLinks = document.querySelectorAll(
      'a[href*="/public_profiles/"]'
    );
    if (profileLinks.length > 0) {
      const link = profileLinks[0] as HTMLAnchorElement;
      return link.href;
    }

    return null;
  }

  /**
   * Cleanup
   */
  static cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isInitialized = false;
  }
}

export default ProfileDetectionService;
