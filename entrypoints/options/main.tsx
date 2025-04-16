import axios from "axios";
import { UAParser } from "ua-parser-js";

const submitUrlElement = document.getElementById("submit-url");
const profileUrlInput = document.querySelector<HTMLInputElement>(
  "#public-profile-url",
);
const querySelector = <T extends HTMLElement>(selector: string): T | null =>
  document.querySelector(selector);

/**
 * Asynchronously initializes and retrieves the profile URL.
 *
 * This function attempts to retrieve the profile URL from local storage using the key
 * "local:urlProfile". If no value is found in storage, it falls back to the value of
 * the `profileUrlInput` element (if available). If neither source provides a value,
 * it defaults to an empty string.
 *
 * @returns {Promise<string>} A promise that resolves to the profile URL as a string.
 */
const initializeProfileUrl = async (): Promise<string> => {
  const profileUrl =
    (await storage.getItem<string>("local:urlProfile")) ||
    profileUrlInput?.value ||
    "";
  return profileUrl;
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
  lastUpdated?: string;
};

const fetchData = async (url: string) => {
  try {
    return await axios.post(import.meta.env.WXT_ARCADE_POINT_URL, { url });
  } catch (error) {
    console.error("Error submitting URL:", error);
    throw error;
  }
};

const showMessage = (
  selector: string,
  message: string,
  classes: string[],
  timeout = 6000,
) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = message;
    element.classList.remove("hidden");
    element.classList.add(...classes);
    setTimeout(() => element.classList.add("hidden"), timeout);
  }
};

const displayUserDetails = async (data: ArcadeData) => {
  showMessage(
    "#success-message",
    browser.i18n.getMessage("successSettingsSaved"),
    ["text-green-500", "font-bold", "mt-2", "animate-pulse"],
  );
  const lastUpdated = new Date().toISOString();
  const updatedData = { ...data, lastUpdated };
  await storage.setItem("local:arcadeData", updatedData);
  updateUI(updatedData);
};

const handleSubmit = async () => {
  if (submitUrlElement) {
    submitUrlElement.textContent = browser.i18n.getMessage("labelLoading");
  }

  const profileUrl = profileUrlInput?.value;
  if (
    !profileUrl ||
    !profileUrl.startsWith(
      "https://www.cloudskillsboost.google/public_profiles/",
    )
  ) {
    showMessage("#error-message", browser.i18n.getMessage("errorInvalidUrl"), [
      "text-red-500",
      "font-bold",
      "mt-2",
      "animate-pulse",
    ]);
    return;
  }

  try {
    const response = await fetchData(profileUrl);
    if (response.status === 200) {
      await displayUserDetails(response.data);
      await storage.setItem("local:urlProfile", profileUrl);
    } else {
      console.error("Failed to submit URL.");
    }
  } catch {
    // Error already logged in fetchData
  } finally {
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    }
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

const updateUI = (data: ArcadeData) => {
  const { userDetails } = data;
  const { userName, league, profileImage } = userDetails?.[0] || {};

  const elementsToUpdate = [
    { selector: "#user-name", value: userName },
    { selector: "#league", value: league },
  ];

  elementsToUpdate.forEach(({ selector, value }) =>
    updateElementText(selector, value),
  );

  updateAvatar(profileImage);
  const arcadePointsElement = document.querySelector("#arcade-points");
  if (arcadePointsElement) {
    arcadePointsElement.classList.remove("hidden");
  }
};

const initializeEventListeners = () => {
  if (submitUrlElement) {
    submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    submitUrlElement.addEventListener("click", handleSubmit);
  }

  initializeProfileUrl().then(async (profileUrl) => {
    if (profileUrlInput) {
      profileUrlInput.value = profileUrl;
      const arcadeData = await storage.getItem<ArcadeData>("local:arcadeData");
      const arcadePointsElement = document.querySelector("#arcade-points");
      if (arcadeData) {
        updateUI(arcadeData);
        if (arcadePointsElement) {
          arcadePointsElement.classList.remove("hidden");
        }
      } else {
        if (arcadePointsElement) {
          arcadePointsElement.classList.add("hidden");
        }
        console.warn("No arcade data found in storage.");
      }
    }
  });

  const manifest = browser.runtime.getManifest();
  const version = manifest.version;
  const versionElement = document.querySelector("#version-number");
  if (versionElement) {
    versionElement.textContent = `v${version}`;
  }

  const parser = new UAParser();
  const browserName = parser.getBrowser().name;

  const badgeSelectors: Record<string, string> = {
    Chrome: "#chrome-web-store-badge",
    Firefox: "#firefox-addon-store",
  };

  const badgeSelector = badgeSelectors[browserName || ""];
  if (badgeSelector) {
    document.querySelector(badgeSelector)?.classList.remove("hidden");
  }
};

initializeEventListeners();
