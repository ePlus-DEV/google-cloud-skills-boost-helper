import type { ArcadeData, Milestone, UIUpdateData } from "../types";

/**
 * Service to handle UI operations for popup and options
 */
const PopupUIService = {
  MILESTONES: [
    { points: 25, league: "Arcade Novice" },
    { points: 45, league: "Arcade Trooper" },
    { points: 65, league: "Arcade Ranger" },
    { points: 75, league: "Arcade Champion" },
    { points: 95, league: "Arcade Legend" },
  ] as Milestone[],

  // Milestone requirements for facilitator program
  MILESTONE_REQUIREMENTS: {
    1: { games: 6, trivia: 5, skills: 14, labfree: 6 },
    2: { games: 8, trivia: 6, skills: 28, labfree: 12 },
    3: { games: 10, trivia: 7, skills: 38, labfree: 18 },
    ultimate: { games: 12, trivia: 8, skills: 52, labfree: 24 },
  },

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
    value: string | number | null | undefined
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
      this.updateElementText(selector, value)
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
  },

  /**
   * Update league information display
   */
  updateLeagueInfo(
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
      }`
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
    const { userDetails, arcadePoints, lastUpdated, faciCounts } = data;

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
      totalPoints
    );
    this.updateProgressBar(
      leagueInfo.roundedPoints,
      leagueInfo.nextMilestone.points
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

    console.log("Testing milestone with API data:", testFaciCounts);
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
    timeout = 6000
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
    disabled: boolean
  ): void {
    buttons.forEach((button) => (button.disabled = disabled));
  },

  /**
   * Toggle CSS classes on elements
   */
  toggleClass(
    elements: NodeListOf<HTMLElement>,
    className: string,
    add: boolean
  ): void {
    elements.forEach((element) => element.classList.toggle(className, add));
  },

  /**
   * Update milestone section visibility based on current account's facilitator program
   */
  async updateMilestoneSection(): Promise<void> {
    const milestoneSection = this.querySelector("#milestones-section");
    if (!milestoneSection) return;

    try {
      // Import AccountService dynamically to avoid circular dependency
      const AccountService = (await import("./accountService")).default;
      const currentAccount = await AccountService.getActiveAccount();

      if (currentAccount?.facilitatorProgram) {
        // Show milestone section for facilitator accounts
        milestoneSection.classList.remove("hidden");
      } else {
        // Hide milestone section for non-facilitator accounts
        milestoneSection.classList.add("hidden");
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

    // Update each milestone
    Object.entries(this.MILESTONE_REQUIREMENTS).forEach(
      ([milestone, requirements]) => {
        this.updateSingleMilestone(
          milestone,
          {
            games: faciGame,
            trivia: faciTrivia,
            skills: faciSkill,
            labfree: faciCompletion,
          },
          requirements
        );
      }
    );

    // Setup milestone card click handlers
    this.setupMilestoneCardHandlers();
  },

  /**
   * Setup click handlers for milestone cards to toggle details
   */
  setupMilestoneCardHandlers(): void {
    const milestoneCards = document.querySelectorAll(".milestone-card");

    milestoneCards.forEach((card) => {
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
    });
  },

  /**
   * Toggle milestone details visibility
   */
  toggleMilestoneDetails(milestone: string): void {
    const detailsElement = this.querySelector(
      `.milestone-card[data-milestone="${milestone}"] .milestone-details`
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
    requirements: any
  ): void {
    // Update individual counts
    this.updateElementText(
      `.milestone-${milestone}-games`,
      `${Math.min(current.games, requirements.games)}/${requirements.games}${
        current.games >= requirements.games ? " ✓" : ""
      }`
    );

    this.updateElementText(
      `.milestone-${milestone}-trivia`,
      `${Math.min(current.trivia, requirements.trivia)}/${requirements.trivia}${
        current.trivia >= requirements.trivia ? " ✓" : ""
      }`
    );

    this.updateElementText(
      `.milestone-${milestone}-skills`,
      `${Math.min(current.skills, requirements.skills)}/${requirements.skills}${
        current.skills >= requirements.skills ? " ✓" : ""
      }`
    );

    this.updateElementText(
      `.milestone-${milestone}-labfree`,
      `${Math.min(current.labfree, requirements.labfree)}/${
        requirements.labfree
      }${current.labfree >= requirements.labfree ? " ✓" : ""}`
    );

    // Calculate overall progress
    const completed = [
      current.games >= requirements.games,
      current.trivia >= requirements.trivia,
      current.skills >= requirements.skills,
      current.labfree >= requirements.labfree,
    ];

    const completedCount = completed.filter(Boolean).length;
    const progressPercent = Math.round((completedCount / 4) * 100);
    const isCompleted = completedCount === 4;

    // Update progress percentage
    this.updateElementText(
      `.milestone-${milestone}-progress`,
      `${progressPercent}%`
    );

    // Update status icon
    const statusIcon = this.querySelector(`.milestone-${milestone}-status`);
    if (statusIcon) {
      if (isCompleted) {
        statusIcon.className = `fa-solid fa-check-circle text-green-400 text-sm milestone-${milestone}-status`;
        statusIcon.title = "Completed";
      } else if (progressPercent > 0) {
        statusIcon.className = `fa-solid fa-clock text-orange-400 text-sm milestone-${milestone}-status`;
        statusIcon.title = "In Progress";
      } else {
        statusIcon.className = `fa-solid fa-circle text-gray-400 text-sm milestone-${milestone}-status`;
        statusIcon.title = "Not Started";
      }
    }

    // Update progress text color
    const progressElement = this.querySelector(
      `.milestone-${milestone}-progress`
    );
    if (progressElement) {
      progressElement.className = isCompleted
        ? "text-green-400 font-bold"
        : progressPercent > 0
        ? "text-orange-400 font-bold"
        : "text-gray-400 font-bold";
    }
  },
};

// Test function for milestone functionality
(window as any).testMilestone = function () {
  const testData = {
    faciCounts: {
      faciGame: 5,
      faciTrivia: 4,
      faciSkill: 30,
      faciCompletion: 15,
    },
  };

  console.log("Testing milestone data:", testData);
  PopupUIService.updateMilestoneData(testData);
  console.log("Milestone data updated successfully!");
};

export default PopupUIService;
