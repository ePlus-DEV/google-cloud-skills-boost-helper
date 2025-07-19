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
      '.ql-display-small, .profile-header h1, .profile-name h1, [data-testid="profile-name"]'
    );
    const userName = userNameElement?.textContent?.trim() || "Anonymous";

    // Extract profile image from ql-avatar or img elements
    let profileImage = "";

    // Try ql-avatar first (from actual HTML structure)
    const avatarElement = doc.querySelector("ql-avatar.profile-avatar") as any;
    if (avatarElement && avatarElement.src) {
      profileImage = avatarElement.src;
    } else {
      // Fallback to img elements
      const profileImageElement = doc.querySelector(
        ".profile-avatar img, .avatar img, .profile-picture img"
      ) as HTMLImageElement;
      profileImage = profileImageElement?.src || "";
    }

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

    // First, try to find the profile-badges container
    const profileBadgesContainer = doc.querySelector(".profile-badges");

    if (profileBadgesContainer) {
      console.log("ArcadeScrapingService: Found .profile-badges container");

      // Look for badge elements within the profile-badges container
      const badgeSelectors = [
        ".profile-badge", // Individual badge items (from Node.js controller)
        ".badge-card",
        ".achievement-card",
        ".earned-badge",
        ".badge-item",
        '[data-testid="badge"]',
        ".badge",
        ".completion-badge",
        ".skill-badge",
      ];

      for (const selector of badgeSelectors) {
        const badgeElements = profileBadgesContainer.querySelectorAll(selector);

        console.log(
          `ArcadeScrapingService: Found ${badgeElements.length} elements with selector "${selector}" in .profile-badges`
        );

        badgeElements.forEach((element) => {
          const badge = this.extractBadgeFromElement(element);
          if (badge) {
            badges.push(badge);
          }
        });

        if (badges.length > 0) break; // Stop if we found badges with one selector
      }

      // If no specific badge selectors work, try to find any elements that look like badges
      if (badges.length === 0) {
        console.log(
          "ArcadeScrapingService: No badges found with specific selectors, trying generic approach in .profile-badges"
        );
        badges.push(...this.extractBadgesFromContainer(profileBadgesContainer));
      }
    }

    // Fallback: if no profile-badges container found, try .profile-badge (individual items)
    if (badges.length === 0) {
      console.log(
        "ArcadeScrapingService: .profile-badges container not found, trying .profile-badge elements"
      );

      const profileBadgeElements = doc.querySelectorAll(".profile-badge");
      console.log(
        `ArcadeScrapingService: Found ${profileBadgeElements.length} .profile-badge elements`
      );

      profileBadgeElements.forEach((element) => {
        const badge = this.extractBadgeFromElement(element);
        if (badge) {
          badges.push(badge);
        }
      });
    }

    // Final fallback: use old method
    if (badges.length === 0) {
      console.log(
        "ArcadeScrapingService: No .profile-badge elements found, using final fallback method"
      );
      badges.push(...this.fallbackBadgeExtraction(doc));
    }

    console.log(`ArcadeScrapingService: Total badges found: ${badges.length}`);
    return badges;
  }

  /**
   * Extract badges from a specific container element
   */
  private static extractBadgesFromContainer(container: Element): BadgeData[] {
    const badges: BadgeData[] = [];

    // Try to find any clickable elements or divs that might represent badges
    const possibleBadges = container.querySelectorAll(
      "div, a, article, section"
    );

    possibleBadges.forEach((element) => {
      // Check if element contains an image (common for badges)
      const img = element.querySelector("img");
      if (img) {
        const badge = this.extractBadgeFromElement(element);
        if (badge) {
          badges.push(badge);
        }
      }
    });

    return badges;
  }

  /**
   * Extract badge information from a DOM element
   */
  private static extractBadgeFromElement(element: Element): BadgeData | null {
    try {
      // Try to extract badge title
      const titleSelectors = [
        ".ql-title-medium", // Primary selector from real HTML structure
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

      // Try to extract badge image from the specific structure
      let imageURL = "";

      // First try the exact structure from real HTML: .badge-image > img
      const badgeImageLink = element.querySelector(
        ".badge-image img"
      ) as HTMLImageElement;
      if (badgeImageLink?.src) {
        imageURL = badgeImageLink.src;
      } else {
        // Fallback to any img element
        const imgElement = element.querySelector("img") as HTMLImageElement;
        imageURL = imgElement?.src || "";
      }

      // Try to extract date earned using the real HTML structure
      const dateSelectors = [
        ".ql-body-medium", // Primary selector from real HTML structure
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
          const dateText = dateElement.textContent.trim();

          // Parse the specific format from real HTML: "Earned Jul 19, 2025 EDT"
          if (dateText.startsWith("Earned ")) {
            dateEarned = dateText.replace("Earned ", "");
          } else {
            dateEarned = dateText;
          }
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
   * Calculate points for a badge based on its title and type (based on official arcade point rules)
   * Official Rules:
   * - 1 Arcade Monthly/Certification Game Badge = 1 Arcade Point
   * - 1 Arcade Weekly Trivia Badge = 1 Arcade Point
   * - 1 Arcade Special Edition Badge = 2 Arcade Points
   * - 2 Skill Badges = 1 Arcade Point
   */
  private static calculateBadgePoints(title: string, imageURL: string): number {
    const titleLower = title.toLowerCase();

    console.log(`ArcadeScrapingService: Calculating points for: "${title}"`);

    // Arcade Weekly Trivia badges = 1 Arcade Point
    if (
      titleLower.includes("arcade trivia") ||
      (titleLower.includes("trivia") && titleLower.includes("week"))
    ) {
      console.log("  → Arcade Weekly Trivia badge: 1 Arcade Point");
      return 1;
    }

    // Arcade Monthly/Certification Game badges = 1 Arcade Point
    if (
      titleLower.includes("arcade") &&
      (titleLower.includes("month") ||
        titleLower.includes("certification") ||
        titleLower.includes("game") ||
        titleLower.includes("base camp"))
    ) {
      console.log("  → Arcade Monthly/Game badge: 1 Arcade Point");
      return 1;
    }

    // Arcade Special Edition badges = 2 Arcade Points
    if (
      titleLower.includes("arcade") &&
      (titleLower.includes("special") ||
        titleLower.includes("edition") ||
        titleLower.includes("extraskillestrial") ||
        titleLower.includes("skillestrial"))
    ) {
      console.log("  → Arcade Special Edition badge: 2 Arcade Points");
      return 2;
    }

    // Skill badges = 0.5 Arcade Points each (2 Skill Badges = 1 Arcade Point)
    // We'll mark them and calculate fractional points later
    if (
      titleLower.includes("skill") ||
      titleLower.includes("level") ||
      titleLower.includes("challenge") ||
      titleLower.includes("infrastructure") ||
      titleLower.includes("application") ||
      titleLower.includes("deployment")
    ) {
      console.log("  → Skill badge: 0.5 Arcade Points (2 needed for 1 point)");
      return 0.5;
    }

    // Generic arcade badges
    if (titleLower.includes("arcade")) {
      console.log("  → Generic Arcade badge: 1 Arcade Point");
      return 1;
    }

    // Non-arcade badges don't contribute to arcade points
    console.log("  → Non-arcade badge: 0 Arcade Points");
    return 0;
  }

  /**
   * Calculate total arcade points from badges (following official rules)
   * Official Rules:
   * - Arcade Monthly/Game badges (including Base Camp) = 1 point each
   * - Arcade Weekly Trivia badges = 1 point each
   * - Arcade Special Edition badges = 2 points each
   * - Skill badges = 0.5 points each, rounded down by pairs (2 skill badges = 1 arcade point)
   */
  private static calculateArcadePointsFromBadges(badges: BadgeData[]) {
    let arcadeGamePoints = 0;
    let arcadeTriviaPoints = 0;
    let arcadeSpecialPoints = 0;
    let skillBadgeCount = 0;

    console.log("ArcadeScrapingService: Calculating total arcade points...");

    badges.forEach((badge) => {
      const titleLower = badge.title.toLowerCase();

      // Arcade Weekly Trivia badges
      if (
        titleLower.includes("arcade trivia") ||
        (titleLower.includes("trivia") && titleLower.includes("week"))
      ) {
        arcadeTriviaPoints += badge.points;
        console.log(`  → Trivia: ${badge.title} = ${badge.points} points`);
      }
      // Arcade Monthly/Game badges (including Base Camp)
      else if (
        titleLower.includes("arcade") &&
        (titleLower.includes("month") ||
          titleLower.includes("certification") ||
          titleLower.includes("game") ||
          titleLower.includes("base camp"))
      ) {
        arcadeGamePoints += badge.points;
        console.log(
          `  → Game/Base Camp: ${badge.title} = ${badge.points} points`
        );
      }
      // Arcade Special Edition badges
      else if (
        titleLower.includes("arcade") &&
        (titleLower.includes("special") ||
          titleLower.includes("edition") ||
          titleLower.includes("extraskillestrial") ||
          titleLower.includes("skillestrial"))
      ) {
        arcadeSpecialPoints += badge.points;
        console.log(`  → Special: ${badge.title} = ${badge.points} points`);
      }
      // Skill badges (count them for pairs)
      else if (
        titleLower.includes("skill") ||
        titleLower.includes("level") ||
        titleLower.includes("challenge") ||
        titleLower.includes("infrastructure") ||
        titleLower.includes("application") ||
        titleLower.includes("deployment")
      ) {
        skillBadgeCount++;
        console.log(`  → Skill: ${badge.title} (count: ${skillBadgeCount})`);
      }
      // Generic arcade badges
      else if (titleLower.includes("arcade")) {
        arcadeGamePoints += badge.points;
        console.log(
          `  → Generic Arcade: ${badge.title} = ${badge.points} points`
        );
      }
      // Non-arcade badges
      else {
        console.log(`  → Non-arcade: ${badge.title} = 0 arcade points`);
      }
    });

    // Calculate skill badge points: 2 skill badges = 1 arcade point
    const skillArcadePoints = Math.floor(skillBadgeCount / 2);
    console.log(
      `  → Skill badges: ${skillBadgeCount} badges = ${skillArcadePoints} arcade points (${
        skillBadgeCount % 2
      } remaining)`
    );

    const totalArcadePoints =
      arcadeGamePoints +
      arcadeTriviaPoints +
      arcadeSpecialPoints +
      skillArcadePoints;

    console.log("ArcadeScrapingService: Final calculation:");
    console.log(`  Game/Monthly/Base Camp: ${arcadeGamePoints} points`);
    console.log(`  Trivia/Weekly: ${arcadeTriviaPoints} points`);
    console.log(`  Special Edition: ${arcadeSpecialPoints} points`);
    console.log(
      `  Skill (${skillBadgeCount} badges): ${skillArcadePoints} points`
    );
    console.log(`  TOTAL ARCADE POINTS: ${totalArcadePoints}`);

    return {
      totalPoints: totalArcadePoints,
      gamePoints: arcadeGamePoints,
      triviaPoints: arcadeTriviaPoints,
      skillPoints: skillArcadePoints,
      specialPoints: arcadeSpecialPoints,
      skillBadgeCount: skillBadgeCount,
      skillBadgesRemaining: skillBadgeCount % 2,
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
