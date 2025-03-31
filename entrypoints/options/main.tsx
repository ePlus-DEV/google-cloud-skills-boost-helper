import axios from "axios";
const submitUrlElement = document.getElementById("submit-url");
const profileUrlInput = document.querySelector<HTMLInputElement>(
  "#public-profile-url",
);

const API_URL =
  "https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit";
const PROFILE_URL =
  (await storage.getItem<string>("local:urlProfile")) ||
  profileUrlInput?.value ||
  "";

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

const displayUserDetails = async (data: ArcadeData) => {
  const successElement = document.querySelector("#success-message");
  if (successElement) {
    successElement.textContent = browser.i18n.getMessage(
      "successSettingsSaved",
    );
    successElement.classList.remove("hidden");
    successElement.classList.add(
      "text-green-500",
      "font-bold",
      "mt-2",
      "animate-pulse",
    );
    setTimeout(() => {
      successElement.classList.add("hidden");
    }, 6000);
  }
  const lastUpdated = new Date().toISOString();
  await storage.setItem("local:arcadeData", { ...data, lastUpdated });
};

const handleSubmit = async () => {
  if (submitUrlElement) {
    submitUrlElement.textContent = browser.i18n.getMessage("labelLoading");
  }
  const PROFILE_URL = profileUrlInput?.value;
  try {
    if (
      !PROFILE_URL ||
      !PROFILE_URL.startsWith(
        "https://www.cloudskillsboost.google/public_profiles/",
      )
    ) {
      const errorElement = document.querySelector("#error-message");
      if (errorElement) {
        errorElement.textContent = browser.i18n.getMessage("errorInvalidUrl");
        errorElement.classList.remove("hidden");
        errorElement.classList.add(
          "text-red-500",
          "font-bold",
          "mt-2",
          "animate-pulse",
        );
        setTimeout(() => {
          errorElement.classList.add("hidden");
        }, 6000);
      }
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
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    }
  }
};

const initializeEventListeners = () => {
  if (submitUrlElement) {
    submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    submitUrlElement.addEventListener("click", function () {
      handleSubmit();
    });
  }
  if (profileUrlInput) {
    profileUrlInput.value = PROFILE_URL;
    console.log("Profile URL:", PROFILE_URL);
  }
};

initializeEventListeners();
