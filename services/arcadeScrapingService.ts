import type { ArcadeData, BadgeData } from "../types";

/**
 * Service to scrape Arcade Points directly from Google Cloud Skills Boost profile pages
 * This service provides an alternative to API-based point calculation
 */
class ArcadeScrapingService {
  /**
   * Scrape arcade data from a public profile page
   */
  static async scrapeArcadeData(
    profileUrl: string
  ): Promise<ArcadeData | null> {
    try {
      if (!this.isValidProfileUrl(profileUrl)) {
        throw new Error("Invalid profile URL format");
      }

      // Fetch the profile page HTML
      const response = await fetch(profileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract user details
      const userDetails = this.extractUserDetails(doc);

      // Extract arcade points from badges
      const badges = this.extractBadges(doc);
      const arcadePoints = this.calculateArcadePointsFromBadges(badges);

      const arcadeData: ArcadeData = {
        userDetails,
        arcadePoints,
        badges,
        lastUpdated: new Date().toISOString(),
      };

      console.log("ArcadeScrapingService: Scraped data:", arcadeData);
      return arcadeData;
    } catch (error) {
      console.error("ArcadeScrapingService: Error scraping data:", error);
      return null;
    }
  }

  /**
   * Extract user details from profile page
   */
  private static extractUserDetails(doc: Document) {
    const userNameElement = doc.querySelector(
      '.profile-header h1, .profile-name h1, [data-testid="profile-name"]'
    );
    const userName = userNameElement?.textContent?.trim() || "Anonymous";

    // Try to extract profile image
    const profileImageElement = doc.querySelector(
      ".profile-avatar img, .avatar img, .profile-picture img"
    ) as HTMLImageElement;
    const profileImage = profileImageElement?.src || "";

    return {
      userName,
      profileImage,
      league: "Unknown", // League information might not be available in public profile
      points: 0, // Will be calculated from badges
    };
  }

  /**
   * Extract badges from profile page
   */
  private static extractBadges(doc: Document): BadgeData[] {
    const badges: BadgeData[] = [];

    // Look for badge containers - Google Cloud Skills Boost uses various selectors
    const badgeSelectors = [
      ".badge-card",
      ".achievement-card",
      ".earned-badge",
      ".badge-item",
      '[data-testid="badge"]',
      ".profile-badge",
    ];

    for (const selector of badgeSelectors) {
      const badgeElements = doc.querySelectorAll(selector);

      badgeElements.forEach((element) => {
        const badge = this.extractBadgeFromElement(element);
        if (badge) {
          badges.push(badge);
        }
      });

      if (badges.length > 0) break; // Stop if we found badges with one selector
    }

    // Fallback: try to find badges in any element with badge-related text
    if (badges.length === 0) {
      badges.push(...this.fallbackBadgeExtraction(doc));
    }

    console.log(`ArcadeScrapingService: Found ${badges.length} badges`);
    return badges;
  }

  /**
   * Extract badge information from a DOM element
   */
  private static extractBadgeFromElement(element: Element): BadgeData | null {
    try {
      // Try to extract badge title
      const titleSelectors = [
        ".badge-title",
        ".badge-name",
        ".achievement-title",
        "h3",
        "h4",
        ".title",
        '[data-testid="badge-title"]',
      ];

      let title = "";
      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement?.textContent?.trim()) {
          title = titleElement.textContent.trim();
          break;
        }
      }

      // Try to extract badge image
      const imgElement = element.querySelector("img") as HTMLImageElement;
      const imageURL = imgElement?.src || "";

      // Try to extract date earned
      const dateSelectors = [
        ".date-earned",
        ".earned-date",
        ".completion-date",
        ".timestamp",
        '[data-testid="date-earned"]',
      ];

      let dateEarned = "";
      for (const selector of dateSelectors) {
        const dateElement = element.querySelector(selector);
        if (dateElement?.textContent?.trim()) {
          dateEarned = dateElement.textContent.trim();
          break;
        }
      }

      // Calculate points based on badge type
      const points = this.calculateBadgePoints(title, imageURL);

      if (title && points > 0) {
        return {
          title,
          imageURL,
          dateEarned: dateEarned || new Date().toISOString().split("T")[0],
          points,
        };
      }

      return null;
    } catch (error) {
      console.error("ArcadeScrapingService: Error extracting badge:", error);
      return null;
    }
  }

  /**
   * Fallback method to extract badges when standard selectors don't work
   */
  private static fallbackBadgeExtraction(doc: Document): BadgeData[] {
    const badges: BadgeData[] = [];

    // Look for images that might be badges (common pattern in Google Cloud)
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.src;
      const alt = img.alt || img.title || "";

      // Check if image looks like a badge
      if (this.looksLikeBadgeImage(src, alt)) {
        const points = this.calculateBadgePoints(alt, src);
        if (points > 0) {
          badges.push({
            title: alt || "Unknown Badge",
            imageURL: src,
            dateEarned: new Date().toISOString().split("T")[0],
            points,
          });
        }
      }
    });

    return badges;
  }

  /**
   * Check if an image looks like a badge based on URL or alt text
   */
  private static looksLikeBadgeImage(src: string, alt: string): boolean {
    const badgeKeywords = [
      "badge",
      "achievement",
      "completion",
      "skill",
      "arcade",
      "trivia",
      "game",
      "lab",
      "quest",
    ];

    const srcLower = src.toLowerCase();
    const altLower = alt.toLowerCase();

    return badgeKeywords.some(
      (keyword) => srcLower.includes(keyword) || altLower.includes(keyword)
    );
  }

  /**
   * Calculate points for a badge based on its title and type
   */
  private static calculateBadgePoints(title: string, imageURL: string): number {
    const titleLower = title.toLowerCase();
    const imageLower = imageURL.toLowerCase();

    // Arcade Game badges - typically 1 point each
    if (titleLower.includes("arcade") || titleLower.includes("game")) {
      return 1;
    }

    // Trivia badges - typically 1 point each
    if (titleLower.includes("trivia")) {
      return 1;
    }

    // Skill badges - typically 5 points each
    if (titleLower.includes("skill") || titleLower.includes("challenge")) {
      return 5;
    }

    // Special events or quest badges - variable points
    if (titleLower.includes("quest") || titleLower.includes("special")) {
      return 3;
    }

    // Lab completion badges - typically 1-2 points
    if (titleLower.includes("lab") || titleLower.includes("completion")) {
      return 1;
    }

    // Certificate or course badges - typically 10+ points
    if (titleLower.includes("certificate") || titleLower.includes("course")) {
      return 10;
    }

    // Default for unrecognized badges
    return 1;
  }

  /**
   * Calculate total arcade points from badges
   */
  private static calculateArcadePointsFromBadges(badges: BadgeData[]) {
    let gamePoints = 0;
    let triviaPoints = 0;
    let skillPoints = 0;
    let specialPoints = 0;

    badges.forEach((badge) => {
      const titleLower = badge.title.toLowerCase();

      if (titleLower.includes("arcade") || titleLower.includes("game")) {
        gamePoints += badge.points;
      } else if (titleLower.includes("trivia")) {
        triviaPoints += badge.points;
      } else if (
        titleLower.includes("skill") ||
        titleLower.includes("challenge")
      ) {
        skillPoints += badge.points;
      } else {
        specialPoints += badge.points;
      }
    });

    const totalPoints = gamePoints + triviaPoints + skillPoints + specialPoints;

    return {
      totalPoints,
      gamePoints,
      triviaPoints,
      skillPoints,
      specialPoints,
    };
  }

  /**
   * Validate profile URL format
   */
  private static isValidProfileUrl(url: string): boolean {
    return url.startsWith(
      "https://www.cloudskillsboost.google/public_profiles/"
    );
  }

  /**
   * Extract arcade data from current page (if user is on their profile)
   */
  static extractArcadeDataFromCurrentPage(): ArcadeData | null {
    try {
      // Check if we're on a profile page
      if (!window.location.href.includes("cloudskillsboost.google")) {
        return null;
      }

      const userDetails = this.extractUserDetails(document);
      const badges = this.extractBadges(document);
      const arcadePoints = this.calculateArcadePointsFromBadges(badges);

      return {
        userDetails,
        arcadePoints,
        badges,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "ArcadeScrapingService: Error extracting from current page:",
        error
      );
      return null;
    }
  }

  /**
   * Monitor page for dynamic badge loading
   */
  static async waitForBadgesToLoad(maxWaitTime = 10000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const badges = document.querySelectorAll(
          ".badge-card, .achievement-card, .earned-badge"
        );

        if (badges.length > 0 || Date.now() - startTime > maxWaitTime) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 500);
    });
  }
}

export default ArcadeScrapingService;
