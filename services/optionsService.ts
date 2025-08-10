import { UAParser } from "ua-parser-js";
import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import AccountService from "./accountService";
import PopupUIService from "./popupUIService";
import MarkdownService from "./markdownService";
import { MARKDOWN_CONFIG } from "../utils/config";
import type { ArcadeData } from "../types";
import { AccountUIService } from "../components";

/**
 * Service to handle options page functionality
 */
const OptionsService = {
  /**
   * Initialize options page
   */
  async initialize(): Promise<void> {
    // Initialize migration first
    await StorageService.initializeMigration();

    OptionsService.setupEventListeners();
    OptionsService.setupVersion();
    OptionsService.setupBrowserBadges();
    OptionsService.setupI18n();
    await OptionsService.initializeAccountManagement();
    await OptionsService.loadExistingData();
    await OptionsService.loadSearchFeatureSetting();
    await OptionsService.initializeMarkdown();
  },

  /**
   * Initialize account management UI
   */
  async initializeAccountManagement(): Promise<void> {
    const container = document.querySelector(".mt-4.space-y-4");
    if (container) {
      // Insert account switcher at the beginning
      await AccountUIService.initializeAccountSwitcher(
        container as HTMLElement
      );
    }
  },

  /**
   * Setup event listeners for options page
   */
  setupEventListeners(): void {
    // Submit URL button
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
      submitUrlElement.addEventListener("click", () =>
        OptionsService.handleSubmit()
      );
    }

    // Video toggle button
    const toggleVideoButton = document.getElementById("toggle-video");
    if (toggleVideoButton) {
      toggleVideoButton.addEventListener("click", () => {
        const videoContainer = document.getElementById("video-container");
        if (videoContainer) {
          videoContainer.style.display =
            videoContainer.style.display === "none" ? "flex" : "none";
        }
      });
    }

    // Search feature toggle
    const searchFeatureToggle = document.getElementById(
      "search-feature-toggle"
    ) as HTMLInputElement;
    if (searchFeatureToggle) {
      searchFeatureToggle.addEventListener("change", () => {
        OptionsService.handleSearchFeatureToggle(searchFeatureToggle.checked);
      });
    }
  },

  /**
   * Setup version display
   */
  setupVersion(): void {
    const manifest = browser.runtime.getManifest();
    const versionElement = PopupUIService.querySelector("#version-number");
    if (versionElement) {
      versionElement.textContent = `v${manifest.version}`;
    }
  },

  /**
   * Setup browser-specific badges
   */
  setupBrowserBadges(): void {
    const parser = new UAParser();
    const browserName = parser.getBrowser().name;

    const badgeSelectors: Record<string, string> = {
      Chrome: "#chrome-web-store-badge",
      Firefox: "#firefox-addon-store",
    };

    const badgeSelector = badgeSelectors[browserName || ""];
    if (badgeSelector) {
      PopupUIService.querySelector(badgeSelector)?.classList.remove("hidden");
    }
  },

  /**
   * Setup i18n translations
   */
  setupI18n(): void {
    // Find all elements with data-i18n attribute
    const i18nElements = document.querySelectorAll("[data-i18n]");

    i18nElements.forEach((element) => {
      const messageKey = element.getAttribute("data-i18n");
      if (messageKey) {
        try {
          const translatedText = browser.i18n.getMessage(
            messageKey as Parameters<typeof browser.i18n.getMessage>[0]
          );
          if (translatedText) {
            element.textContent = translatedText;
          }
        } catch (error: unknown) {
          console.error("Error applying i18n translation:", error);
        }
      }
    });
  },

  /**
   * Load existing data from storage
   */
  async loadExistingData(): Promise<void> {
    const profileUrl = await StorageService.getProfileUrl();
    const profileUrlInput = PopupUIService.querySelector<HTMLInputElement>(
      "#public-profile-url"
    );

    if (profileUrlInput) {
      profileUrlInput.value = profileUrl;
    }

    const arcadeData = await StorageService.getArcadeData();
    if (arcadeData) {
      PopupUIService.updateOptionsUI(arcadeData);
    } else {
      PopupUIService.toggleElementVisibility("#arcade-points", false);
    }
  },

  /**
   * Handle form submission
   */
  async handleSubmit(): Promise<void> {
    const submitUrlElement = document.getElementById("submit-url");
    const profileUrlInput = PopupUIService.querySelector<HTMLInputElement>(
      "#public-profile-url"
    );

    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelLoading");
    }

    const profileUrl = profileUrlInput?.value;

    // Validate URL
    if (!profileUrl || !ArcadeApiService.isValidProfileUrl(profileUrl)) {
      PopupUIService.showMessage(
        "#error-message",
        browser.i18n.getMessage("errorInvalidUrl"),
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
      OptionsService.resetSubmitButton();
      return;
    }

    try {
      const arcadeData = await ArcadeApiService.fetchArcadeData(profileUrl);

      if (arcadeData) {
        await OptionsService.displayUserDetails(arcadeData, profileUrl);
      } else {
        PopupUIService.showMessage(
          "#error-message",
          "Failed to fetch data. Please try again later.",
          ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
        );
      }
    } catch (error) {
      PopupUIService.showMessage(
        "#error-message",
        "An error occurred. Please try again.",
        ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
      );
    } finally {
      OptionsService.resetSubmitButton();
    }
  },

  /**
   * Display user details after successful data fetch
   */
  async displayUserDetails(
    data: ArcadeData,
    profileUrl?: string
  ): Promise<void> {
    PopupUIService.showMessage(
      "#success-message",
      browser.i18n.getMessage("successSettingsSaved"),
      ["text-green-500", "font-bold", "mt-2", "animate-pulse"]
    );

    // Check if we have an active account to update
    const activeAccount = await AccountService.getActiveAccount();

    if (activeAccount) {
      // Update existing account
      await AccountService.updateAccountArcadeData(activeAccount.id, data);
      if (profileUrl) {
        await AccountService.updateAccount(activeAccount.id, { profileUrl });
      }
    } else {
      // Create new account if none exists or fallback to old storage
      if (profileUrl) {
        try {
          await AccountService.createAccount({
            profileUrl,
            arcadeData: data,
          });
        } catch {
          // Fallback to old storage method
          await StorageService.saveArcadeData(data);
          await StorageService.saveProfileUrl(profileUrl);
        }
      }
    }

    PopupUIService.updateOptionsUI(data);

    // Reload account switcher to reflect changes
    await AccountUIService.loadAccounts();
  },

  /**
   * Reset submit button text
   */
  resetSubmitButton(): void {
    const submitUrlElement = document.getElementById("submit-url");
    if (submitUrlElement) {
      submitUrlElement.textContent = browser.i18n.getMessage("labelSave");
    }
  },

  /**
   * Load search feature setting from storage and update UI
   */
  async loadSearchFeatureSetting(): Promise<void> {
    const searchFeatureToggle = document.getElementById(
      "search-feature-toggle"
    ) as HTMLInputElement;
    if (searchFeatureToggle) {
      const isEnabled = await StorageService.isSearchFeatureEnabled();
      searchFeatureToggle.checked = isEnabled;
    }
  },

  /**
   * Handle search feature toggle change
   */
  async handleSearchFeatureToggle(enabled: boolean): Promise<void> {
    try {
      await StorageService.saveSearchFeatureEnabled(enabled);

      // Show feedback message
      const messageKey = enabled
        ? "messageSearchFeatureEnabled"
        : "messageSearchFeatureDisabled";
      const message = browser.i18n.getMessage(messageKey);

      // Create temporary message element
      const messageElement = document.createElement("div");
      messageElement.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      messageElement.textContent = message;
      document.body.appendChild(messageElement);

      // Remove message after 3 seconds
      setTimeout(() => {
        messageElement.remove();
      }, 3000);
    } catch (error) {
      console.error("Error saving search feature setting:", error);
    }
  },

  /**
   * Initialize markdown service and load content
   */
  async initializeMarkdown(): Promise<void> {
    // Initialize markdown parser with configured options
    MarkdownService.initialize(MARKDOWN_CONFIG.PARSER_OPTIONS);

    // Show loading state
    OptionsService.showMarkdownLoading();

    try {
      // Load markdown content from configured URL
      await MarkdownService.loadAndRender(
        MARKDOWN_CONFIG.ANNOUNCEMENT_URL,
        MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID,
        MARKDOWN_CONFIG.DEFAULT_CONTENT_SELECTOR
      );
    } catch (error) {
      // Show error if loading fails
      OptionsService.showMarkdownError();
      console.error("Failed to load markdown content:", error);
    }
  },

  /**
   * Show loading state for markdown content
   */
  showMarkdownLoading(): void {
    const container = document.getElementById(
      MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID
    );
    if (container) {
      const contentArea = container.querySelector(
        MARKDOWN_CONFIG.DEFAULT_CONTENT_SELECTOR
      );
      if (contentArea) {
        contentArea.innerHTML = `
          <div class="flex items-center justify-center py-4 animate-pulse">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            <span class="text-blue-600 font-medium">Loading announcement...</span>
          </div>
        `;
      }
    }
  },

  /**
   * Show error state for markdown content
   */
  showMarkdownError(): void {
    const container = document.getElementById(
      MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID
    );
    if (container) {
      const contentArea = container.querySelector(
        MARKDOWN_CONFIG.DEFAULT_CONTENT_SELECTOR
      );
      if (contentArea) {
        contentArea.innerHTML = `
          <div class="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <i class="fa-solid fa-exclamation-triangle mr-2 text-red-500"></i>
            <span>❌ Không thể tải nội dung thông báo. Vui lòng kiểm tra kết nối internet.</span>
          </div>
        `;
      }
    }
  },
};

export default OptionsService;
