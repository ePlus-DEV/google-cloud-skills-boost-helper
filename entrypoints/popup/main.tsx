import axios from "axios";

const SPINNER_CLASS = "animate-spin";
const API_URL =
  "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL = (await storage.getItem<string>("local:urlProfile")) || "";

type ArcadeData = {
  userDetails?: {
    userName?: string;
    league?: string;
    points?: number;
    profileImage?: string;
  }[];
  arcadePoints?: {
    totalPoints?: number;
    gamePoints?: number;
    triviaPoints?: number;
    skillPoints?: number;
    specialPoints?: number;
  };
  badges?: any;
  lastUpdated?: String;
};

const querySelector = <T extends HTMLElement>(selector: string): T | null =>
  document.querySelector(selector);

const toggleClass = (
  elements: NodeListOf<HTMLElement>,
  className: string,
  add: boolean,
) => elements.forEach((element) => element.classList.toggle(className, add));

const toggleButtonState = (
  buttons: NodeListOf<HTMLButtonElement>,
  disabled: boolean,
) => buttons.forEach((button) => (button.disabled = disabled));

const fetchData = async (url: string) => {
  try {
    return await axios.post(API_URL, { url });
  } catch (error) {
    console.error("Error submitting URL:", error);
    throw error;
  }
};

const updateElementText = (selector: string, value: any) => {
  const element = querySelector(selector);
  if (element) {
    element.textContent = value?.toString() || "N/A";
  }
};

const updateAvatar = (profileImage?: string) => {
  const avatarElement = querySelector<HTMLImageElement>("#user-avatar");
  avatarElement?.setAttribute(
    "src",
    profileImage ||
      "https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg",
  );
};

const updateProgressBar = (
  totalPoints: number,
  nextMilestonePoints: number,
) => {
  const progressBar = querySelector<HTMLDivElement>("#progress-bar");
  if (progressBar) {
    progressBar.style.width = `${(totalPoints / nextMilestonePoints) * 100}%`;
  }
};

const updateLeagueInfo = (
  currentLeague: string,
  isMaxLevel: boolean,
  nextMilestonePoints: number,
  totalPoints: number,
) => {
  updateElementText(
    "#current-level",
    `${browser.i18n.getMessage("textCurrentLevel")}: ${currentLeague}`,
  );

  updateElementText(
    "#next-level",
    isMaxLevel
      ? chrome.i18n.getMessage("textMaxLevel")
      : `${browser.i18n.getMessage("textNextLevelInPoints")}: ${
          nextMilestonePoints - totalPoints
        } ${browser.i18n.getMessage("textPoints")}`,
  );
};

const updateLastUpdated = (lastUpdated?: String) => {
  updateElementText(
    "#last-updated",
    `${browser.i18n.getMessage("labelLastUpdated")}: ${
      lastUpdated
        ? new Date(lastUpdated.toString()).toLocaleString(navigator.language)
        : "N/A"
    }`,
  );
};

const updateUI = (data: ArcadeData) => {
  const { userDetails, arcadePoints, lastUpdated, badges } = data;
  const { userName, league, points, profileImage } = userDetails?.[0] || {};
  const {
    totalPoints = 0,
    gamePoints = 0,
    triviaPoints = 0,
    skillPoints = 0,
    specialPoints = 0,
  } = arcadePoints || {};

  const elementsToUpdate = [
    { selector: "#arcade-points", value: totalPoints },
    { selector: "#user-name", value: userName },
    { selector: "#league", value: league },
    { selector: "#total-points", value: points },
    { selector: "#game-badge-count", value: gamePoints },
    { selector: "#trivia-badge-count", value: triviaPoints },
    { selector: "#skill-badge-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ];

  elementsToUpdate.forEach(({ selector, value }) =>
    updateElementText(selector, value),
  );

  updateAvatar(profileImage);

  const milestones = [
    { points: 15, league: "STANDARD" },
    { points: 30, league: "ADVANCED" },
    { points: 45, league: "PREMIUM" },
    { points: 65, league: "PREMIUM PLUS" },
  ];

  const roundedArcadePoints = Math.floor(totalPoints);
  const currentLevel =
    milestones.findIndex(
      (milestone, index) =>
        totalPoints <= milestone.points ||
        (milestones[index + 1] && totalPoints < milestones[index + 1].points),
    ) + 1 || milestones.length + 1;

  const nextMilestone =
    milestones.find((milestone) => milestone.points > roundedArcadePoints) ||
    milestones[milestones.length - 1];
  const isMaxLevel =
    nextMilestone.points === milestones[milestones.length - 1].points;
  const currentLeague = milestones[currentLevel - 1]?.league || "MAX LEVEL";

  updateLeagueInfo(
    currentLeague,
    isMaxLevel,
    nextMilestone.points,
    totalPoints,
  );
  updateProgressBar(roundedArcadePoints, nextMilestone.points);
  updateLastUpdated(lastUpdated);

  renderBadges(badges);
};

/**
 * Renders a list of badges into the activity element on the page. The badges are displayed
 * in a paginated manner, with a "Load More" button to load additional badges incrementally.
 *
 * @param {any[]} badges - An array of badge objects to be rendered. Each badge object should
 * contain the following properties:
 *   - `imageURL` (string): The URL of the badge image.
 *   - `title` (string): The title of the badge.
 *   - `dateEarned` (string): The date the badge was earned.
 *   - `points` (number): The points associated with the badge.
 *
 * The function performs the following:
 * - Clears the content of the activity element.
 * - Displays badges in groups of a fixed increment count per page.
 * - Updates the pagination information and handles the "Load More" button functionality.
 * - If no badges are available, displays a "No Data Available" message.
 *
 * Dependencies:
 * - The function relies on the `querySelector` utility to select DOM elements.
 * - The `browser.i18n.getMessage` API is used for localized text messages.
 */

const updatePaginationInfo = (currentPage: number, totalPages: number) => {
  const paginationElement = querySelector<HTMLDivElement>("#pagination-info");
  if (paginationElement) {
    paginationElement.textContent = `${browser.i18n.getMessage(
      "labelPage",
    )} ${currentPage}/${totalPages}`;
    paginationElement.classList.remove("hidden");
  }
};

const init = async () => {
  const localArcadeData: ArcadeData =
    (await storage.getItem("local:arcadeData")) || {};
  const localUrlProfile: string =
    (await storage.getItem("local:urlProfile")) || "";

  if (!localUrlProfile) {
    updateElementText(
      "#settings-message",
      browser.i18n.getMessage("textPleaseSetUpTheSettings"),
    );
    querySelector("#popup-content")?.classList.add("blur-sm");
    querySelector("#auth-screen")?.classList.remove("invisible");
  } else {
    updateUI(localArcadeData);
  }
};

const displayUserDetails = async (data: ArcadeData) => {
  const lastUpdated = new Date().toISOString();
  const updatedData = { ...data, lastUpdated };
  await storage.setItem("local:arcadeData", updatedData);
  updateUI(updatedData);
};

const handleSubmit = async () => {
  const refreshButtons = document.querySelectorAll(
    ".refresh-button",
  ) as NodeListOf<HTMLButtonElement>;
  const refreshIcons = document.querySelectorAll(
    ".refresh-icon",
  ) as NodeListOf<HTMLElement>;

  toggleClass(refreshIcons, SPINNER_CLASS, true);
  toggleButtonState(refreshButtons, true);

  try {
    if (!PROFILE_URL) {
      console.error("PROFILE_URL is null or empty.");
      return;
    }
    const response = await fetchData(PROFILE_URL);

    if (response.status === 200) {
      await displayUserDetails(response.data);
    } else {
      console.error("Failed to submit URL.");
    }
  } catch {
    // Error already logged in fetchData
  } finally {
    toggleClass(refreshIcons, SPINNER_CLASS, false);
    toggleButtonState(refreshButtons, false);
  }
};

const initializeEventListeners = () => {
  document.querySelectorAll(".refresh-button").forEach((button) => {
    button.addEventListener("click", handleSubmit);
  });

  document.querySelectorAll(".settings-button").forEach((button) => {
    button.addEventListener("click", () => {
      window.open(browser.runtime.getURL("/options.html"), "_blank");
    });
  });

  init();
};

initializeEventListeners();
