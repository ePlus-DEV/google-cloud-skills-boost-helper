import axios from "axios";

const SPINNER_CLASS = "animate-spin";
const API_URL =
  "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL = (await storage.getItem<string>("local:urlProfile")) || "";

const toggleClass = (
  elements: NodeListOf<HTMLElement>,
  className: string,
  add: boolean,
) => {
  elements.forEach((element) => element.classList.toggle(className, add));
};

const toggleButtonState = (
  buttons: NodeListOf<HTMLButtonElement>,
  disabled: boolean,
) => {
  buttons.forEach((button) => (button.disabled = disabled));
};

const fetchData = async (url: string) => {
  try {
    return await axios.post(API_URL, { url });
  } catch (error) {
    console.error("Error submitting URL:", error);
    throw error;
  }
};

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

const updateElements = (elements: { selector: string; value: any }[]) => {
  elements.forEach(({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value?.toString() || "N/A";
    }
  });
};

const updateAvatar = (profileImage?: string) => {
  document
    .querySelector("#user-avatar")
    ?.setAttribute("src", profileImage || "https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg");
};

const updateUI = (data: ArcadeData) => {
  const { userDetails, arcadePoints, lastUpdated } = data;
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

  const lastUpdatedElement = document.querySelector(
    "#last-updated",
  ) as HTMLSpanElement;
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent =
      `${browser.i18n.getMessage("labelLastUpdated")}: ${lastUpdated ? new Date(lastUpdated).toLocaleString(navigator.language) : "N/A"}`;
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
