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
  lastUpdated?: Date;
};

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

const updateElements = (elements: { selector: string; value: any }[]) => {
  elements.forEach(({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value?.toString() || "N/A";
    }
  });
};

const updateAvatar = (profileImage?: string) => {
  const avatarElement = document.querySelector("#user-avatar");
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
  const progressBar = document.querySelector("#progress-bar") as HTMLDivElement;
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
  const leagueElement = document.querySelector(
    "#current-level",
  ) as HTMLSpanElement;
  if (leagueElement) {
    leagueElement.textContent = `${browser.i18n.getMessage(
      "textCurrentLevel",
    )}: ${currentLeague}`;
  }

  const nextLevelElement = document.querySelector(
    "#next-level",
  ) as HTMLSpanElement;
  if (nextLevelElement) {
    nextLevelElement.textContent = isMaxLevel
      ? chrome.i18n.getMessage("textMaxLevel")
      : `${browser.i18n.getMessage("textNextLevelInPoints")}: ${
          nextMilestonePoints - totalPoints
        } ${browser.i18n.getMessage("textPoints")}`;
  }
};

const updateLastUpdated = (lastUpdated?: Date) => {
  const lastUpdatedElement = document.querySelector(
    "#last-updated",
  ) as HTMLSpanElement;
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = `${browser.i18n.getMessage(
      "labelLastUpdated",
    )}: ${
      lastUpdated
        ? new Date(lastUpdated).toLocaleString(navigator.language)
        : "N/A"
    }`;
  }
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

  updateElements([
    { selector: "#arcade-points", value: totalPoints },
    { selector: "#user-name", value: userName },
    { selector: "#league", value: league },
    { selector: "#total-points", value: points },
    { selector: "#game-badge-count", value: gamePoints },
    { selector: "#trivia-badge-count", value: triviaPoints },
    { selector: "#skill-badge-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ]);

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

  const activityElement = document.querySelector("#activity-list");

  if (activityElement) {

    activityElement.innerHTML = "";
    
    if (badges && badges.length > 0) {

      interface Badge {
        imageURL: string;
        title: string;
        dateEarned: string;
        points: number;
      }

      badges.forEach((badge: Badge) => {
        const badgeContainer = document.createElement("div");
        badgeContainer.classList.add(
          "bg-white/10",
          "backdrop-blur-md",
          "rounded-xl",
          "p-3",
          "hover:bg-white/20",
          "transition-colors",
          "duration-300",
          "relative",
          "overflow-hidden",
          "group",
        );

        const gradientOverlay = document.createElement("div");
        gradientOverlay.classList.add(
          "absolute",
          "inset-0",
          "bg-gradient-to-br",
          "from-blue-500",
          "to-indigo-500",
          "opacity-0",
          "group-hover:opacity-20",
          "transition-opacity",
          "duration-300",
        );
        badgeContainer.appendChild(gradientOverlay);

        const badgeContent = document.createElement("div");
        badgeContent.classList.add("flex", "justify-between", "items-center");

        const badgeInfo = document.createElement("div");
        badgeInfo.classList.add("flex", "items-center");

        const badgeImage = document.createElement("img");
        badgeImage.src = badge.imageURL;
        badgeImage.alt = badge.title;
        badgeImage.classList.add(
          "h-8",
          "w-8",
          "rounded-full",
          "border-2",
          "border-white/50",
        );

        const badgeDetails = document.createElement("div");
        badgeDetails.classList.add("ml-3");

        const badgeTitle = document.createElement("div");
        badgeTitle.textContent = badge.title;
        badgeTitle.classList.add("text-white", "font-bold");

        const badgeDate = document.createElement("div");
        badgeDate.textContent = badge.dateEarned;
        badgeDate.classList.add("text-sm", "text-gray-300");

        badgeDetails.appendChild(badgeTitle);
        badgeDetails.appendChild(badgeDate);

        badgeInfo.appendChild(badgeImage);
        badgeInfo.appendChild(badgeDetails);

        const badgePoints = document.createElement("div");
        badgePoints.textContent = `${badge.points} ${browser.i18n.getMessage(
          "textPoints",
        )}`;
        badgePoints.classList.add("text-sm", "text-white");

        badgeContent.appendChild(badgeInfo);
        badgeContent.appendChild(badgePoints);

        badgeContainer.appendChild(badgeContent);

        activityElement.appendChild(badgeContainer);
      });
    } else {
      const noDataMessage = document.createElement("div");
      noDataMessage.classList.add(
        "text-center",
        "bg-gradient-to-r",
        "from-gray-800",
        "via-gray-900",
        "to-black",
        "py-4",
        "px-6",
        "rounded-xl",
        "shadow-sm",
      );

      const noDataText = document.createElement("span");
      noDataText.textContent = browser.i18n.getMessage("messageNoDataAvailable");
      noDataText.classList.add("text-gray-400", "font-medium");

      noDataMessage.appendChild(noDataText);
      activityElement.appendChild(noDataMessage);
    }
  }

};

const init = async () => {
  const localArcadeData: ArcadeData =
    (await storage.getItem("local:arcadeData")) || {};
  const localUrlProfile: string =
    (await storage.getItem("local:urlProfile")) || "";

  if (!localUrlProfile) {
    const settingsMessageElement = document.querySelector("#settings-message");
    if (settingsMessageElement) {
      settingsMessageElement.textContent = browser.i18n.getMessage(
        "textPleaseSetUpTheSettings",
      );
    }
    document.querySelector("#popup-content")?.classList.add("blur-sm");
    document.querySelector("#auth-screen")?.classList.remove("invisible");
  } else {
    updateUI(localArcadeData);
  }
};

const displayUserDetails = async (data: ArcadeData) => {
  const lastUpdated = new Date();
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
