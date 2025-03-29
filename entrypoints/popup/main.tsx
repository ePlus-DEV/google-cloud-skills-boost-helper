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
  elements.forEach((element) =>
    add
      ? element.classList.add(className)
      : element.classList.remove(className),
  );
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
};

const updateElements = (elements: { selector: string; value: any }[]) => {
  elements.forEach(({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value.toString();
    }
  });
};

const updateAvatar = (profileImage: string | undefined) => {
  document.querySelector("#avatar")?.setAttribute("src", profileImage || "");
};

const init = async () => {
  const localArcadeData: ArcadeData =
    (await storage.getItem("local:arcadeData")) || {};
  const { userDetails, arcadePoints } = localArcadeData || {};
  const { userName, league, points, profileImage } = Array.isArray(userDetails)
    ? userDetails[0] || {}
    : {};

  const {
    totalPoints = 0,
    gamePoints = 0,
    triviaPoints = 0,
    skillPoints = 0,
    specialPoints = 0,
  } = arcadePoints || {};

  updateElements([
    { selector: "#arcade-points", value: totalPoints },
    { selector: "#user-name", value: userName || "N/A" },
    { selector: "#league", value: league || "N/A" },
    { selector: "#total-points", value: points || 0 },
    { selector: "#game-points-count", value: gamePoints },
    { selector: "#trivia-points-count", value: triviaPoints },
    { selector: "#skill-points-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ]);

  updateAvatar(profileImage);
};

const displayUserDetails = async (data: ArcadeData) => {
  const { userDetails, arcadePoints } = data;
  const { userName, league, points, profileImage } = userDetails?.[0] || {};

  const lastUpdated = new Date().toISOString();
  await storage.setMeta("local:arcadeData", { ...data, lastUpdated });

  const {
    totalPoints = 0,
    gamePoints = 0,
    triviaPoints = 0,
    skillPoints = 0,
    specialPoints = 0,
  } = arcadePoints || {};

  updateElements([
    { selector: "#arcade-points", value: totalPoints },
    { selector: "#user-name", value: userName || "N/A" },
    { selector: "#league", value: league || "N/A" },
    { selector: "#total-points", value: points || 0 },
    { selector: "#game-points-count", value: gamePoints },
    { selector: "#trivia-points-count", value: triviaPoints },
    { selector: "#skill-points-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ]);

  updateAvatar(profileImage);
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
      await storage.setItem("local:arcadeData", response.data);
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

  init();
};

initializeEventListeners();
