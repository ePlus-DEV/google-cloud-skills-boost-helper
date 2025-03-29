import axios from "axios";

const SPINNER_CLASS = "animate-spin";
const API_URL =
  "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL = (await storage.getItem<string>("local:urlProfile")) || "";

const toggleSpinner = (elements: NodeListOf<HTMLElement>, add: boolean) => {
  elements.forEach((element) => {
    if (add) {
      element.classList.add(SPINNER_CLASS);
    } else {
      element.classList.remove(SPINNER_CLASS);
    }
  });
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

const init = async () => {
  const localArcadeData: ArcadeData =
    (await storage.getItem("local:arcadeData")) || {};
  // const localArcadeBadges = await storage.getMeta('local:arcadebadges');
  // console.log("localArcadeData", localArcadeData);
  const { userDetails, arcadePoints, badges } = localArcadeData || {};
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

  const elements = [
    {
      selector: "#arcade-points",
      value: totalPoints || 0,
    },
    { selector: "#user-name", value: userName || "N/A" },
    { selector: "#league", value: league || "N/A" },
    { selector: "#total-points", value: points || 0 },
    { selector: "#game-points-count", value: gamePoints },
    { selector: "#trivia-points-count", value: triviaPoints },
    { selector: "#skill-points-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ];

  elements.forEach(({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value.toString();
    }
  });

  document.querySelector("#avatar")?.setAttribute("src", profileImage || "");
};

const displayUserDetails = async (data: any) => {
  const { userDetails, arcadePoints, badges } = data;
  const { userName, league, points, profileImage } = userDetails[0] || {};

  const lastUpdated = new Date().toISOString();

  await storage.setMeta("local:arcadeData", { ...data, lastUpdated });

  const {
    totalPoints = 0,
    gamePoints = 0,
    triviaPoints = 0,
    skillPoints = 0,
    specialPoints = 0,
  } = arcadePoints || {};

  const elements = [
    {
      selector: "#arcade-points",
      value: totalPoints || 0,
    },
    { selector: "#user-name", value: userName || "N/A" },
    { selector: "#league", value: league || "N/A" },
    { selector: "#total-points", value: points || 0 },
    { selector: "#game-points-count", value: gamePoints },
    { selector: "#trivia-points-count", value: triviaPoints },
    { selector: "#skill-points-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ];

  elements.forEach(({ selector, value }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value.toString();
    }
  });

  document.querySelector("#avatar")?.setAttribute("src", profileImage || "");

  //   alert(
  //     `User: ${userName}\nLeague: ${league}\nMember Since: ${memberSince}\nTotal Points: ${totalPoints}\nGame Points: ${gamePoints}\nTrivia Points: ${triviaPoints}\nSkill Points: ${skillPoints}\nSpecial Points: ${specialPoints}`,
  //   );
};

const handleSubmit = async () => {
  const refreshButtons = document.querySelectorAll(
    ".refresh-button",
  ) as NodeListOf<HTMLButtonElement>;
  const refreshIcons = document.querySelectorAll(
    ".refresh-icon",
  ) as NodeListOf<HTMLElement>;

  toggleSpinner(refreshIcons, true);
  toggleButtonState(refreshButtons, true);

  try {
    if (!PROFILE_URL) {
      console.error("PROFILE_URL is null or empty.");
      return;
    }
    const response = await fetchData(PROFILE_URL);

    if (response.status === 200) {
      displayUserDetails(response.data);
      await storage.setItem("local:arcadeData", response.data);
    } else {
      console.error("Failed to submit URL.");
    }
  } catch {
    // Error already logged in fetchData
  } finally {
    toggleSpinner(refreshIcons, false);
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
