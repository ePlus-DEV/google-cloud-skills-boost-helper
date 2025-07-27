import type { ArcadeData, Milestone, UIUpdateData } from "../types";

/**
 * Service to handle UI operations for popup and options
 */
const PopupUIService = {
  MILESTONES: [
    { points: 20, league: "Arcade Novice" },
    { points: 40, league: "Arcade Trooper" },
    { points: 65, league: "Arcade Ranger" },
    { points: 75, league: "Arcade Champion" },
    { points: 85, league: "Arcade Legend" },
  ] as Milestone[],

  /**
   * Generic DOM element selector with type safety
   */
  querySelector<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector);
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
      element.textContent = value?.toString() || "N/A";
    }
  },

  /**
   * Update multiple elements at once
   */
  updateElements(updates: UIUpdateData[]): void {
    updates.forEach(({ selector, value }) =>
      this.updateElementText(selector, value),
    );
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
   * Calculate league information
   */
  calculateLeagueInfo(totalPoints: number) {
    const roundedPoints = Math.floor(totalPoints);
    const currentLevel =
      this.MILESTONES.findIndex(
        (milestone, index) =>
          totalPoints <= milestone.points ||
          (this.MILESTONES[index + 1] &&
            totalPoints < this.MILESTONES[index + 1].points),
      ) + 1 || this.MILESTONES.length + 1;

    const nextMilestone =
      this.MILESTONES.find((milestone) => milestone.points > roundedPoints) ||
      this.MILESTONES[this.MILESTONES.length - 1];

    const isMaxLevel =
      nextMilestone.points ===
      this.MILESTONES[this.MILESTONES.length - 1].points;
    const currentLeague =
      this.MILESTONES[currentLevel - 1]?.league || "MAX LEVEL";

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
      { selector: "#user-name", value: "Error loading data" },
      { selector: "#league", value: "N/A" },
      { selector: "#total-points", value: "0 points" },
      { selector: "#arcade-points", value: "0" },
    ];
    this.updateElements(updates);
  },

  /**
   * Show loading state
   */
  showLoadingState(): void {
    const updates: UIUpdateData[] = [
      { selector: "#user-name", value: "Loading..." },
      { selector: "#league", value: "Loading..." },
      { selector: "#total-points", value: "Loading..." },
      { selector: "#arcade-points", value: "Loading..." },
    ];
    this.updateElements(updates);
  },

  /**
   * Update main UI with arcade data
   */
  updateMainUI(data: ArcadeData): void {
    const { userDetails, arcadePoints, lastUpdated } = data;

    // Handle both array and object formats for backward compatibility
    let userInfo;
    if (Array.isArray(userDetails)) {
      // Legacy format: userDetails is an array
      userInfo = userDetails[0] || {};
    } else {
      // New format: userDetails is an object
      userInfo = userDetails || {};
    }

    const { userName, league, points, profileImage } = userInfo;
    const {
      totalPoints = 0,
      gamePoints = 0,
      triviaPoints = 0,
      skillPoints = 0,
      specialPoints = 0,
    } = arcadePoints || {};

    // Update basic info
    const updates: UIUpdateData[] = [
      { selector: "#arcade-points", value: totalPoints },
      { selector: "#user-name", value: userName || "Anonymous" },
      { selector: "#league", value: league || "VIP" },
      {
        selector: "#total-points",
        value: `${points || totalPoints || 0} points`,
      },
      { selector: "#game-badge-count", value: gamePoints },
      { selector: "#trivia-badge-count", value: triviaPoints },
      { selector: "#skill-badge-count", value: skillPoints },
      { selector: "#special-points-count", value: specialPoints },
    ];

    this.updateElements(updates);
    this.updateAvatar(profileImage);

    // Update league info
    const leagueInfo = this.calculateLeagueInfo(totalPoints);
    this.updateLeagueInfo(
      leagueInfo.currentLeague,
      leagueInfo.isMaxLevel,
      leagueInfo.nextMilestone.points,
      totalPoints,
    );
    this.updateProgressBar(
      leagueInfo.roundedPoints,
      leagueInfo.nextMilestone.points,
    );
    this.updateLastUpdated(lastUpdated);

    // Show arcade points section
    this.toggleElementVisibility("#arcade-points", true);
  },

  /**
   * Update options UI with arcade data (specific for options page)
   */
  updateOptionsUI(data: ArcadeData): void {
    const { userDetails, arcadePoints } = data;

    // Handle both array and object formats for backward compatibility
    let userInfo;
    if (Array.isArray(userDetails)) {
      userInfo = userDetails[0] || {};
    } else {
      userInfo = userDetails || {};
    }

    const { userName, league, points, profileImage } = userInfo;
    const { totalPoints = 0 } = arcadePoints || {};

    // Update user info in options page (different selectors than popup)
    const updates: UIUpdateData[] = [
      { selector: "#user-name", value: userName || "Anonymous" },
      { selector: "#league", value: league || "VIP" },
      {
        selector: "#total-points",
        value: `${points || totalPoints || 0} points`,
      },
      { selector: "#arcade-total-points", value: totalPoints },
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
    buttons.forEach((button) => (button.disabled = disabled));
  },

  /**
   * Toggle CSS classes on elements
   */
  toggleClass(
    elements: NodeListOf<HTMLElement>,
    className: string,
    add: boolean,
  ): void {
    elements.forEach((element) => element.classList.toggle(className, add));
  },
};

export default PopupUIService;
