/**
 * Arcade Dashboard Scraping Service
 * Scrape arcade points và league info từ https://go.cloudskillsboost.google/arcade
 */

export interface ArcadeEvent {
  title: string;
  description?: string;
  accessCode?: string;
  points: number;
  imageUrl?: string;
  gameUrl?: string;
  isActive: boolean;
}

export interface ArcadeDashboardData {
  totalArcadePoints: number;
  currentLeague: string;
  nextLeague?: string;
  pointsToNextLeague?: number;
  progressPercentage?: number;
  userDetails?: {
    userName?: string;
    profileImage?: string;
  };
  leaderboard?: {
    position?: number;
    totalParticipants?: number;
  };
  gameStatus?: {
    isActive: boolean;
    timeRemaining?: string;
    currentEvent?: string;
  };
  availableEvents?: ArcadeEvent[];
}

class ArcadeDashboardService {
  /**
   * Scrape arcade dashboard data từ current page
   */
  static extractArcadeDashboardData(): ArcadeDashboardData {
    console.log(
      "ArcadeDashboardService: Starting arcade dashboard scraping..."
    );

    try {
      const result: ArcadeDashboardData = {
        totalArcadePoints: 0,
        currentLeague: "Bronze",
        gameStatus: {
          isActive: false,
        },
      };

      // Extract total arcade points
      result.totalArcadePoints = this.extractTotalPoints();

      // Extract league information
      const leagueInfo = this.extractLeagueInfo();
      result.currentLeague = leagueInfo.current;
      result.nextLeague = leagueInfo.next;
      result.pointsToNextLeague = leagueInfo.pointsNeeded;
      result.progressPercentage = leagueInfo.progress;

      // Extract user details
      result.userDetails = this.extractUserDetails();

      // Extract leaderboard position
      result.leaderboard = this.extractLeaderboardInfo();

      // Extract game status
      result.gameStatus = this.extractGameStatus();

      // Extract available events/games
      result.availableEvents = this.extractAvailableEvents();

      console.log("ArcadeDashboardService: Scraping completed:", result);
      return result;
    } catch (error) {
      console.error("ArcadeDashboardService: Scraping failed:", error);
      return {
        totalArcadePoints: 0,
        currentLeague: "Bronze",
        gameStatus: {
          isActive: false,
        },
      };
    }
  }

  /**
   * Extract total arcade points từ dashboard
   */
  private static extractTotalPoints(): number {
    console.log("ArcadeDashboardService: Extracting total arcade points...");

    // Các selector có thể có cho arcade points
    const pointsSelectors = [
      // Primary selectors cho arcade points display
      ".arcade-points-total",
      ".total-arcade-points",
      '[data-testid="arcade-points"]',
      ".arcade-score",
      ".points-display .number",
      ".arcade-dashboard-points",

      // Google Design System selectors
      ".ql-display-large", // Large number displays
      ".ql-display-medium",
      ".ql-headline-large",
      ".ql-title-large",

      // Material Design selectors
      ".mdc-typography--headline1",
      ".mdc-typography--headline2",
      ".mat-display-1",
      ".mat-headline",

      // Generic number displays
      ".score-number",
      ".total-score",
      ".points-value",
      ".current-points",
    ];

    for (const selector of pointsSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim() || "";

          // Look for number patterns that could be arcade points
          const numberMatch = text.match(/(\d+)/);
          if (numberMatch) {
            const points = parseInt(numberMatch[1], 10);

            // Validate range - arcade points usually 0-100+
            if (points >= 0 && points <= 1000) {
              console.log(
                `ArcadeDashboardService: Found points ${points} using selector: ${selector}`
              );
              return points;
            }
          }
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error with selector ${selector}:`,
          error
        );
      }
    }

    // Look for patterns in page text
    const bodyText = document.body.textContent || "";
    const arcadePointsPattern = /arcade.*?(\d+).*?point/i;
    const match = bodyText.match(arcadePointsPattern);

    if (match) {
      const points = parseInt(match[1], 10);
      console.log(
        `ArcadeDashboardService: Found points ${points} via text pattern`
      );
      return points;
    }

    console.warn("ArcadeDashboardService: Could not extract arcade points");
    return 0;
  }

  /**
   * Extract league information
   */
  private static extractLeagueInfo(): {
    current: string;
    next?: string;
    pointsNeeded?: number;
    progress?: number;
  } {
    console.log("ArcadeDashboardService: Extracting league information...");

    const leagueSelectors = [
      ".current-league",
      ".league-display",
      ".user-league",
      '[data-testid="current-league"]',
      ".league-badge",
      ".tier-display",
    ];

    const leagues = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    let currentLeague = "Bronze";

    // Extract current league
    for (const selector of leagueSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim().toLowerCase() || "";

          for (const league of leagues) {
            if (text.includes(league.toLowerCase())) {
              currentLeague = league;
              console.log(
                `ArcadeDashboardService: Found current league: ${league}`
              );
              break;
            }
          }
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting league with ${selector}:`,
          error
        );
      }
    }

    // Look for league in page text
    if (currentLeague === "Bronze") {
      const bodyText = document.body.textContent?.toLowerCase() || "";
      for (const league of leagues) {
        if (bodyText.includes(league.toLowerCase())) {
          currentLeague = league;
          console.log(
            `ArcadeDashboardService: Found league via text pattern: ${league}`
          );
          break;
        }
      }
    }

    // Determine next league and points needed
    const currentIndex = leagues.indexOf(currentLeague);
    const nextLeague =
      currentIndex < leagues.length - 1 ? leagues[currentIndex + 1] : undefined;

    // Points required for each league
    const leaguePoints: { [key: string]: number } = {
      Bronze: 0,
      Silver: 15,
      Gold: 25,
      Platinum: 40,
      Diamond: 60,
    };

    const pointsNeeded = nextLeague
      ? leaguePoints[nextLeague] - leaguePoints[currentLeague]
      : undefined;

    return {
      current: currentLeague,
      next: nextLeague,
      pointsNeeded,
      progress: undefined, // Could be calculated if we know current points
    };
  }

  /**
   * Extract user profile details
   */
  private static extractUserDetails(): {
    userName?: string;
    profileImage?: string;
  } {
    console.log("ArcadeDashboardService: Extracting user details...");

    const userNameSelectors = [
      ".user-name",
      ".profile-name",
      '[data-testid="user-name"]',
      ".account-name",
      ".user-display-name",
    ];

    const imageSelectors = [
      ".profile-image img",
      ".user-avatar img",
      ".profile-picture img",
      '[data-testid="profile-image"]',
    ];

    let userName: string | undefined;
    let profileImage: string | undefined;

    // Extract username
    for (const selector of userNameSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          userName = element.textContent.trim();
          console.log(`ArcadeDashboardService: Found username: ${userName}`);
          break;
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting username with ${selector}:`,
          error
        );
      }
    }

    // Extract profile image
    for (const selector of imageSelectors) {
      try {
        const element = document.querySelector(selector) as HTMLImageElement;
        if (element && element.src) {
          profileImage = element.src;
          console.log(
            `ArcadeDashboardService: Found profile image: ${profileImage}`
          );
          break;
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting profile image with ${selector}:`,
          error
        );
      }
    }

    return { userName, profileImage };
  }

  /**
   * Extract leaderboard information
   */
  private static extractLeaderboardInfo(): {
    position?: number;
    totalParticipants?: number;
  } {
    console.log("ArcadeDashboardService: Extracting leaderboard info...");

    const leaderboardSelectors = [
      ".leaderboard-position",
      ".ranking-position",
      ".user-rank",
      '[data-testid="leaderboard-position"]',
    ];

    for (const selector of leaderboardSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || "";

          // Look for patterns like "#123" or "Rank: 123" or "123 of 1000"
          const rankMatch = text.match(
            /(?:#|rank:?\s*)?(\d+)(?:\s*of\s*(\d+))?/i
          );
          if (rankMatch) {
            const position = parseInt(rankMatch[1], 10);
            const total = rankMatch[2] ? parseInt(rankMatch[2], 10) : undefined;

            console.log(
              `ArcadeDashboardService: Found leaderboard position: ${position}${
                total ? ` of ${total}` : ""
              }`
            );
            return { position, totalParticipants: total };
          }
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting leaderboard with ${selector}:`,
          error
        );
      }
    }

    return {};
  }

  /**
   * Extract game status (active/inactive, time remaining)
   */
  private static extractGameStatus(): {
    isActive: boolean;
    timeRemaining?: string;
    currentEvent?: string;
  } {
    console.log("ArcadeDashboardService: Extracting game status...");

    const statusSelectors = [
      ".game-status",
      ".arcade-status",
      ".event-status",
      '[data-testid="game-status"]',
    ];

    const timeSelectors = [
      ".time-remaining",
      ".countdown",
      ".timer-display",
      '[data-testid="countdown"]',
    ];

    let isActive = false;
    let timeRemaining: string | undefined;
    let currentEvent: string | undefined;

    // Check if game is active
    const bodyText = document.body.textContent?.toLowerCase() || "";
    isActive =
      bodyText.includes("active") ||
      bodyText.includes("live") ||
      bodyText.includes("ongoing") ||
      (!bodyText.includes("ended") && !bodyText.includes("closed"));

    // Extract time remaining
    for (const selector of timeSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          timeRemaining = element.textContent.trim();
          console.log(
            `ArcadeDashboardService: Found time remaining: ${timeRemaining}`
          );
          break;
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting time with ${selector}:`,
          error
        );
      }
    }

    // Extract current event name
    const eventSelectors = [".event-title", ".arcade-title", ".current-event"];
    for (const selector of eventSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          currentEvent = element.textContent.trim();
          console.log(
            `ArcadeDashboardService: Found current event: ${currentEvent}`
          );
          break;
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting event with ${selector}:`,
          error
        );
      }
    }

    return { isActive, timeRemaining, currentEvent };
  }

  /**
   * Extract available arcade events/games
   */
  private static extractAvailableEvents(): ArcadeEvent[] {
    console.log("ArcadeDashboardService: Extracting available events...");

    const events: ArcadeEvent[] = [];

    // Look for event cards
    const eventSelectors = [
      ".card",
      ".event-card",
      ".arcade-game-card",
      ".game-card",
      '[class*="card"]',
    ];

    for (const selector of eventSelectors) {
      try {
        const cards = document.querySelectorAll(selector);

        for (const card of cards) {
          const event = this.extractEventFromCard(card as Element);
          if (event) {
            events.push(event);
            console.log(
              `ArcadeDashboardService: Found event: ${event.title} (${event.points} points)`
            );
          }
        }
      } catch (error) {
        console.warn(
          `ArcadeDashboardService: Error extracting events with ${selector}:`,
          error
        );
      }
    }

    console.log(`ArcadeDashboardService: Found ${events.length} total events`);
    return events;
  }

  /**
   * Extract event information from a card element
   */
  private static extractEventFromCard(card: Element): ArcadeEvent | null {
    try {
      // Extract title - check both card title and parent elements
      const titleSelectors = [
        ".card-title",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        ".title",
        '[class*="title"]',
      ];
      let title = "";

      // First try to get title from the card itself
      for (const selector of titleSelectors) {
        const titleElement = card.querySelector(selector);
        if (titleElement && titleElement.textContent?.trim()) {
          title = titleElement.textContent.trim();
          break;
        }
      }

      // If no title found in card, check parent container (for weekly trivia layout)
      if (!title) {
        let parentElement = card.parentElement;
        while (parentElement && !title) {
          for (const selector of titleSelectors) {
            const titleElement = parentElement.querySelector(selector);
            if (titleElement && titleElement.textContent?.trim()) {
              title = titleElement.textContent.trim();
              break;
            }
          }
          parentElement = parentElement.parentElement;
          // Limit search to 3 levels up to avoid going too far
          if (!parentElement || parentElement === document.body) break;
        }
      }

      if (!title) return null;

      // Generate full title for weekly events
      const fullTitle = this.generateEventTitle(title, card);

      // Only process arcade-related events
      const titleLower = fullTitle.toLowerCase();
      if (
        !titleLower.includes("arcade") &&
        !titleLower.includes("base camp") &&
        !titleLower.includes("game") &&
        !titleLower.includes("trivia") &&
        !titleLower.includes("week")
      ) {
        return null;
      }

      // Extract description
      let description = "";
      const descSelectors = [
        "p",
        ".description",
        ".card-text",
        '[class*="desc"]',
      ];
      for (const selector of descSelectors) {
        const descElement = card.querySelector(selector);
        if (descElement && descElement.textContent?.trim()) {
          description = descElement.textContent.trim();
          break;
        }
      }

      // Extract access code
      let accessCode = "";
      const codePattern = /access code[:\s]*([a-z0-9\-]+)/i;
      const cardText = card.textContent || "";
      const codeMatch = cardText.match(codePattern);
      if (codeMatch) {
        accessCode = codeMatch[1];
      }

      // Extract points
      let points = 0;
      const pointsPattern = /arcade points?[:\s]*(\d+)/i;
      const pointsMatch = cardText.match(pointsPattern);
      if (pointsMatch) {
        points = parseInt(pointsMatch[1], 10);
      } else {
        // Default points based on event type
        if (fullTitle.toLowerCase().includes("base camp")) points = 1;
        else if (fullTitle.toLowerCase().includes("trivia")) points = 1;
        else if (fullTitle.toLowerCase().includes("game")) points = 1;
        else if (fullTitle.toLowerCase().includes("special")) points = 2;
      }

      // Extract image URL
      let imageUrl = "";
      const imgElement = card.querySelector("img");
      if (imgElement && imgElement.src) {
        imageUrl = imgElement.src;
      }

      // Extract game URL
      let gameUrl = "";
      const linkElement = card.querySelector(
        'a[href*="cloudskillsboost.google"]'
      );
      if (linkElement) {
        gameUrl = (linkElement as HTMLAnchorElement).href;
      }

      // Determine if active
      const isActive =
        !cardText.toLowerCase().includes("ended") &&
        !cardText.toLowerCase().includes("closed") &&
        !cardText.toLowerCase().includes("completed");

      return {
        title: fullTitle,
        description: description || undefined,
        accessCode: accessCode || undefined,
        points,
        imageUrl: imageUrl || undefined,
        gameUrl: gameUrl || undefined,
        isActive,
      };
    } catch (error) {
      console.warn(
        "ArcadeDashboardService: Error extracting event from card:",
        error
      );
      return null;
    }
  }

  /**
   * Generate full event title for weekly events
   */
  private static generateEventTitle(title: string, card: Element): string {
    const titleLower = title.toLowerCase();

    // If title contains "week", generate full trivia title
    if (titleLower.includes("week")) {
      // Try to determine current month/year
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const currentYear = currentDate.getFullYear();

      // Extract week number from title
      const weekMatch = title.match(/week\s*(\d+)/i);
      const weekNumber = weekMatch ? weekMatch[1] : title;

      return `Skills Boost Arcade Trivia ${currentMonth} ${currentYear} Week ${weekNumber}`;
    }

    // For other events, return as is or try to enhance
    if (titleLower.includes("base camp")) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const currentYear = currentDate.getFullYear();

      if (!titleLower.includes(currentMonth.toLowerCase())) {
        return `The Arcade Base Camp ${currentMonth} ${currentYear}`;
      }
    }

    return title;
  }

  /**
   * Check if current page is arcade dashboard
   */
  static isArcadeDashboardPage(): boolean {
    const url = window.location.href;
    return (
      url.includes("go.cloudskillsboost.google/arcade") ||
      (url.includes("cloudskillsboost.google") && url.includes("arcade"))
    );
  }

  /**
   * Auto-detect and scrape if on arcade page
   */
  static autoScrapeIfArcadePage(): ArcadeDashboardData | null {
    if (this.isArcadeDashboardPage()) {
      console.log(
        "ArcadeDashboardService: Detected arcade page, auto-scraping..."
      );
      return this.extractArcadeDashboardData();
    }

    console.log(
      "ArcadeDashboardService: Not on arcade page, skipping auto-scrape"
    );
    return null;
  }
}

export default ArcadeDashboardService;
