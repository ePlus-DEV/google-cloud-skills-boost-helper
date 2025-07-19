import type { ArcadeData, BadgeData, Milestone, UIUpdateData } from "../types";

/**
 * Service to handle UI operations for popup and options
 */
class PopupUIService {
  private static readonly MILESTONES: Milestone[] = [
    { points: 20, league: "Arcade Novice" },
    { points: 40, league: "Arcade Trooper" },
    { points: 65, league: "Arcade Ranger" },
    { points: 75, league: "Arcade Champion" },
    { points: 85, league: "Arcade Legend" },
  ];

  /**
   * Generic DOM element selector with type safety
   */
  static querySelector<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector);
  }

  /**
   * Update text content of an element
   */
  static updateElementText(
    selector: string,
    value: string | number | null | undefined
  ): void {
    const element = this.querySelector<HTMLElement>(selector);
    if (element) {
      element.textContent = value?.toString() || "N/A";
    } else {
      console.warn(
        `PopupUIService: Element not found for selector: ${selector}`
      );
    }
  }

  /**
   * Update multiple elements at once
   */
  static updateElements(updates: UIUpdateData[]): void {
    updates.forEach(({ selector, value }) =>
      this.updateElementText(selector, value)
    );
  }

  /**
   * Update avatar image
   */
  static updateAvatar(profileImage?: string): void {
    const avatarElement = this.querySelector<HTMLImageElement>("#user-avatar");
    if (avatarElement) {
      avatarElement.src =
        profileImage ||
        "https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg";
    }
  }

  /**
   * Update progress bar
   */
  static updateProgressBar(
    totalPoints: number,
    nextMilestonePoints: number
  ): void {
    const progressBar = this.querySelector<HTMLDivElement>("#progress-bar");
    if (progressBar) {
      progressBar.style.width = `${(totalPoints / nextMilestonePoints) * 100}%`;
    }
  }

  /**
   * Calculate league information
   */
  static calculateLeagueInfo(totalPoints: number) {
    const roundedPoints = Math.floor(totalPoints);
    const currentLevel =
      this.MILESTONES.findIndex(
        (milestone, index) =>
          totalPoints <= milestone.points ||
          (this.MILESTONES[index + 1] &&
            totalPoints < this.MILESTONES[index + 1].points)
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
  }

  /**
   * Update league information display
   */
  static updateLeagueInfo(
    currentLeague: string,
    isMaxLevel: boolean,
    nextMilestonePoints: number,
    totalPoints: number
  ): void {
    this.updateElementText(
      "#current-level",
      `${browser.i18n.getMessage("textCurrentLevel")}: ${currentLeague}`
    );

    this.updateElementText(
      "#next-level",
      isMaxLevel
        ? browser.i18n.getMessage("textMaxLevel")
        : `${browser.i18n.getMessage("textNextLevelInPoints")}: ${
            nextMilestonePoints - totalPoints
          } ${browser.i18n.getMessage("textPoints")}`
    );
  }

  /**
   * Update last updated timestamp
   */
  static updateLastUpdated(lastUpdated?: string): void {
    this.updateElementText(
      "#last-updated",
      `${browser.i18n.getMessage("labelLastUpdated")}: ${
        lastUpdated
          ? new Date(lastUpdated).toLocaleString(navigator.language)
          : "N/A"
      }`
    );
  }

  /**
   * Show/hide elements
   */
  static toggleElementVisibility(selector: string, show: boolean): void {
    const element = this.querySelector(selector);
    if (element) {
      element.classList.toggle("hidden", !show);
    }
  }

  /**
   * Show error state
   */
  static showErrorState(): void {
    const updates: UIUpdateData[] = [
      { selector: "#user-name", value: "Error loading data" },
      { selector: "#league", value: "N/A" },
      { selector: "#total-points", value: "0 points" },
      { selector: "#arcade-points", value: "0" },
    ];
    this.updateElements(updates);
  }

  /**
   * Show loading state
   */
  static showLoadingState(): void {
    const updates: UIUpdateData[] = [
      { selector: "#user-name", value: "Loading..." },
      { selector: "#league", value: "Loading..." },
      { selector: "#total-points", value: "Loading..." },
      { selector: "#arcade-points", value: "Loading..." },
    ];
    this.updateElements(updates);
  }

  /**
   * Update main UI with arcade data
   */
  static updateMainUI(data: ArcadeData): void {
    console.log("PopupUIService: updateMainUI called with data:", data);

    const { userDetails, arcadePoints, lastUpdated, badges } = data;
    console.log("PopupUIService: userDetails:", userDetails);
    console.log("PopupUIService: arcadePoints:", arcadePoints);

    // Handle both array and object formats for backward compatibility
    let userInfo;
    if (Array.isArray(userDetails)) {
      // Legacy format: userDetails is an array
      userInfo = userDetails[0] || {};
      console.log(
        "PopupUIService: userDetails is array, using first item:",
        userInfo
      );
    } else {
      // New format: userDetails is an object
      userInfo = userDetails || {};
      console.log("PopupUIService: userDetails is object:", userInfo);
    }

    const { userName, league, points, profileImage } = userInfo;
    const {
      totalPoints = 0,
      gamePoints = 0,
      triviaPoints = 0,
      skillPoints = 0,
      specialPoints = 0,
    } = arcadePoints || {};

    console.log("PopupUIService: extracted user data:", {
      userName,
      league,
      points,
      profileImage,
    });
    console.log("PopupUIService: extracted arcade points:", {
      totalPoints,
      gamePoints,
      triviaPoints,
      skillPoints,
      specialPoints,
    });

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

    console.log("PopupUIService: UI updates to apply:", updates);

    this.updateElements(updates);
    this.updateAvatar(profileImage);

    // Update league info
    const leagueInfo = this.calculateLeagueInfo(totalPoints);
    this.updateLeagueInfo(
      leagueInfo.currentLeague,
      leagueInfo.isMaxLevel,
      leagueInfo.nextMilestone.points,
      totalPoints
    );
    this.updateProgressBar(
      leagueInfo.roundedPoints,
      leagueInfo.nextMilestone.points
    );
    this.updateLastUpdated(lastUpdated);

    // Show arcade points section
    this.toggleElementVisibility("#arcade-points", true);
  }

  /**
   * Update options UI with arcade data (specific for options page)
   */
  static updateOptionsUI(data: ArcadeData): void {
    console.log("PopupUIService: updateOptionsUI called with data:", data);

    const { userDetails, arcadePoints, lastUpdated } = data;

    // Handle both array and object formats for backward compatibility
    let userInfo;
    if (Array.isArray(userDetails)) {
      userInfo = userDetails[0] || {};
    } else {
      userInfo = userDetails || {};
    }

    const { userName, league, points, profileImage } = userInfo;
    const { totalPoints = 0 } = arcadePoints || {};

    console.log("PopupUIService: Options page - extracted user data:", {
      userName,
      league,
      points,
      profileImage,
      totalPoints,
    });

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

    console.log("PopupUIService: Options UI updated successfully");
  }

  /**
   * Show message with styling
   */
  static showMessage(
    selector: string,
    message: string,
    classes: string[],
    timeout = 6000
  ): void {
    const element = this.querySelector(selector);
    if (element) {
      element.textContent = message;
      element.classList.remove("hidden");
      element.classList.add(...classes);
      setTimeout(() => element.classList.add("hidden"), timeout);
    }
  }

  /**
   * Toggle button states
   */
  static toggleButtonState(
    buttons: NodeListOf<HTMLButtonElement>,
    disabled: boolean
  ): void {
    buttons.forEach((button) => (button.disabled = disabled));
  }

  /**
   * Toggle CSS classes on elements
   */
  static toggleClass(
    elements: NodeListOf<HTMLElement>,
    className: string,
    add: boolean
  ): void {
    elements.forEach((element) => element.classList.toggle(className, add));
  }
}

export default PopupUIService;
