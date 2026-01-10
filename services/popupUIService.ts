import type { ArcadeData, Milestone, UIUpdateData } from "../types";
import {
  FACILITATOR_MILESTONE_REQUIREMENTS as SHARED_FACI_REQUIREMENTS,
  FACILITATOR_MILESTONE_POINTS as SHARED_FACI_POINTS,
  calculateFacilitatorBonus,
  calculateMilestoneBonusBreakdown,
} from "./facilitatorService";

/**
 * Service to handle UI operations for popup and options
 */
const PopupUIService = {
  // Arcade program: League-based progression system
  ARCADE_MILESTONES: [
    { points: 25, league: "Arcade Novice" },
    { points: 45, league: "Arcade Trooper" },
    { points: 65, league: "Arcade Ranger" },
    { points: 75, league: "Arcade Champion" },
    { points: 95, league: "Arcade Legend" },
  ] as Milestone[],

  // Use shared facilitator definitions from facilitatorService
  FACILITATOR_MILESTONE_REQUIREMENTS: SHARED_FACI_REQUIREMENTS,
  FACILITATOR_MILESTONE_POINTS: SHARED_FACI_POINTS as Record<
    string | number,
    number
  >,

  /**
   * Generic DOM element selector with type safety
   */
  querySelector<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector);
  },

  /**
   * Normalize userDetails payload to a consistent object shape
   */
  normalizeUserInfo(userDetails: any): any {
    if (Array.isArray(userDetails)) {
      return userDetails[0] || {};
    }
    return userDetails || {};
  },

  /**
   * Helper to convert milestone id to numeric order (ultimate -> 4)
   */
  getMilestoneNumber(milestone: string): number {
    return milestone === "ultimate" ? 4 : Number.parseInt(milestone);
  },

  /**
   * Check whether current stats meet a milestone's requirements
   */
  isMilestoneCompleted(current: any, requirements: any): boolean {
    return (
      current.games >= requirements.games &&
      current.trivia >= requirements.trivia &&
      current.skills >= requirements.skills &&
      current.labfree >= requirements.labfree
    );
  },

  /**
   * Update text content of an element
   */
  updateElementText(
    selector: string,
    value: string | number | null | undefined,
  ): void {
    const element = this.querySelector<HTMLElement>(selector);
    if (element) {
      element.textContent =
        value?.toString() || browser.i18n.getMessage("errorLoadingData");
    }
  },

  /**
   * Parse numeric points from various API shapes (string or number)
   */
  parseNumericPoints(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const match = /-?\d+(?:\.\d+)?/.exec(value);
      return match ? Number.parseFloat(match[0]) : 0;
    }
    return 0;
  },

  /**
   * Format points into thousands with 3 decimal places (38969 -> "38.969")
   */
  formatPointsThousands(value: unknown): string {
    const num = this.parseNumericPoints(value);
    if (!Number.isFinite(num)) return "0.000";
    return (num / 1000).toFixed(3);
  },

  /**
   * Update multiple elements at once
   */
  updateElements(updates: UIUpdateData[]): void {
    for (const { selector, value } of updates) {
      this.updateElementText(selector, value);
    }
  },

  /**
   * Update avatar image
   */
  updateAvatar(profileImage?: string): void {
    const avatarElement = this.querySelector<HTMLImageElement>("#user-avatar");
    if (avatarElement) {
      avatarElement.src =
        profileImage ||
        "https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg";
    }
  },

  /**
   * Update progress bar
   */
  updateProgressBar(totalPoints: number, nextMilestonePoints: number): void {
    const progressBar = this.querySelector<HTMLDivElement>("#progress-bar");
    if (progressBar) {
      progressBar.style.width = `${(totalPoints / nextMilestonePoints) * 100}%`;
    }
  },

  /**
   * Calculate league information (Arcade program)
   *
   * This implementation determines the next milestone strictly using
   * the rounded total points and derives the current league from the
   * milestone immediately below the next one. If there is no next
   * milestone the user is at MAX LEVEL.
   */
  calculateLeagueInfo(totalPoints: number) {
    const roundedPoints = Math.floor(totalPoints);

    // Find the first milestone that requires more points than the user has
    const nextIndex = this.ARCADE_MILESTONES.findIndex(
      (milestone) => milestone.points > roundedPoints,
    );

    const lastIndex = this.ARCADE_MILESTONES.length - 1;
    const isMaxLevel = nextIndex === -1;

    const nextMilestone = isMaxLevel
      ? this.ARCADE_MILESTONES[lastIndex]
      : this.ARCADE_MILESTONES[nextIndex];

    let currentLeague: string;
    if (isMaxLevel) {
      currentLeague = this.ARCADE_MILESTONES[lastIndex].league;
    } else if (nextIndex === 0) {
      // Not yet reached the first milestone -> show the first league as current
      currentLeague = this.ARCADE_MILESTONES[0].league;
    } else {
      currentLeague = this.ARCADE_MILESTONES[nextIndex - 1].league;
    }

    return {
      currentLeague,
      isMaxLevel,
      nextMilestone,
      roundedPoints,
    };
  },

  /**
   * Update league information display
   */
  updateLeagueInfo(
    currentLeague: string,
    isMaxLevel: boolean,
    nextMilestonePoints: number,
    totalPoints: number,
  ): void {
    this.updateElementText(
      "#current-level",
      `${browser.i18n.getMessage("textCurrentLevel")}: ${currentLeague}`,
    );

    this.updateElementText(
      "#next-level",
      isMaxLevel
        ? browser.i18n.getMessage("textMaxLevel")
        : `${browser.i18n.getMessage("textNextLevelInPoints")}: ${
            nextMilestonePoints - totalPoints
          } ${browser.i18n.getMessage("textPoints")}`,
    );
  },

  /**
   * Update last updated timestamp
   */
  updateLastUpdated(lastUpdated?: string): void {
    this.updateElementText(
      "#last-updated",
      `${browser.i18n.getMessage("labelLastUpdated")}: ${
        lastUpdated
          ? new Date(lastUpdated).toLocaleString(navigator.language)
          : "N/A"
      }`,
    );
  },

  /**
   * Format a number for small avatar badge. Examples: 0 -> 0, 1200 -> 1.2k, 1000000 -> 1M
   */
  formatAvatarBadge(value: number): string {
    const num = Math.floor(Number(value) || 0);
    if (num < 1000) return String(num);
    if (num < 1000000)
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  },

  /**
   * Show/hide elements
   */
  toggleElementVisibility(selector: string, show: boolean): void {
    const element = this.querySelector(selector);
    if (element) {
      element.classList.toggle("hidden", !show);
    }
  },

  /**
   * Show error state
   */
  showErrorState(): void {
    const updates: UIUpdateData[] = [
      {
        selector: "#user-name",
        value: browser.i18n.getMessage("errorLoadingData"),
      },
      { selector: "#league", value: browser.i18n.getMessage("textPoints") },
      {
        selector: "#total-points",
        value: `0 ${browser.i18n.getMessage("textPoints")}`,
      },
      { selector: "#arcade-points", value: "0" },
    ];
    this.updateElements(updates);
  },

  /**
   * Show loading state
   */
  showLoadingState(): void {
    const updates: UIUpdateData[] = [
      {
        selector: "#user-name",
        value: browser.i18n.getMessage("labelLoading"),
      },
      { selector: "#league", value: browser.i18n.getMessage("labelLoading") },
      {
        selector: "#total-points",
        value: browser.i18n.getMessage("labelLoading"),
      },
      {
        selector: "#arcade-points",
        value: browser.i18n.getMessage("labelLoading"),
      },
    ];
    this.updateElements(updates);
  },

  /**
   * Update main UI with arcade data
   *
   * Note: includeFacilitator parameter from caller indicates account setting.
   * We additionally check Firebase Remote Config for global program availability.
   */
  async updateMainUI(
    data: ArcadeData,
    includeFacilitator = false,
  ): Promise<void> {
    const { userDetails, arcadePoints, lastUpdated, faciCounts } = data;
    const userInfo = this.normalizeUserInfo(userDetails);
    const { userName, league, points, profileImage } = userInfo;
    const {
      totalPoints = 0,
      gamePoints = 0,
      triviaPoints = 0,
      skillPoints = 0,
      specialPoints = 0,
    } = arcadePoints || {};

    // Check Firebase config - is Facilitator program globally enabled?
    let facilitatorGloballyEnabled = false;
    try {
      const firebaseService = (await import("./firebaseService")).default;
      facilitatorGloballyEnabled = await firebaseService.getBooleanParam(
        "countdown_enabled_arcade",
        false,
      );
    } catch (error) {
      console.debug("Could not check facilitator global status:", error);
    }

    // Calculate facilitator bonus points only if:
    // 1. Account has facilitatorProgram enabled (includeFacilitator = true) AND
    // 2. Firebase config allows it globally (facilitatorGloballyEnabled = true)
    const shouldCalculateBonus =
      includeFacilitator && facilitatorGloballyEnabled;
    const facilitatorBonus =
      shouldCalculateBonus && faciCounts
        ? calculateFacilitatorBonus(faciCounts)
        : 0;

    console.debug(
      `📊 Facilitator Bonus Calculation: account=${includeFacilitator}, global=${facilitatorGloballyEnabled}, bonus=${facilitatorBonus}`,
    );

    // Add bonus points to total
    const finalTotalPoints = totalPoints + facilitatorBonus;

    // Update basic info
    const updates: UIUpdateData[] = [
      { selector: "#arcade-points", value: finalTotalPoints },
      {
        selector: "#user-name",
        value: userName || browser.i18n.getMessage("anonymous"),
      },
      { selector: "#league", value: league || browser.i18n.getMessage("vip") },
      {
        selector: "#total-points",
        // Show API points if present, otherwise finalTotalPoints. Format as thousands with 3 decimals.
        value: `${this.formatPointsThousands(
          points ?? finalTotalPoints ?? 0,
        )} ${browser.i18n.getMessage("textPoints")}`,
      },
      { selector: "#game-badge-count", value: gamePoints },
      { selector: "#trivia-badge-count", value: triviaPoints },
      { selector: "#skill-badge-count", value: skillPoints },
      { selector: "#special-points-count", value: specialPoints },
    ];

    // Show/hide detailed breakdown card
    const breakdownCard = this.querySelector("#points-breakdown-card");
    if (breakdownCard) {
      if (facilitatorBonus > 0) {
        breakdownCard.classList.remove("hidden");
        this.updateElementText("#base-points", `${totalPoints} points`);
        this.updateElementText(
          "#bonus-points",
          `+${facilitatorBonus} ${browser.i18n.getMessage("textPoints")}`,
        );
        this.updateElementText(
          "#total-combined-points",
          `${finalTotalPoints} ${browser.i18n.getMessage("textPoints")}`,
        );
      } else {
        breakdownCard.classList.add("hidden");
      }
    }

    this.updateElements(updates);
    this.updateAvatar(profileImage);

    // Update small avatar overlay badge with abbreviated total points
    try {
      const avatarBadge = this.querySelector<HTMLElement>(
        "#avatar-score-badge",
      );
      if (avatarBadge) {
        avatarBadge.textContent = this.formatAvatarBadge(finalTotalPoints);
        avatarBadge.title = `${finalTotalPoints} ${browser.i18n.getMessage(
          "textPoints",
        )}`;
      }
    } catch (e) {
      // Non-fatal: continue if avatar badge update fails
      console.debug("Avatar badge update skipped:", e);
    }

    // Update league info with bonus points included
    const leagueInfo = this.calculateLeagueInfo(finalTotalPoints);
    this.updateLeagueInfo(
      leagueInfo.currentLeague,
      leagueInfo.isMaxLevel,
      leagueInfo.nextMilestone.points,
      finalTotalPoints,
    );
    this.updateProgressBar(
      leagueInfo.roundedPoints,
      leagueInfo.nextMilestone.points,
    );
    this.updateLastUpdated(lastUpdated);

    // Show arcade points section
    this.toggleElementVisibility("#arcade-points", true);

    // Show/hide milestone section based on current account's facilitator program
    this.updateMilestoneSection();

    // Update milestone data if faciCounts is available
    if (faciCounts) {
      this.updateMilestoneData(faciCounts);
    }

    // Start countdown timer
    this.startFacilitatorCountdown();
  },

  /**
   * Test function to simulate milestone data with provided API data
   */
  testMilestoneWithAPIData(): void {
    // Test data from user's API response
    const testFaciCounts = {
      faciGame: 11,
      faciTrivia: 8,
      faciSkill: 54,
      faciCompletion: 24,
    };

    this.updateMilestoneData(testFaciCounts);

    // Force show milestone section for testing
    const milestoneSection = this.querySelector("#milestones-section");
    if (milestoneSection) {
      milestoneSection.classList.remove("hidden");
    }
  },

  /**
   * Update options UI with arcade data (specific for options page)
   */
  updateOptionsUI(data: ArcadeData): void {
    const { userDetails, arcadePoints } = data;
    const userInfo = this.normalizeUserInfo(userDetails);
    const { userName, league, points, profileImage } = userInfo;
    const { totalPoints = 0 } = arcadePoints || {};

    // Update user info in options page (different selectors than popup)
    const updates: UIUpdateData[] = [
      { selector: "#user-name", value: userName || "Anonymous" },
      { selector: "#league", value: league || "VIP" },
      {
        selector: "#total-points",
        value: `${this.formatPointsThousands(
          points ?? totalPoints ?? 0,
        )} ${browser.i18n.getMessage("textPoints")}`,
      },
      {
        selector: "#arcade-total-points",
        value: `${this.formatPointsThousands(
          totalPoints,
        )} ${browser.i18n.getMessage("textPoints")}`,
      },
    ];

    this.updateElements(updates);
    this.updateAvatar(profileImage);

    // Show arcade points section
    this.toggleElementVisibility("#arcade-points", true);
  },

  /**
   * Show message with styling
   */
  showMessage(
    selector: string,
    message: string,
    classes: string[],
    timeout = 6000,
  ): void {
    const element = this.querySelector(selector);
    if (element) {
      element.textContent = message;
      element.classList.remove("hidden");
      element.classList.add(...classes);
      setTimeout(() => element.classList.add("hidden"), timeout);
    }
  },

  /**
   * Toggle button states
   */
  toggleButtonState(
    buttons: NodeListOf<HTMLButtonElement>,
    disabled: boolean,
  ): void {
    for (const button of buttons) {
      button.disabled = disabled;
    }
  },

  /**
   * Toggle CSS classes on elements
   */
  toggleClass(
    elements: NodeListOf<HTMLElement>,
    className: string,
    add: boolean,
  ): void {
    for (const element of elements) {
      element.classList.toggle(className, add);
    }
  },

  /**
   * Update milestone section visibility based on BOTH:
   * 1. Current account's facilitator program setting
   * 2. Firebase Remote Config (countdown_enabled_arcade)
   *
   * This allows hiding Facilitator for entire season even if users have it enabled
   */
  async updateMilestoneSection(): Promise<void> {
    const milestoneSection = this.querySelector("#milestones-section");
    if (!milestoneSection) return;

    try {
      // Import services dynamically to avoid circular dependency
      const AccountService = (await import("./accountService")).default;
      const firebaseService = (await import("./firebaseService")).default;

      const currentAccount = await AccountService.getActiveAccount();

      // Check Firebase config - is Facilitator program globally enabled?
      const facilitatorGloballyEnabled = await firebaseService.getBooleanParam(
        "countdown_enabled_arcade",
        false, // Default to false if not set
      );

      // Show milestone section ONLY if:
      // 1. Account has facilitatorProgram enabled AND
      // 2. Firebase config allows it (for season control)
      const shouldShowFacilitator =
        currentAccount?.facilitatorProgram === true &&
        facilitatorGloballyEnabled === true;

      if (shouldShowFacilitator) {
        // Show milestone section for facilitator accounts when program is active
        milestoneSection.classList.remove("hidden");
        console.debug("✅ Facilitator: Showing (account=true, global=true)");
      } else {
        // Hide milestone section
        milestoneSection.classList.add("hidden");
        console.debug(
          `❌ Facilitator: Hidden (account=${currentAccount?.facilitatorProgram}, global=${facilitatorGloballyEnabled})`,
        );
      }
    } catch (error) {
      console.error("Error updating milestone section:", error);
      // Hide milestone section on error
      milestoneSection.classList.add("hidden");
    }
  },

  /**
   * Update milestone data with facilitator counts from API
   */
  updateMilestoneData(faciCounts: any): void {
    if (!faciCounts) return;

    const {
      faciGame = 0,
      faciTrivia = 0,
      faciSkill = 0,
      faciCompletion = 0,
    } = faciCounts;

    // Calculate bonus breakdown using shared facilitator service
    const bonusBreakdown = calculateMilestoneBonusBreakdown(faciCounts);

    // Update each facilitator milestone
    for (const [milestone, requirements] of Object.entries(
      this.FACILITATOR_MILESTONE_REQUIREMENTS,
    )) {
      this.updateSingleMilestone(
        milestone,
        {
          games: faciGame,
          trivia: faciTrivia,
          skills: faciSkill,
          labfree: faciCompletion,
        },
        requirements,
      );
    }

    // Update total bonus summary
    const totalBonus = calculateFacilitatorBonus(faciCounts);
    this.updateElementText("#total-facilitator-bonus", `${totalBonus} points`);
    // Update milestone bonus breakdown display and total
    this.updateBreakdownItems(bonusBreakdown);
    this.updateBreakdownTotal(bonusBreakdown);

    // Setup milestone card click handlers
    this.setupMilestoneCardHandlers();

    // Setup breakdown card toggle
    this.setupBreakdownToggle();
  },

  /**
   * Update the individual breakdown items in the UI
   */
  updateBreakdownItems(bonusBreakdown: any): void {
    const breakdownItems = document.querySelectorAll(".breakdown-item");
    if (breakdownItems.length < 4) return;

    const milestones = ["1", "2", "3", "ultimate"];
    for (const [index, milestone] of milestones.entries()) {
      const item = breakdownItems[index];
      const pointsElement = item.querySelector(".breakdown-points");
      if (!pointsElement) continue;

      const points =
        bonusBreakdown.milestones[
          milestone as keyof typeof bonusBreakdown.milestones
        ];
      pointsElement.textContent = points > 0 ? `+${points}` : "+0";

      // Update styling based on earned status
      if (points > 0) {
        pointsElement.classList.remove("text-gray-400");
        pointsElement.classList.add("text-green-600", "font-semibold");
      } else {
        pointsElement.classList.remove("text-green-600", "font-semibold");
        pointsElement.classList.add("text-gray-400");
      }
    }
  },

  /**
   * Update the breakdown total display
   */
  updateBreakdownTotal(bonusBreakdown: any): void {
    const breakdownTotal = document.querySelector("#breakdown-total");
    if (breakdownTotal) {
      breakdownTotal.textContent = `+${bonusBreakdown.total}`;
    }
  },

  /**
   * Setup click handler for points breakdown card toggle
   */
  setupBreakdownToggle(): void {
    const breakdownCard = this.querySelector("#points-breakdown-card");
    const breakdownDetails = this.querySelector("#breakdown-details");
    const toggleIcon = this.querySelector("#breakdown-toggle");

    if (breakdownCard && breakdownDetails && toggleIcon) {
      breakdownCard.addEventListener("click", (e) => {
        e.preventDefault();

        const isCollapsed = breakdownDetails.classList.contains("hidden");

        if (isCollapsed) {
          breakdownDetails.classList.remove("hidden");
          toggleIcon.classList.remove("fa-chevron-down");
          toggleIcon.classList.add("fa-chevron-up");
        } else {
          breakdownDetails.classList.add("hidden");
          toggleIcon.classList.remove("fa-chevron-up");
          toggleIcon.classList.add("fa-chevron-down");
        }
      });
    }
  },

  // Facilitator calculations are provided by the shared facilitatorService

  /**
   * Setup click handlers for milestone cards to toggle details
   */
  setupMilestoneCardHandlers(): void {
    const milestoneCards = document.querySelectorAll(".milestone-card");

    for (const card of milestoneCards) {
      // Remove any existing listeners
      const newCard = card.cloneNode(true) as HTMLElement;
      card.parentNode?.replaceChild(newCard, card);

      newCard.addEventListener("click", (e) => {
        e.preventDefault();
        const milestone = newCard.dataset.milestone;
        if (milestone) {
          this.toggleMilestoneDetails(milestone);
        }
      });
    }
  },

  /**
   * Calculate progress using different methods
   */
  calculateProgressMethods(current: any, requirements: any): any {
    // Method 1: Binary Completion (current default)
    const completed = [
      current.games >= requirements.games,
      current.trivia >= requirements.trivia,
      current.skills >= requirements.skills,
      current.labfree >= requirements.labfree,
    ];
    const completedCount = completed.filter(Boolean).length;
    const binary = Math.round((completedCount / 4) * 100);

    // Method 2: Weighted Average Progress
    const gameProgress = Math.min(current.games / requirements.games, 1) * 100;
    const triviaProgress =
      Math.min(current.trivia / requirements.trivia, 1) * 100;
    const skillProgress =
      Math.min(current.skills / requirements.skills, 1) * 100;
    const labfreeProgress =
      Math.min(current.labfree / requirements.labfree, 1) * 100;
    const weighted = Math.round(
      (gameProgress + triviaProgress + skillProgress + labfreeProgress) / 4,
    );

    // Method 3: Proportional Total Progress
    const currentTotal =
      current.games + current.trivia + current.skills + current.labfree;
    const requiredTotal =
      requirements.games +
      requirements.trivia +
      requirements.skills +
      requirements.labfree;
    const proportional = Math.round((currentTotal / requiredTotal) * 100);

    // Method 4: Minimum Requirement Progress
    const minimum = Math.round(
      Math.min(gameProgress, triviaProgress, skillProgress, labfreeProgress),
    );

    // Completion status (same for all methods)
    const isCompleted = completedCount === 4;

    return {
      binary,
      weighted,
      proportional,
      minimum,
      isCompleted,
      details: {
        gameProgress: Math.round(gameProgress * 100) / 100,
        triviaProgress: Math.round(triviaProgress * 100) / 100,
        skillProgress: Math.round(skillProgress * 100) / 100,
        labfreeProgress: Math.round(labfreeProgress * 100) / 100,
      },
    };
  },

  /**
   * Toggle milestone details visibility
   */
  toggleMilestoneDetails(milestone: string): void {
    const detailsElement = this.querySelector(
      `.milestone-card[data-milestone="${milestone}"] .milestone-details`,
    );
    if (detailsElement) {
      detailsElement.classList.toggle("hidden");
    }
  },

  /**
   * Update a single milestone card with progress data
   */
  updateSingleMilestone(
    milestone: string,
    current: any,
    requirements: any,
  ): void {
    // Update individual counts
    this.updateElementText(
      `.milestone-${milestone}-games`,
      `${Math.min(current.games, requirements.games)}/${requirements.games}${
        current.games >= requirements.games ? " ✓" : ""
      }`,
    );

    this.updateElementText(
      `.milestone-${milestone}-trivia`,
      `${Math.min(current.trivia, requirements.trivia)}/${requirements.trivia}${
        current.trivia >= requirements.trivia ? " ✓" : ""
      }`,
    );

    this.updateElementText(
      `.milestone-${milestone}-skills`,
      `${Math.min(current.skills, requirements.skills)}/${requirements.skills}${
        current.skills >= requirements.skills ? " ✓" : ""
      }`,
    );

    this.updateElementText(
      `.milestone-${milestone}-labfree`,
      `${Math.min(current.labfree, requirements.labfree)}/${
        requirements.labfree
      }${current.labfree >= requirements.labfree ? " ✓" : ""}`,
    );

    // Calculate overall progress using different methods
    const progressMethods = this.calculateProgressMethods(
      current,
      requirements,
    );

    // Use Binary Completion method as default
    const progressPercent = progressMethods.binary; // Binary: completion-based (3/4 = 75%)
    const isCompleted = progressMethods.isCompleted;

    // Update progress element and status icon via helpers
    this.updateProgressElement(milestone, progressPercent, progressMethods);
    this.updateStatusIcon(milestone, isCompleted, progressPercent);
  },

  /**
   * Update the progress element text, tooltip and cursor
   */
  updateProgressElement(
    milestone: string,
    progressPercent: number,
    progressMethods: any,
  ): void {
    const progressElement = this.querySelector(
      `.milestone-${milestone}-progress`,
    );
    if (!progressElement) return;

    progressElement.textContent = `${progressPercent}%`;

    const tooltip = `Progress Methods:
• Binary: ${progressMethods.binary}% (completion-based) ★ ACTIVE
• Weighted: ${progressMethods.weighted}% (average progress)
• Proportional: ${progressMethods.proportional}% (total ratio)
• Minimum: ${progressMethods.minimum}% (bottleneck)

Details:
• Games: ${progressMethods.details.gameProgress}%
• Trivia: ${progressMethods.details.triviaProgress}%
• Skills: ${progressMethods.details.skillProgress}%
• Lab-free: ${progressMethods.details.labfreeProgress}%

Formula: 3/4 requirements completed = ${progressMethods.binary}%`;

    progressElement.setAttribute("title", tooltip);
    progressElement.style.cursor = "help";

    // Update progress text color without wiping other classes
    const removable = [
      "text-green-400",
      "text-orange-400",
      "text-gray-400",
      "font-bold",
    ];
    try {
      progressElement.classList.remove(...removable);
    } catch (_) {}

    if (progressPercent === 100) {
      progressElement.classList.add("text-green-400", "font-bold");
    } else if (progressPercent > 0) {
      progressElement.classList.add("text-orange-400", "font-bold");
    } else {
      progressElement.classList.add("text-gray-400", "font-bold");
    }
  },

  /**
   * Update the status icon element based on completion and progress
   */
  updateStatusIcon(
    milestone: string,
    isCompleted: boolean,
    progressPercent: number,
  ): void {
    const statusIcon = this.querySelector(`.milestone-${milestone}-status`);
    if (!statusIcon) return;

    // Remove known icon and color classes so we don't duplicate or leave stale
    const iconRemovable = [
      "fa-check-circle",
      "fa-clock",
      "fa-circle",
      "fa-clock-o",
      "fa-solid",
    ];
    const colorRemovable = [
      "text-green-400",
      "text-orange-400",
      "text-gray-400",
    ];
    try {
      statusIcon.classList.remove(...iconRemovable, ...colorRemovable);
    } catch (_) {}

    // Ensure base classes remain (do not wipe other unrelated classes)
    statusIcon.classList.add(
      "fa-solid",
      `milestone-${milestone}-status`,
      "text-sm",
    );

    if (isCompleted) {
      statusIcon.classList.add("fa-check-circle", "text-green-400");
      statusIcon.title = browser.i18n.getMessage("statusCompleted");
    } else if (progressPercent > 0) {
      statusIcon.classList.add("fa-clock", "text-orange-400");
      statusIcon.title = browser.i18n.getMessage("statusInProgress");
    } else {
      statusIcon.classList.add("fa-circle", "text-gray-400");
      statusIcon.title = browser.i18n.getMessage("statusNotStarted");
    }
  },

  /**
   * Hide countdown display when disabled
   */
  hideCountdownDisplay(): void {
    const countdownSection = this.querySelector("#countdown-container");
    if (countdownSection) {
      countdownSection.classList.add("hidden");
    }
  },

  /**
   * Show countdown display when enabled
   */
  showCountdownDisplay(): void {
    const countdownSection = this.querySelector("#countdown-container");
    if (countdownSection) {
      countdownSection.classList.remove("hidden");
    }
  },

  /**
   * Start facilitator program countdown timer with Firebase Remote Config
   */
  async startFacilitatorCountdown(): Promise<void> {
    // Support multiple countdown instances. Each instance should have
    // elements with class `.countdown-instance` and data attributes:
    // - data-countdown-key (optional): remote config key for deadline
    // If not provided, default `countdown_deadline_facilitator` and `countdown_enabled_facilitator` are used.

    const firebaseService = (await import("./firebaseService")).default;

    const now = new Date();
    const currentYear = now.getFullYear();
    // Default to end of current year if env var is missing/empty
    const defaultFacilitatorDeadline =
      import.meta.env.WXT_COUNTDOWN_DEADLINE_FACILITATOR ||
      `${currentYear}-12-31T23:59:59+05:30`;

    const getArcadeDefaultDeadline = () => {
      const now = new Date();
      const year = now.getFullYear();
      return `${year}-12-31T23:59:59+00:00`;
    };

    const getProgramDefaultDeadline = (
      program: string | undefined,
      key: string,
    ): string => {
      const normalized = program?.toLowerCase();
      if (normalized === "arcade" || key.toLowerCase().includes("arcade")) {
        return getArcadeDefaultDeadline();
      }
      return defaultFacilitatorDeadline;
    };

    const formatCountdownDeadlineLabel = (
      date: Date,
      source?: string,
    ): string => {
      try {
        const dateStr = date.toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });
        return dateStr;
      } catch (e) {
        console.debug("formatCountdownDeadlineLabel fallback triggered", e);
        return date.toISOString();
      }
    };

    const renderEndedState = (program: string | undefined): string => {
      const normalized = program?.toLowerCase();
      const isArcade = normalized === "arcade";
      const accentClass = isArcade ? "text-sky-400" : "text-red-400";
      const detailClass = isArcade ? "text-sky-300/70" : "text-red-300/70";
      const iconClass = isArcade ? "fa-gamepad" : "fa-clock-o";
      const messageKey =
        normalized === "arcade"
          ? "arcadeDeadlinePassed"
          : "facilitatorDeadlinePassed";
      const getMessage = (key: string): string =>
        browser.i18n.getMessage(
          key as Parameters<typeof browser.i18n.getMessage>[0],
        );

      return `
        <div class="text-center ${accentClass}">
          <i class="fa-solid ${iconClass} text-2xl mb-2"></i>
          <div class="font-bold">${getMessage("programEnded")}</div>
          <div class="text-xs ${detailClass}">${getMessage(messageKey)}</div>
        </div>
      `;
    };

    // Initialize Firebase if not already done
    try {
      if (!firebaseService.isInitialized()) {
        await firebaseService.initialize();
      }
    } catch (e) {
      // initialization failure is non-fatal; we'll fall back per-instance
      console.error(
        "Error initializing Firebase for facilitator countdown:",
        e,
      );
    }

    // Clear any existing intervals for countdown instances
    // We keep a map on this object to preserve intervals across calls
    if (!(this as any)._countdownIntervals)
      (this as any)._countdownIntervals = new Map<string, number>();
    const intervals: Map<string, number> = (this as any)._countdownIntervals;

    // Find all countdown instances
    const instances = document.querySelectorAll<HTMLElement>(
      ".countdown-instance",
    );

    // Helper to clear interval by id
    const clearIntervalById = (id: string) => {
      const iv = intervals.get(id);
      if (iv) {
        try {
          clearInterval(iv);
        } catch {}
        intervals.delete(id);
      }
    };

    // Iterate instances sequentially and set up timers. Processing sequentially
    // lets us await remote config reads and decide whether to schedule an
    // interval (we avoid scheduling intervals for deadlines already passed).
    let createdArcadeInstance = false;
    const nodes = Array.from(instances.values());
    for (let idx = 0; idx < nodes.length; idx++) {
      const el = nodes[idx];
      const id = el.id || `countdown-${idx}`;
      const program = el.dataset.program;

      // Clear previous interval if exists
      clearIntervalById(id);

      // Extract data attribute for remote key
      const rcKey = el.dataset.countdownKey || "countdown_deadline_facilitator";
      const rcToggleKey =
        el.dataset.countdownToggleKey || "countdown_enabled_facilitator";

      // Determine deadline and enabled state
      let deadlineDate: Date;
      let enabled = true;
      const fallbackDeadline = getProgramDefaultDeadline(program, rcKey);

      let configSource: string | undefined;
      try {
        const deadlineStr = await firebaseService.getStringParam(
          rcKey,
          fallbackDeadline,
        );
        enabled = await firebaseService.getBooleanParam(rcToggleKey, true);

        // Get configuration source for display
        const params = firebaseService.getAllParams();
        configSource = params[rcKey]?.source;

        if (!enabled) {
          // Hide this specific instance
          el.classList.add("hidden");
          continue;
        } else {
          el.classList.remove("hidden");
        }

        deadlineDate = new Date(deadlineStr);
        if (isNaN(deadlineDate.getTime())) {
          deadlineDate = new Date(fallbackDeadline);
        }
      } catch (e) {
        // Fallback
        deadlineDate = new Date(fallbackDeadline);
        configSource = "fallback";
      }

      const deadlineLabelEl = el.querySelector<HTMLElement>(
        ".countdown-deadline-label",
      );
      if (deadlineLabelEl && !isNaN(deadlineDate.getTime())) {
        deadlineLabelEl.innerHTML = formatCountdownDeadlineLabel(
          deadlineDate,
          configSource,
        );
      }

      // If the deadline is already passed, render the ended state once and
      // (for facilitator) ensure the arcade instance exists. We do NOT
      // schedule a repeating interval for already-expired instances to avoid
      // re-creating intervals that immediately expire and re-enter this
      // function.
      const now = new Date();
      const initialDiff = deadlineDate.getTime() - now.getTime();
      if (initialDiff <= 0) {
        // Show zeroed counters if present
        const daysEl = el.querySelector<HTMLElement>(".countdown-days");
        const hoursEl = el.querySelector<HTMLElement>(".countdown-hours");
        const minutesEl = el.querySelector<HTMLElement>(".countdown-minutes");
        const secondsEl = el.querySelector<HTMLElement>(".countdown-seconds");
        if (daysEl) daysEl.textContent = "00";
        if (hoursEl) hoursEl.textContent = "00";
        if (minutesEl) minutesEl.textContent = "00";
        if (secondsEl) secondsEl.textContent = "00";

        // replace instance content with ended message
        el.innerHTML = renderEndedState(program);

        try {
          if ((program ?? "").toLowerCase() === "facilitator") {
            let arcadeEl = document.querySelector<HTMLElement>(
              '.countdown-instance[data-program="arcade"]',
            );

            if (!arcadeEl) {
              // Create a minimal arcade instance under the milestones or countdown container
              const container =
                document.querySelector("#milestones-section") ||
                document.querySelector("#countdown-container") ||
                document.body;

              const wrapper = document.createElement("div");
              wrapper.className =
                "countdown-card countdown-instance bg-gradient-to-r from-sky-500/20 to-indigo-500/20 backdrop-blur-md rounded-lg p-3 border border-sky-400/30";
              wrapper.setAttribute("data-program", "arcade");
              // ensure arcade uses an explicit remote key if you want
              wrapper.setAttribute(
                "data-countdown-key",
                "countdown_deadline_arcade",
              );
              wrapper.setAttribute(
                "data-countdown-toggle-key",
                "countdown_enabled_arcade",
              );
              // Use default child elements expected by the updater
              wrapper.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center">
                    <i class="fa-solid fa-gamepad text-sky-400 text-lg mr-2"></i>
                    <span class="text-white font-bold text-sm">
                      Arcade Season Countdown
                    </span>
                  </div>
                  <div class="text-xs text-sky-300/70 countdown-deadline-label" title="Configuration source will be displayed here">
                    Loading...
                  </div>
                </div>
                <div class="flex items-center justify-center space-x-4 text-center">
                  <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                    <div class="text-sky-400 font-bold text-lg countdown-days">00</div>
                    <div class="text-sky-300/70 text-xs">Days</div>
                  </div>
                  <div class="text-sky-400 text-lg">:</div>
                  <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                    <div class="text-sky-400 font-bold text-lg countdown-hours">00</div>
                    <div class="text-sky-300/70 text-xs">Hours</div>
                  </div>
                  <div class="text-sky-400 text-lg">:</div>
                  <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                    <div class="text-sky-400 font-bold text-lg countdown-minutes">00</div>
                    <div class="text-sky-300/70 text-xs">Minutes</div>
                  </div>
                  <div class="text-sky-400 text-lg">:</div>
                  <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                    <div class="text-sky-400 font-bold text-lg countdown-seconds">00</div>
                    <div class="text-sky-300/70 text-xs">Seconds</div>
                  </div>
                </div>
                <div class="text-xs text-sky-300/70 mt-2 text-center">
                  <i class="fa-solid fa-bolt mr-1"></i>
                  Keep the momentum going and climb the Arcade leaderboard!
                </div>
              `;
              container.appendChild(wrapper);
              arcadeEl = wrapper;
              createdArcadeInstance = true;
            }

            // Ensure countdown UI is visible and arcade instance is shown
            try {
              this.showCountdownDisplay();
              arcadeEl.classList.remove("hidden");
            } catch (_) {}
          }
        } catch (_) {}

        // Do not schedule an interval for already-expired instances
        continue;
      }

      // Query inner elements for time parts (allow per-instance selectors)
      const daysEl = el.querySelector<HTMLElement>(".countdown-days");
      const hoursEl = el.querySelector<HTMLElement>(".countdown-hours");
      const minutesEl = el.querySelector<HTMLElement>(".countdown-minutes");
      const secondsEl = el.querySelector<HTMLElement>(".countdown-seconds");

      const updateFn = () => {
        const now = new Date();
        const diff = deadlineDate.getTime() - now.getTime();

        if (diff <= 0) {
          if (daysEl) daysEl.textContent = "00";
          if (hoursEl) hoursEl.textContent = "00";
          if (minutesEl) minutesEl.textContent = "00";
          if (secondsEl) secondsEl.textContent = "00";

          // replace instance content with ended message
          el.innerHTML = renderEndedState(program);

          // If this was the facilitator instance, ensure the arcade countdown
          // is running until end of December. Create one if missing.
          try {
            if ((program ?? "").toLowerCase() === "facilitator") {
              let arcadeEl = document.querySelector<HTMLElement>(
                '.countdown-instance[data-program="arcade"]',
              );

              if (!arcadeEl) {
                // Create a minimal arcade instance under the milestones or countdown container
                const container =
                  document.querySelector("#milestones-section") ||
                  document.querySelector("#countdown-container") ||
                  document.body;

                const wrapper = document.createElement("div");
                wrapper.className =
                  "countdown-card countdown-instance bg-gradient-to-r from-sky-500/20 to-indigo-500/20 backdrop-blur-md rounded-lg p-3 border border-sky-400/30";
                wrapper.setAttribute("data-program", "arcade");
                // ensure arcade uses an explicit remote key if you want
                wrapper.setAttribute(
                  "data-countdown-key",
                  "countdown_deadline_arcade",
                );
                wrapper.setAttribute(
                  "data-countdown-toggle-key",
                  "countdown_enabled_arcade",
                );
                // Use default child elements expected by the updater
                wrapper.innerHTML = `
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                      <i class="fa-solid fa-gamepad text-sky-400 text-lg mr-2"></i>
                      <span class="text-white font-bold text-sm">
                        Arcade Season Countdown
                      </span>
                    </div>
                    <div class="text-xs text-sky-300/70 countdown-deadline-label" title="Configuration source will be displayed here">
                      Loading...
                    </div>
                  </div>
                  <div class="flex items-center justify-center space-x-4 text-center">
                    <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                      <div class="text-sky-400 font-bold text-lg countdown-days">00</div>
                      <div class="text-sky-300/70 text-xs">Days</div>
                    </div>
                    <div class="text-sky-400 text-lg">:</div>
                    <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                      <div class="text-sky-400 font-bold text-lg countdown-hours">00</div>
                      <div class="text-sky-300/70 text-xs">Hours</div>
                    </div>
                    <div class="text-sky-400 text-lg">:</div>
                    <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                      <div class="text-sky-400 font-bold text-lg countdown-minutes">00</div>
                      <div class="text-sky-300/70 text-xs">Minutes</div>
                    </div>
                    <div class="text-sky-400 text-lg">:</div>
                    <div class="bg-black/20 rounded-lg p-2 min-w-[50px]">
                      <div class="text-sky-400 font-bold text-lg countdown-seconds">00</div>
                      <div class="text-sky-300/70 text-xs">Seconds</div>
                    </div>
                  </div>
                  <div class="text-xs text-sky-300/70 mt-2 text-center">
                    <i class="fa-solid fa-bolt mr-1"></i>
                    Keep the momentum going and climb the Arcade leaderboard!
                  </div>
                `;
                container.appendChild(wrapper);
                arcadeEl = wrapper;
                createdArcadeInstance = true;
              }

              // Ensure countdown UI is visible and arcade instance is shown
              try {
                this.showCountdownDisplay();
                arcadeEl.classList.remove("hidden");
              } catch (_) {}
            }
          } catch (_) {}

          clearIntervalById(id);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
      };

      // Run immediately and every second
      updateFn();
      const intervalId = setInterval(updateFn, 1000) as unknown as number;
      intervals.set(id, intervalId);
    }

    // If we created an arcade instance during processing of expired facilitator,
    // kick off a new pass to start countdowns for any non-expired instances
    // (run on next tick to avoid immediate recursion).
    if (createdArcadeInstance) {
      setTimeout(() => {
        void this.startFacilitatorCountdown();
      }, 0);
    }
  },
};

export default PopupUIService;
