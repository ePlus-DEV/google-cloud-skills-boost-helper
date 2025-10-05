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

    // Calculate facilitator bonus points if available
    let facilitatorBonus = 0;
    if (faciCounts) {
      facilitatorBonus = this.calculateFacilitatorBonusPoints(faciCounts);
    }

    // Add bonus points to total
    const finalTotalPoints = totalPoints + facilitatorBonus;

    // Update basic info
    const updates: UIUpdateData[] = [
      { selector: "#arcade-points", value: finalTotalPoints },
      { selector: "#user-name", value: userName || "Anonymous" },
      { selector: "#league", value: league || "VIP" },
      {
        selector: "#total-points",
        value: `${points || finalTotalPoints || 0} points`,
      },
      { selector: "#game-badge-count", value: gamePoints },
      { selector: "#trivia-badge-count", value: triviaPoints },
      { selector: "#skill-badge-count", value: skillPoints },
      { selector: "#special-points-count", value: specialPoints },
    ];

    // Show detailed breakdown if facilitator bonus exists
    if (facilitatorBonus > 0) {
      const breakdownCard = this.querySelector("#points-breakdown-card");
      if (breakdownCard) {
        breakdownCard.classList.remove("hidden");

        // Update breakdown values
        this.updateElementText("#base-points", `${totalPoints} points`);
        this.updateElementText("#bonus-points", `+${facilitatorBonus} points`);
        this.updateElementText(
          "#total-combined-points",
          `${finalTotalPoints} points`,
        );
      }
    } else {
      const breakdownCard = this.querySelector("#points-breakdown-card");
      if (breakdownCard) {
        breakdownCard.classList.add("hidden");
      }
    }

    this.updateElements(updates);
    this.updateAvatar(profileImage);

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

      // Temporarily always show milestone section for testing countdown
      console.log("🔧 Force showing milestone section for testing");
      milestoneSection.classList.remove("hidden");

      /* Original logic - commented for testing
      if (currentAccount?.facilitatorProgram) {
        // Show milestone section for facilitator accounts
        milestoneSection.classList.remove("hidden");
      } else {
        // Hide milestone section for non-facilitator accounts
        milestoneSection.classList.add("hidden");
      }
      */
    } catch (error) {
      console.error("Error updating milestone section:", error);
      // Force show milestone section even on error for testing
      milestoneSection.classList.remove("hidden");
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

    // Calculate bonus breakdown
    const bonusBreakdown = this.calculateMilestoneBonusBreakdown(faciCounts);

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
          requirements,
        );
      },
    );

    // Update total bonus summary
    const totalBonus = this.calculateFacilitatorBonusPoints(faciCounts);
    this.updateElementText("#total-facilitator-bonus", `${totalBonus} points`);

    // Update milestone bonus breakdown display
    const breakdownItems = document.querySelectorAll(".breakdown-item");
    if (breakdownItems.length >= 4) {
      const milestones = ["1", "2", "3", "ultimate"];
      milestones.forEach((milestone, index) => {
        const item = breakdownItems[index];
        const pointsElement = item.querySelector(".breakdown-points");
        if (pointsElement) {
          const points =
            bonusBreakdown.milestones[
              milestone as keyof typeof bonusBreakdown.milestones
            ];
          pointsElement.textContent = points > 0 ? `+${points}` : `+0`;

          // Update styling based on earned status
          if (points > 0) {
            pointsElement.classList.remove("text-gray-400");
            pointsElement.classList.add("text-green-600", "font-semibold");
          } else {
            pointsElement.classList.remove("text-green-600", "font-semibold");
            pointsElement.classList.add("text-gray-400");
          }
        }
      });
    }

    // Update breakdown total
    const breakdownTotal = document.querySelector("#breakdown-total");
    if (breakdownTotal) {
      breakdownTotal.textContent = `+${bonusBreakdown.total}`;
    }

    // Setup milestone card click handlers
    this.setupMilestoneCardHandlers();

    // Setup breakdown card toggle
    this.setupBreakdownToggle();
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

  /**
   * Calculate bonus points from completed facilitator milestones
   */
  calculateFacilitatorBonusPoints(faciCounts: any): number {
    if (!faciCounts) return 0;

    const {
      faciGame = 0,
      faciTrivia = 0,
      faciSkill = 0,
      faciCompletion = 0,
    } = faciCounts;

    const milestonePoints = {
      1: 2, // +2 Bonus Points
      2: 8, // +8 Bonus Points
      3: 15, // +15 Bonus Points
      ultimate: 25, // +25 Bonus Points
    };

    const currentStats = {
      games: faciGame,
      trivia: faciTrivia,
      skills: faciSkill,
      labfree: faciCompletion,
    };

    let highestCompletedMilestone = 0;
    let highestBonusPoints = 0;

    // Check each milestone completion to find the highest one
    Object.entries(this.MILESTONE_REQUIREMENTS).forEach(
      ([milestone, requirements]) => {
        const isCompleted =
          currentStats.games >= requirements.games &&
          currentStats.trivia >= requirements.trivia &&
          currentStats.skills >= requirements.skills &&
          currentStats.labfree >= requirements.labfree;

        console.log(`Milestone ${milestone} check:`, {
          current: currentStats,
          required: requirements,
          isCompleted,
        });

        if (isCompleted) {
          const points =
            milestonePoints[milestone as keyof typeof milestonePoints] || 0;

          // Keep track of highest milestone completed
          const milestoneNum =
            milestone === "ultimate" ? 4 : parseInt(milestone);
          if (milestoneNum > highestCompletedMilestone) {
            highestCompletedMilestone = milestoneNum;
            highestBonusPoints = points;
          }

          console.log(`✅ Milestone ${milestone} COMPLETED! Points: ${points}`);
        } else {
          console.log(`❌ Milestone ${milestone} NOT completed`);
        }
      },
    );

    console.log(`💰 BONUS CALCULATION SUMMARY:`);
    console.log(
      `   Highest Completed Milestone: ${
        highestCompletedMilestone === 4
          ? "Ultimate"
          : highestCompletedMilestone || "None"
      }`,
    );
    console.log(`   Total Facilitator Bonus Points: ${highestBonusPoints}`);
    console.log(
      `   Logic: Only award points for the HIGHEST milestone reached`,
    );

    return highestBonusPoints;
  },

  /**
   * Calculate detailed milestone bonus breakdown for UI display
   */
  calculateMilestoneBonusBreakdown(faciCounts: any): any {
    if (!faciCounts) {
      return {
        milestones: { 1: 0, 2: 0, 3: 0, ultimate: 0 },
        total: 0,
        highestCompleted: 0,
      };
    }

    const {
      faciGame = 0,
      faciTrivia = 0,
      faciSkill = 0,
      faciCompletion = 0,
    } = faciCounts;

    const milestonePoints = {
      1: 2, // +2 Bonus Points
      2: 8, // +8 Bonus Points
      3: 15, // +15 Bonus Points
      ultimate: 25, // +25 Bonus Points
    };

    const milestoneBonus = { 1: 0, 2: 0, 3: 0, ultimate: 0 };
    const currentStats = {
      games: faciGame,
      trivia: faciTrivia,
      skills: faciSkill,
      labfree: faciCompletion,
    };

    let highestCompletedMilestone = 0;
    let highestBonusPoints = 0;

    // Check each milestone completion to find the highest one
    Object.entries(this.MILESTONE_REQUIREMENTS).forEach(
      ([milestone, requirements]) => {
        const isCompleted =
          currentStats.games >= requirements.games &&
          currentStats.trivia >= requirements.trivia &&
          currentStats.skills >= requirements.skills &&
          currentStats.labfree >= requirements.labfree;

        if (isCompleted) {
          const points =
            milestonePoints[milestone as keyof typeof milestonePoints] || 0;

          // Keep track of highest milestone completed
          const milestoneNum =
            milestone === "ultimate" ? 4 : parseInt(milestone);
          if (milestoneNum > highestCompletedMilestone) {
            highestCompletedMilestone = milestoneNum;
            highestBonusPoints = points;

            // Reset all bonuses and set only the highest one
            Object.keys(milestoneBonus).forEach((key) => {
              milestoneBonus[key as keyof typeof milestoneBonus] = 0;
            });
            milestoneBonus[milestone as keyof typeof milestoneBonus] = points;
          }
        }
      },
    );

    return {
      milestones: milestoneBonus,
      total: highestBonusPoints,
      highestCompleted: highestCompletedMilestone,
    };
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

    // Update progress percentage with tooltip showing alternatives
    const progressElement = this.querySelector(
      `.milestone-${milestone}-progress`,
    );
    if (progressElement) {
      progressElement.textContent = `${progressPercent}%`;

      // Add tooltip with alternative calculations
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
    }

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

    // Update progress text color and add tooltip
    if (progressElement) {
      progressElement.className = isCompleted
        ? "text-green-400 font-bold"
        : progressPercent > 0
          ? "text-orange-400 font-bold"
          : "text-gray-400 font-bold";
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

    const milestoneSection = this.querySelector("#milestones-section");
    if (milestoneSection) {
      const countdownCard = milestoneSection.querySelector(".countdown-card");
      if (countdownCard) {
        countdownCard.classList.add("hidden");
      }
    }

    console.log("⏰ Countdown display hidden");
  },

  /**
   * Show countdown display when enabled
   */
  showCountdownDisplay(): void {
    const countdownSection = this.querySelector("#countdown-container");
    if (countdownSection) {
      countdownSection.classList.remove("hidden");
    }

    const milestoneSection = this.querySelector("#milestones-section");
    if (milestoneSection) {
      const countdownCard = milestoneSection.querySelector(".countdown-card");
      if (countdownCard) {
        countdownCard.classList.remove("hidden");
      }
    }

    console.log("⏰ Countdown display shown");
  },

  /**
   * Start facilitator program countdown timer with Firebase Remote Config
   */
  async startFacilitatorCountdown(): Promise<void> {
    console.log("🕐 Starting Facilitator Countdown Timer...");

    // Import Firebase service dynamically to avoid circular dependency
    let deadline: Date;

    try {
      const firebaseService = (await import("./firebaseService")).default;

      // Initialize Firebase if not already done
      if (!firebaseService.isInitialized()) {
        await firebaseService.initialize();
      }

      // Get countdown deadline from Remote Config
      const countdownDeadline = firebaseService.getCountdownDeadline();
      const countdownTimezone = firebaseService.getCountdownTimezone();
      const isEnabled = firebaseService.isCountdownEnabled();

      if (!isEnabled) {
        console.log("⏰ Countdown is disabled via Remote Config");
        this.hideCountdownDisplay();
        return;
      }

      // Show countdown display if enabled
      this.showCountdownDisplay();

      deadline = new Date(countdownDeadline);
      console.log("📅 Deadline from Remote Config:", deadline.toLocaleString());
      console.log("🌍 Timezone:", countdownTimezone);
    } catch (error) {
      console.error(
        "❌ Failed to load Remote Config, using default deadline:",
        error,
      );
      // Fallback to hardcoded deadline if Firebase fails
      deadline = new Date("2025-10-14T23:59:59+05:30");
      console.log("📅 Fallback deadline:", deadline.toLocaleString());

      // Show countdown display on fallback
      this.showCountdownDisplay();
    }

    let countdownLogged = false;

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();

      if (timeDiff <= 0) {
        // Program has ended
        console.log("⏰ Program has ended");
        this.updateElementText("#countdown-days", "00");
        this.updateElementText("#countdown-hours", "00");
        this.updateElementText("#countdown-minutes", "00");
        this.updateElementText("#countdown-seconds", "00");

        // Show expired message
        const countdownContainer =
          this.querySelector("#countdown-days")?.parentElement?.parentElement;
        if (countdownContainer) {
          countdownContainer.innerHTML = `
            <div class="text-center text-red-400">
              <i class="fa-solid fa-clock-o text-2xl mb-2"></i>
              <div class="font-bold">Program Ended</div>
              <div class="text-xs text-red-300/70">Facilitator program deadline has passed</div>
            </div>
          `;
        }
        return;
      }

      // Calculate time components
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      // Update countdown display
      const formattedDays = days.toString().padStart(2, "0");
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      this.updateElementText("#countdown-days", formattedDays);
      this.updateElementText("#countdown-hours", formattedHours);
      this.updateElementText("#countdown-minutes", formattedMinutes);
      this.updateElementText("#countdown-seconds", formattedSeconds);

      // Log first update only
      if (!countdownLogged) {
        console.log(
          `⏱️ Time remaining: ${formattedDays}d ${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`,
        );
        countdownLogged = true;
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    setInterval(updateCountdown, 1000);
    console.log("✅ Countdown timer started");
  },
};

// Test function for milestone functionality
(window as any).testMilestone = function () {
  const testData = {
    faciCounts: {
      faciGame: 12, // Complete all milestones
      faciTrivia: 8,
      faciSkill: 52,
      faciCompletion: 24,
    },
  };

  console.log("Testing milestone data:", testData);
  PopupUIService.updateMilestoneData(testData);

  // Test bonus calculation
  const bonusPoints = PopupUIService.calculateFacilitatorBonusPoints(
    testData.faciCounts,
  );
  console.log("🎯 Facilitator Bonus Breakdown:");
  console.log("  - Milestone 1: +2 points ✅");
  console.log("  - Milestone 2: +8 points ✅");
  console.log("  - Milestone 3: +15 points ✅");
  console.log("  - Ultimate: +25 points ✅");
  console.log(`  📊 Total bonus: ${bonusPoints} points`);

  console.log(
    "✅ All milestones completed! Bonus will be added to arcade total.",
  );
};

// Test function for partial completion
(window as any).testMilestonePartial = function () {
  const testData = {
    faciCounts: {
      faciGame: 8, // Only Milestone 1 & 2 complete
      faciTrivia: 6,
      faciSkill: 28,
      faciCompletion: 12,
    },
  };

  console.log("Testing partial milestone data:", testData);
  PopupUIService.updateMilestoneData(testData);

  // Test bonus calculation
  const bonusPoints = PopupUIService.calculateFacilitatorBonusPoints(
    testData.faciCounts,
  );
  console.log("🎯 Facilitator Bonus Breakdown:");
  console.log("  - Milestone 1: +2 points ✅");
  console.log("  - Milestone 2: +8 points ✅");
  console.log("  - Milestone 3: +15 points ❌");
  console.log("  - Ultimate: +25 points ❌");
  console.log(`  📊 Total bonus: ${bonusPoints} points`);

  console.log("⚡ Partial completion! Bonus will be added to arcade total.");
};

// Test function with actual failing case
(window as any).testMilestoneRealistic = function () {
  const testData = {
    faciCounts: {
      faciGame: 5, // NOT enough for any milestone (need 6 for milestone 1)
      faciTrivia: 3, // NOT enough for any milestone (need 5 for milestone 1)
      faciSkill: 10, // NOT enough for any milestone (need 14 for milestone 1)
      faciCompletion: 4, // NOT enough for any milestone (need 6 for milestone 1)
    },
  };

  console.log("Testing realistic (low) milestone data:", testData);
  PopupUIService.updateMilestoneData(testData.faciCounts);

  // Test bonus calculation
  const bonusPoints = PopupUIService.calculateFacilitatorBonusPoints(
    testData.faciCounts,
  );
  console.log("🎯 Facilitator Bonus Breakdown:");
  console.log(
    "  - Milestone 1: +2 points ❌ (need 6 games, 5 trivia, 14 skills, 6 labfree)",
  );
  console.log("  - Milestone 2: +8 points ❌");
  console.log("  - Milestone 3: +15 points ❌");
  console.log("  - Ultimate: +25 points ❌");
  console.log(`  📊 Total bonus: ${bonusPoints} points (should be 0)`);

  console.log("❌ No milestones completed! No bonus points awarded.");
};

// Test function for user's specific case (11/12 games)
(window as any).testUserCase = function () {
  const testData = {
    faciCounts: {
      faciGame: 11, // 11/12 - NOT enough for Ultimate (need 12)
      faciTrivia: 8, // 8/8 - Complete ✓
      faciSkill: 52, // 52/52 - Complete ✓
      faciCompletion: 24, // 24/24 - Complete ✓
    },
  };

  console.log("🔍 Testing User's Specific Case:");
  console.log("Data:", testData.faciCounts);
  console.log(
    "Ultimate Requirements: games: 12, trivia: 8, skills: 52, labfree: 24",
  );
  console.log("");

  PopupUIService.updateMilestoneData(testData.faciCounts);

  const bonusPoints = PopupUIService.calculateFacilitatorBonusPoints(
    testData.faciCounts,
  );

  console.log("");
  console.log("🎯 EXPECTED RESULT:");
  console.log("   Progress: ~99% (proportional: 95/96 total points)");
  console.log("   Bonus Points: 0 (because games 11 < 12 required)");
  console.log("   Status: NOT completed until games >= 12");
  console.log("");
  console.log(`📊 ACTUAL RESULT: ${bonusPoints} bonus points`);

  if (bonusPoints === 0) {
    console.log("✅ CORRECT! No bonus awarded until ALL requirements met.");
  } else {
    console.log(
      "❌ ERROR! Bonus should be 0 because games requirement not met.",
    );
  }
};

// Test function to compare different progress calculation methods
(window as any).testProgressMethods = function () {
  const testData = {
    faciCounts: {
      faciGame: 11, // Almost complete Ultimate milestone
      faciTrivia: 8, // Complete
      faciSkill: 52, // Complete
      faciCompletion: 24, // Complete
    },
  };

  console.log("🧮 Testing Different Progress Calculation Methods:");
  console.log("Data:", testData.faciCounts);
  console.log(
    "Ultimate Requirements: games: 12, trivia: 8, skills: 52, labfree: 24",
  );
  console.log("");

  const requirements = { games: 12, trivia: 8, skills: 52, labfree: 24 };
  const current = {
    games: testData.faciCounts.faciGame,
    trivia: testData.faciCounts.faciTrivia,
    skills: testData.faciCounts.faciSkill,
    labfree: testData.faciCounts.faciCompletion,
  };

  const methods = PopupUIService.calculateProgressMethods(
    current,
    requirements,
  );

  console.log("📊 Progress Calculation Results:");
  console.log(`1. Binary Completion: ${methods.binary}% ★ ACTIVE`);
  console.log(`   └─ 3 completed requirements / 4 total = 75%`);

  console.log(`2. Weighted Average: ${methods.weighted}%`);
  console.log(`   └─ (91.67% + 100% + 100% + 100%) / 4 = 97.92%`);

  console.log(`3. Proportional Total: ${methods.proportional}%`);
  console.log(`   └─ (11+8+52+24) / (12+8+52+24) = 95/96 = 98.96%`);

  console.log(`4. Minimum Progress: ${methods.minimum}%`);
  console.log(`   └─ min(91.67%, 100%, 100%, 100%) = 91.67%`);

  console.log("");
  console.log("📈 Individual Progress:");
  console.log(`   Games: ${methods.details.gameProgress}% (11/12)`);
  console.log(`   Trivia: ${methods.details.triviaProgress}% (8/8)`);
  console.log(`   Skills: ${methods.details.skillProgress}% (52/52)`);
  console.log(`   Lab-free: ${methods.details.labfreeProgress}% (24/24)`);

  console.log("");
  console.log("💡 Which method do you prefer?");
  console.log("   - Binary: Shows completion status clearly");
  console.log("   - Weighted: Shows actual progress more accurately");
  console.log("   - Proportional: Based on total points earned");
  console.log("   - Minimum: Conservative, shows bottleneck");
};

// Test function for progressive milestone completion
(window as any).testProgressiveMilestones = function () {
  console.log("🎯 Testing Progressive Milestone Completion:");
  console.log("");

  // Test Case 1: Only Milestone 1 completed
  console.log("📍 TEST CASE 1: Only Milestone 1 should be completed");
  const case1 = {
    faciCounts: {
      faciGame: 6, // Exact requirement for Milestone 1
      faciTrivia: 5, // Exact requirement for Milestone 1
      faciSkill: 14, // Exact requirement for Milestone 1
      faciCompletion: 6, // Exact requirement for Milestone 1
    },
  };
  console.log("Data:", case1.faciCounts);
  let bonus1 = PopupUIService.calculateFacilitatorBonusPoints(case1.faciCounts);
  console.log(
    `Expected: 2 points (only Milestone 1), Actual: ${bonus1} points`,
  );
  console.log("");

  // Test Case 2: Milestone 1 + 2 completed
  console.log("📍 TEST CASE 2: Milestone 1 + 2 should be completed");
  const case2 = {
    faciCounts: {
      faciGame: 8, // Requirement for Milestone 2
      faciTrivia: 6, // Requirement for Milestone 2
      faciSkill: 28, // Requirement for Milestone 2
      faciCompletion: 12, // Requirement for Milestone 2
    },
  };
  console.log("Data:", case2.faciCounts);
  let bonus2 = PopupUIService.calculateFacilitatorBonusPoints(case2.faciCounts);
  console.log(`Expected: 10 points (2+8), Actual: ${bonus2} points`);
  console.log("");

  // Test Case 3: Almost complete Milestone 1 (missing 1 game)
  console.log("📍 TEST CASE 3: Almost Milestone 1 (missing 1 game)");
  const case3 = {
    faciCounts: {
      faciGame: 5, // 1 short for Milestone 1 (need 6)
      faciTrivia: 5, // Complete for Milestone 1
      faciSkill: 14, // Complete for Milestone 1
      faciCompletion: 6, // Complete for Milestone 1
    },
  };
  console.log("Data:", case3.faciCounts);
  let bonus3 = PopupUIService.calculateFacilitatorBonusPoints(case3.faciCounts);
  console.log(`Expected: 0 points (not complete), Actual: ${bonus3} points`);
  console.log("");

  console.log("💡 Progressive Logic Explanation:");
  console.log("   ✅ Milestone 1 (6/5/14/6): +2 points");
  console.log("   ✅ Milestone 2 (8/6/28/12): +2+8 = 10 points total");
  console.log("   ✅ Milestone 3 (10/7/38/18): +2+8+15 = 25 points total");
  console.log("   ✅ Ultimate (12/8/52/24): +2+8+15+25 = 50 points total");
  console.log("");
  console.log("🔍 Current Logic: Each milestone checked INDEPENDENTLY");
  console.log(
    "   If you have 8/6/28/12, you get bonus for BOTH Milestone 1 AND 2",
  );
};

// CRITICAL: Test function for user's EXACT issue (11/12 games = shouldn't get 25 points)
(window as any).testUserExactIssue = function () {
  console.log("🚨 TESTING USER'S EXACT ISSUE:");
  console.log(
    "User reported: 11/12 games but getting 25 points Ultimate milestone",
  );
  console.log("Expected: Should get 0 points because games 11 < 12 required");
  console.log("");

  const problemData = {
    faciCounts: {
      faciGame: 11, // 11 < 12 = FALSE ❌
      faciTrivia: 8, // 8 >= 8 = TRUE ✅
      faciSkill: 52, // 52 >= 52 = TRUE ✅
      faciCompletion: 24, // 24 >= 24 = TRUE ✅
    },
  };

  console.log("Problem Data:", problemData.faciCounts);
  console.log(
    "Ultimate Requirements: {games: 12, trivia: 8, skills: 52, labfree: 24}",
  );
  console.log("");

  // Test each requirement manually
  console.log("Manual Check:");
  console.log(
    `  games: ${problemData.faciCounts.faciGame} >= 12 = ${
      problemData.faciCounts.faciGame >= 12
    } ❌`,
  );
  console.log(
    `  trivia: ${problemData.faciCounts.faciTrivia} >= 8 = ${
      problemData.faciCounts.faciTrivia >= 8
    } ✅`,
  );
  console.log(
    `  skills: ${problemData.faciCounts.faciSkill} >= 52 = ${
      problemData.faciCounts.faciSkill >= 52
    } ✅`,
  );
  console.log(
    `  labfree: ${problemData.faciCounts.faciCompletion} >= 24 = ${
      problemData.faciCounts.faciCompletion >= 24
    } ✅`,
  );
  console.log("");

  // Should be FALSE because games requirement not met
  const shouldBeCompleted =
    problemData.faciCounts.faciGame >= 12 &&
    problemData.faciCounts.faciTrivia >= 8 &&
    problemData.faciCounts.faciSkill >= 52 &&
    problemData.faciCounts.faciCompletion >= 24;
  console.log(
    `Manual isCompleted calculation: ${shouldBeCompleted} (should be FALSE)`,
  );
  console.log("");

  // Now test actual function
  const actualBonus = PopupUIService.calculateFacilitatorBonusPoints(
    problemData.faciCounts,
  );
  console.log(`ACTUAL FUNCTION RESULT: ${actualBonus} points`);
  console.log("");

  if (actualBonus === 0) {
    console.log(
      "✅ CORRECT! Function working properly - no bonus for incomplete milestone",
    );
  } else {
    console.log("❌ BUG FOUND! Function incorrectly awarding bonus points");
    console.log(
      "   Check console logs above to see which milestone is incorrectly passing",
    );
  }

  console.log("");
  console.log("🔍 If bug found, check:");
  console.log("   1. Are requirements correct in MILESTONE_REQUIREMENTS?");
  console.log(
    "   2. Is the actual test data different from what user reported?",
  );
  console.log(
    "   3. Is there a logic error in calculateFacilitatorBonusPoints?",
  );
  console.log("");
  console.log(
    "💡 IMPORTANT: 25 points might be CORRECT if user completed Milestone 1+2+3:",
  );
  console.log("   Milestone 1 (6/5/14/6): +2 points ✅");
  console.log("   Milestone 2 (8/6/28/12): +8 points ✅");
  console.log("   Milestone 3 (10/7/38/18): +15 points ✅");
  console.log("   Ultimate (12/8/52/24): +0 points ❌ (games 11 < 12)");
  console.log("   Total: 2+8+15 = 25 points");
};

/**
 * Test milestone bonus breakdown display (run in console)
 */
function testMilestoneBreakdown() {
  console.log("🧪 Testing Milestone Bonus Breakdown (NEW LOGIC)...");

  // Test case: User with 11/12 games
  const testData = {
    faciCounts: {
      faciGame: 11, // 11/12 games (not ultimate yet)
      faciTrivia: 8, // 8/8 trivia (completed all)
      faciSkill: 52, // 52/52 skills (completed all)
      faciCompletion: 24, // 24/24 lab-free (completed all)
    },
  };

  console.log("📊 Test Data:", testData.faciCounts);

  // Calculate breakdown
  const breakdown = PopupUIService.calculateMilestoneBonusBreakdown(
    testData.faciCounts,
  );
  console.log("💰 Bonus Breakdown:", breakdown);

  // NEW LOGIC: Only highest milestone gets points
  console.log("📋 Expected Breakdown (NEW LOGIC):");
  console.log("  Milestone 1: +0 points (superseded by higher milestone)");
  console.log("  Milestone 2: +0 points (superseded by higher milestone)");
  console.log("  Milestone 3: +15 points ✅ (HIGHEST COMPLETED)");
  console.log("  Ultimate: +0 points (11/12 games - not completed)");
  console.log("  Total: +15 points (only highest milestone counts)");

  // Update UI
  PopupUIService.updateMilestoneData(testData.faciCounts);

  console.log("✅ Breakdown UI updated!");
  console.log("👀 Check the 'Points Breakdown' card for detailed display");
}

/**
 * Test countdown display (run in console)
 */
function testCountdown() {
  console.log("🧪 Testing Facilitator Countdown...");

  // Force show milestone section
  const milestoneSection = document.querySelector("#milestones-section");
  if (milestoneSection) {
    milestoneSection.classList.remove("hidden");
    console.log("✅ Milestone section shown");
  } else {
    console.log("❌ Milestone section not found");
    return;
  }

  // Start countdown
  PopupUIService.startFacilitatorCountdown();
  console.log("✅ Countdown started");

  // Check if countdown elements exist
  const countdownElements = [
    "#countdown-days",
    "#countdown-hours",
    "#countdown-minutes",
    "#countdown-seconds",
  ];

  countdownElements.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ ${selector} found:`, element.textContent);
    } else {
      console.log(`❌ ${selector} not found`);
    }
  });
}

/**
 * Force show countdown for testing (run in console)
 */
function showCountdown() {
  console.log("🧪 Force showing countdown...");

  // Force show milestone section
  const milestoneSection = document.querySelector("#milestones-section");
  if (milestoneSection) {
    milestoneSection.classList.remove("hidden");
    console.log("✅ Milestone section shown");
  } else {
    console.log("❌ Milestone section not found");
    return;
  }

  // Start countdown
  PopupUIService.startFacilitatorCountdown();
  console.log("✅ Countdown started");

  console.log("👀 Check the popup for countdown display");
}

export default PopupUIService;
