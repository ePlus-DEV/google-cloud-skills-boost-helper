import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import PopupUIService from "./popupUIService";
import BadgeService from "./badgeService";
import MarkdownService from "./markdownService";
import { MARKDOWN_CONFIG } from "../utils/config";

/**
 * Main service to handle popup functionality
 */
const PopupService = {
  profileUrl: "",
  SPINNER_CLASS: "animate-spin",

  /**
   * Initialize the popup
   */
  async initialize(): Promise<void> {
    // Initialize markdown service
    await this.initializeMarkdown();

    // Initialize profile URL
    this.profileUrl = await StorageService.getProfileUrl();

    // Load existing data
    const arcadeData = await StorageService.getArcadeData();

    if (!this.profileUrl) {
      this.showAuthScreen();
    } else if (arcadeData) {
      // Ensure lastUpdated is set for existing data
      if (!arcadeData.lastUpdated) {
        arcadeData.lastUpdated = new Date().toISOString();
      }
      PopupUIService.updateMainUI(arcadeData);
      BadgeService.renderBadges(arcadeData.badges || []);
    } else {
      // Profile URL exists but no data - show loading state and try to fetch
      PopupUIService.showLoadingState();
      this.refreshData();
    }

    this.setupEventListeners();
  },

  /**
   * Show authentication screen
   */
  showAuthScreen(): void {
    PopupUIService.updateElementText(
      "#settings-message",
      browser.i18n.getMessage("textPleaseSetUpTheSettings"),
    );
    PopupUIService.querySelector("#popup-content")?.classList.add("blur-sm");
    PopupUIService.querySelector("#auth-screen")?.classList.remove("invisible");
  },

  /**
   * Refresh arcade data
   */
  async refreshData(): Promise<void> {
    if (!this.profileUrl) {
      return;
    }

    const refreshButtons = document.querySelectorAll(
      ".refresh-button",
    ) as NodeListOf<HTMLButtonElement>;
    const refreshIcons = document.querySelectorAll(
      ".refresh-icon",
    ) as NodeListOf<HTMLElement>;

    // Show loading state
    PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, true);
    PopupUIService.toggleButtonState(refreshButtons, true);

    try {
      const arcadeData = await ArcadeApiService.fetchArcadeData(
        this.profileUrl,
      );

      if (arcadeData) {
        await StorageService.saveArcadeData(arcadeData);
        PopupUIService.updateMainUI(arcadeData);
        BadgeService.renderBadges(arcadeData.badges || []);
      } else {
        PopupUIService.showErrorState();
      }
    } catch (error) {
      PopupUIService.showErrorState();
    } finally {
      // Hide loading state
      PopupUIService.toggleClass(refreshIcons, this.SPINNER_CLASS, false);
      PopupUIService.toggleButtonState(refreshButtons, false);
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners(): void {
    // Refresh buttons
    document.querySelectorAll(".refresh-button").forEach((button) => {
      button.addEventListener("click", () => this.refreshData());
    });

    // Settings buttons
    document.querySelectorAll(".settings-button").forEach((button) => {
      button.addEventListener("click", () => {
        window.open(browser.runtime.getURL("/options.html"), "_blank");
      });
    });

    // Announcement toggle
    const announcementToggle = document.getElementById("announcement-toggle");
    if (announcementToggle) {
      announcementToggle.addEventListener("click", () =>
        this.toggleAnnouncement(),
      );
    }
  },

  /**
   * Toggle announcement visibility
   */
  toggleAnnouncement(): void {
    const container = document.getElementById("popup-markdown-container");
    const chevron = document.getElementById("announcement-chevron");

    if (container && chevron) {
      const isHidden = container.classList.contains("hidden");

      if (isHidden) {
        container.classList.remove("hidden");
        chevron.style.transform = "rotate(180deg)";
      } else {
        container.classList.add("hidden");
        chevron.style.transform = "rotate(0deg)";
      }
    }
  },

  /**
   * Update profile URL (called from external sources)
   */
  updateProfileUrl(url: string): void {
    this.profileUrl = url;
  },

  /**
   * Get current profile URL
   */
  getProfileUrl(): string {
    return this.profileUrl;
  },

  /**
   * Initialize markdown service and load announcement content
   */
  async initializeMarkdown(): Promise<void> {
    // Initialize markdown parser
    MarkdownService.initialize(MARKDOWN_CONFIG.PARSER_OPTIONS);

    // Load markdown content into popup container
    await MarkdownService.loadAndRender(
      MARKDOWN_CONFIG.ANNOUNCEMENT_URL,
      "popup-markdown-container",
      ".prose",
    );
  },
};

export default PopupService;
