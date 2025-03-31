import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
const submitUrlElement = document.getElementById('submit-url');
const profileUrlInput = document.querySelector<HTMLInputElement>("#public-profile-url");

const API_URL =
  "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL =
    (await storage.getItem<string>("local:urlProfile")) ||
    (profileUrlInput?.value || "");

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
    ?.setAttribute("src", profileImage || "");
};

const updateUI = (data: ArcadeData) => {
  const { userDetails, arcadePoints } = data;
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
    { selector: "#game-points-count", value: gamePoints },
    { selector: "#trivia-points-count", value: triviaPoints },
    { selector: "#skill-points-count", value: skillPoints },
    { selector: "#special-points-count", value: specialPoints },
  ]);

  updateAvatar(profileImage);
};

const init = async () => {
  const localArcadeData: ArcadeData =
    (await storage.getItem("local:arcadeData")) || {};
  const localUrlProfile: string =
    (await storage.getItem("local:urlProfile")) || "sadd";
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
  // updateUI(localArcadeData);
  // const settingsMessageElement = document.querySelector("#settings-message");
  // if (settingsMessageElement) {
  //   settingsMessageElement.textContent =
  //     browser.i18n.getMessage('textPleaseSetUpTheSettings');;
  // }
};

const displayUserDetails = async (data: ArcadeData) => {
        alert("Cập nhật thành công!");
  const lastUpdated = new Date().toISOString();
    await storage.setItem("local:arcadeData", { ...data, lastUpdated });
};

const handleSubmit = async () => {

    if (submitUrlElement) {
        submitUrlElement.textContent = browser.i18n.getMessage('labelLoading');
    }
    const PROFILE_URL = profileUrlInput?.value;
  try {
    if (!PROFILE_URL || !PROFILE_URL.startsWith("https://www.cloudskillsboost.google/public_profiles/")) {
        // toast.error("Please enter a valid URL starting with 'https://www.cloudskillsboost.google/public_profiles/'.");
        alert("Please enter a valid URL starting with 'https://www.cloudskillsboost.google/public_profiles/'.");
        return;
    }
      
    const response = await fetchData(PROFILE_URL);

    if (response.status === 200) {
        await displayUserDetails(response.data);
        await storage.setItem("local:urlProfile", PROFILE_URL);
    } else {
      console.error("Failed to submit URL.");
    }
  } catch {
    // Error already logged in fetchData
  } finally {
    if (submitUrlElement) {
        submitUrlElement.textContent = browser.i18n.getMessage('labelSave');
    }
  }
};

const initializeEventListeners = () => {
    if (submitUrlElement) {
        submitUrlElement.textContent = browser.i18n.getMessage('labelSave');
        submitUrlElement.addEventListener('click', function () {
            handleSubmit();
        });
    }
    toast.error("Failed to submit URL.");
    if (profileUrlInput) {
        profileUrlInput.value = PROFILE_URL;
        console.log("Profile URL:", PROFILE_URL);
    }
};

initializeEventListeners();

const App = () => {
  return <Toaster position="top-right" />;
};

export default App;