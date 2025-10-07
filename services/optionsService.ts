import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import sendRuntimeMessage from "./runtimeMessage";
import AccountService from "./accountService";
import PopupUIService from "./popupUIService";
import MarkdownService from "./markdownService";
import TourService from "./tourService";
import { calculateFacilitatorBonus } from "./facilitatorService";
import { MARKDOWN_CONFIG } from "../utils/config";
import { ModalUtils, DOMUtils, PreviewUtils } from "../utils";
import type { ArcadeData, Account, UserDetail } from "../types";

/**
 * Service to handle options page functionality
 */
const OptionsService = {
  createdAccountId: undefined as string | undefined,
  /**
   * Initialize options page
   */
  async initialize(): Promise<void> {
    // Initialize migration first
    await StorageService.initializeMigration();

    OptionsService.setupEventListeners();
    OptionsService.setupVersion();
    OptionsService.setupI18n();
    await OptionsService.initializeAccountManagement();
    await OptionsService.loadExistingData();
    await OptionsService.loadSearchFeatureSetting();
    await OptionsService.loadBadgeDisplaySetting();
    await OptionsService.initializeMarkdown();

    // Check if we should show the tour for first-time users
    await OptionsService.initializeTour();
  },

  /**
   * Initialize tour functionality
   */
  async initializeTour(): Promise<void> {
    const shouldShowTour = await TourService.shouldShowTour();
    const accounts = await AccountService.getAllAccounts();

    // If no accounts exist and user hasn't seen tour, show it automatically
    if (accounts.length === 0 && shouldShowTour) {
      // Wait a bit for page to fully load
      setTimeout(() => {
        TourService.startAccountCreationTour();
        TourService.markTourCompleted();
      }, 1500);
    }
  },

  /**
   * Initialize account management UI
   */
  async initializeAccountManagement(): Promise<void> {
    await this.loadAccounts();
    this.setupAccountEventListeners();
  },

  /**
   * Load and display accounts as cards
   */
  async loadAccounts(): Promise<void> {
    const accountsList = document.getElementById("accounts-list");
    const noAccountsMessage = document.getElementById("no-accounts-message");

    if (!accountsList) return;

    // Load accounts
    const accounts = await AccountService.getAllAccounts();
    const activeAccount = await AccountService.getActiveAccount();

    // Clear existing account cards (keep no-accounts message)
    const existingCards = accountsList.querySelectorAll(".account-card");
    for (const card of existingCards) {
      card.remove();
    }

    if (accounts.length === 0) {
      // Show no accounts message
      if (noAccountsMessage) {
        noAccountsMessage.classList.remove("hidden");
      }
    } else {
      // Hide no accounts message
      if (noAccountsMessage) {
        noAccountsMessage.classList.add("hidden");
      }

      // Create account cards
      for (const account of accounts) {
        const isActive = activeAccount?.id === account.id;
        const accountCard = this.createAccountCard(account, isActive);
        accountsList.appendChild(accountCard);
      }
    }
  },

  /**
   * Create account card element
   */
  createAccountCard(account: Account, isActive: boolean): HTMLElement {
    const card = document.createElement("div");
    card.className = `account-card bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
      isActive
        ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50"
        : "border-gray-200 hover:border-gray-300"
    }`;
    card.dataset.accountId = account.id;

    const userDetail = account.arcadeData
      ? this.extractUserDetails(account.arcadeData)
      : null;
    const avatarSrc = userDetail?.profileImage || "";
    const displayName = account.name;
    const nickname = account.nickname;
    const arcadePoints = account.arcadeData?.arcadePoints?.totalPoints || 0;
    // If facilitator program is enabled, compute facilitator bonus and add to total
    const facilitatorBonus = account.facilitatorProgram
      ? calculateFacilitatorBonus(account.arcadeData?.faciCounts)
      : 0;
    const finalPoints = (arcadePoints || 0) + (facilitatorBonus || 0);

    card.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            ${
              avatarSrc
                ? `<img src="${avatarSrc}" alt="Avatar" class="w-12 h-12 rounded-full border-2 border-white shadow-sm">`
                : `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">${displayName
                    .charAt(0)
                    .toUpperCase()}</div>`
            }
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="text-lg font-semibold text-gray-900 truncate">${displayName}</h4>
                ${
                  isActive
                    ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><i class="fa-solid fa-check mr-1"></i>Active</span>'
                    : ""
                }
                ${
                  account.facilitatorProgram
                    ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><i class="fa-solid fa-chalkboard-teacher mr-1"></i>Facilitator</span>'
                    : ""
                }
              </div>
              
              ${
                nickname
                  ? `<p class="text-sm text-gray-500 truncate">Nickname: ${nickname}</p>`
                  : ""
              }
              
              <div class="flex items-center space-x-4 mt-2">
                <span class="text-sm text-gray-600">
                  <i class="fa-solid fa-trophy text-yellow-500 mr-1"></i>
                  ${finalPoints.toLocaleString()} points
                </span>
                <span class="text-xs text-gray-400">
                  Updated: ${new Date(account.lastUsed).toLocaleDateString(
                    "en-US"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 ml-3">
            ${
              !isActive
                ? `<button class="switch-account-btn bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200" data-account-id="${account.id}" title="Set as default account">
                <i class="fa-solid fa-star mr-1"></i>
              </button>`
                : ""
            }
            
            <!-- Facilitator Program Button -->
            <button class="facilitator-btn ${
              account.facilitatorProgram
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
            } p-2 rounded-lg transition duration-200" data-account-id="${
      account.id
    }" title="Toggle Facilitator Program">
              <i class="fa-solid fa-chalkboard-teacher"></i>
            </button>
            
            <button class="update-account-btn text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition duration-200" data-account-id="${
              account.id
            }" title="Update account">
              <i class="fa-solid fa-sync-alt"></i>
            </button>

            <button class="view-profile-btn text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition duration-200" data-account-id="${
              account.id
            }" title="View public profile">
              <i class="fa-solid fa-eye"></i>
            </button>
            
            <button class="edit-account-btn text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition duration-200" data-account-id="${
              account.id
            }" title="Edit account">
              <i class="fa-solid fa-edit"></i>
            </button>
            
            <button class="delete-account-btn text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition duration-200" data-account-id="${
              account.id
            }" title="Delete account">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  },

  /**
   * Switch to a different account
   */
  async switchAccount(accountId: string): Promise<void> {
    try {
      await AccountService.setActiveAccount(accountId);

      // Reload accounts to update UI
      await this.loadAccounts();

      // Update milestone section visibility for new active account
      const PopupUIService = (await import("./popupUIService")).default;
      await PopupUIService.updateMilestoneSection();

      // Notify background to refresh badge for the newly active account
      try {
        // Use the typed runtime messaging helper instead of casting to `any`.
        await sendRuntimeMessage({ type: "refreshBadge" });
      } catch (err) {
        console.debug(
          "Failed to send runtime message to background for badge refresh:",
          err
        );
      }

      // Ensure badge is refreshed from options page as a fallback
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Fallback refreshBadgeForActiveAccount failed:", err);
      }

      // Show success message
      this.showMessage(
        browser.i18n.getMessage("successSwitchedAccount"),
        "success"
      );
    } catch (error) {
      console.error("Error switching account:", error);
      this.showMessage(browser.i18n.getMessage("errorSwitchAccount"), "error");
    }
  },

  /**
   * Handle updating account data
   */
  async handleUpdateAccount(accountId: string): Promise<void> {
    try {
      const account = await AccountService.getAccountById(accountId);
      if (!account) {
        this.showMessage(
          browser.i18n.getMessage("errorAccountNotFound"),
          "error"
        );
        return;
      }

      // Show loading message
      this.showMessage(
        browser.i18n.getMessage("infoUpdatingAccountData"),
        "success"
      );

      // Fetch fresh data from API
      const arcadeData = await ArcadeApiService.fetchArcadeData(
        account.profileUrl
      );

      if (arcadeData) {
        // Update account with new data
        const updatedAccount = {
          ...account,
          arcadeData,
          lastUsed: new Date().toISOString(),
        };

        // Update name if it changed in the API
        const userDetail = this.extractUserDetails(arcadeData);
        if (userDetail?.userName && userDetail.userName !== account.name) {
          updatedAccount.name = userDetail.userName;
        }

        await AccountService.updateAccount(updatedAccount.id, updatedAccount);

        // Reload accounts to show updated data
        await this.loadAccounts();

        // Refresh badge after updating account data
        try {
          await StorageService.refreshBadgeForActiveAccount();
        } catch (err) {
          console.debug("Failed to refresh badge after account update:", err);
        }
        this.showMessage(
          browser.i18n.getMessage("successAccountDataUpdated"),
          "success"
        );
      } else {
        this.showMessage(
          browser.i18n.getMessage("errorFetchDataFromApi"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating account:", error);
      this.showMessage(
        browser.i18n.getMessage("errorUpdatingAccount"),
        "error"
      );
    }
  },

  /**
   * Handle viewing account profile
   */
  async handleViewProfile(accountId: string): Promise<void> {
    try {
      const account = await AccountService.getAccountById(accountId);
      if (!account?.profileUrl) {
        this.showMessage(
          browser.i18n.getMessage("errorProfileUrlNotFound"),
          "error"
        );
        return;
      }

      // Open profile URL in new tab
      window.open(account.profileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing profile:", error);
      this.showMessage(browser.i18n.getMessage("errorOpeningProfile"), "error");
    }
  },

  /**
   * Handle viewing active account profile
   */
  async handleViewActiveProfile(): Promise<void> {
    try {
      const activeAccount = await AccountService.getActiveAccount();
      if (!activeAccount?.profileUrl) {
        this.showMessage(
          browser.i18n.getMessage("errorNoActiveAccountOrProfileUrl"),
          "error"
        );
        return;
      }

      // Open profile URL in new tab
      window.open(activeAccount.profileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing active profile:", error);
      this.showMessage(browser.i18n.getMessage("errorOpeningProfile"), "error");
    }
  },

  /**
   * Setup account-related event listeners
   */
  setupAccountEventListeners(): void {
    // Use event delegation for account cards
    const accountsList = document.getElementById("accounts-list");
    if (accountsList) {
      // Handle button clicks
      accountsList.addEventListener("click", async (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest("button");

        if (!button) return;

        const accountId = button.dataset.accountId;
        if (!accountId) return;

        // Handle different button types
        if (button.classList.contains("switch-account-btn")) {
          await this.switchAccount(accountId);
        } else if (button.classList.contains("update-account-btn")) {
          await this.handleUpdateAccount(accountId);
        } else if (button.classList.contains("view-profile-btn")) {
          await this.handleViewProfile(accountId);
        } else if (button.classList.contains("edit-account-btn")) {
          await this.showEditAccountModal(accountId);
        } else if (button.classList.contains("delete-account-btn")) {
          await this.handleDeleteAccount(accountId);
        } else if (button.classList.contains("facilitator-btn")) {
          const account = await AccountService.getAccountById(accountId);
          if (account) {
            await this.handleAccountFacilitatorToggle(
              accountId,
              !account.facilitatorProgram
            );
          }
        }
      });
    }

    // Export accounts button
    const exportBtn = document.getElementById("export-accounts-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        await this.handleExportAccounts();
      });
    }

    // Import accounts button
    const importBtn = document.getElementById("import-accounts-btn");
    if (importBtn) {
      importBtn.addEventListener("click", () => {
        this.showImportModal();
      });
    }

    // Add account button
    const addBtn = document.getElementById("add-account-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.showAddAccountModal();
      });
    }

    // View active profile button
    const viewActiveProfileBtn = document.getElementById(
      "view-active-profile-btn"
    );
    if (viewActiveProfileBtn) {
      viewActiveProfileBtn.addEventListener("click", async () => {
        await this.handleViewActiveProfile();
      });
    }

    // Setup modal event listeners
    this.setupModalEventListeners();
  },

  /**
   * Setup event listeners for options page
   */
  setupEventListeners(): void {
    // Search feature toggle
    const searchFeatureToggle = document.getElementById(
      "search-feature-toggle"
    ) as HTMLInputElement;
    if (searchFeatureToggle) {
      searchFeatureToggle.addEventListener("change", () => {
        OptionsService.handleSearchFeatureToggle(searchFeatureToggle.checked);
      });
    }

    // Badge display toggle
    const badgeToggle = document.getElementById(
      "badge-display-toggle"
    ) as HTMLInputElement;
    if (badgeToggle) {
      badgeToggle.addEventListener("change", () => {
        OptionsService.handleBadgeDisplayToggle(badgeToggle.checked);
      });
    }

    // Tour start button
    const startTourBtn = document.getElementById("start-tour-btn");
    if (startTourBtn) {
      startTourBtn.addEventListener("click", () => {
        TourService.startAccountCreationTour();
      });
    }
  },

  /**
   * Handle facilitator program toggle for specific account
   */
  async handleAccountFacilitatorToggle(
    accountId: string,
    enabled: boolean
  ): Promise<void> {
    try {
      const account = await AccountService.getAccountById(accountId);
      if (!account) return;

      await AccountService.updateAccount(accountId, {
        facilitatorProgram: enabled,
      });

      await this.loadAccounts(); // Reload to update badges and buttons

      // Update milestone section visibility if this is the active account
      const activeAccount = await AccountService.getActiveAccount();
      if (activeAccount && activeAccount.id === accountId) {
        // Import PopupUIService to update milestone section
        const PopupUIService = (await import("./popupUIService")).default;
        await PopupUIService.updateMilestoneSection();
        // If the active account's facilitator setting changed, refresh the extension badge
        try {
          await sendRuntimeMessage({ type: "refreshBadge" });
        } catch (err) {
          console.debug(
            "Failed to send runtime message to background for badge refresh:",
            err
          );
        }

        // Also refresh badge locally as a fallback
        try {
          await StorageService.refreshBadgeForActiveAccount();
        } catch (err) {
          console.debug("Failed to refresh badge after facilitator toggle:", err);
        }
      }

      this.showMessage(
        `Facilitator Program ${enabled ? "enabled" : "disabled"} for ${
          account.name
        }`,
        "success"
      );
    } catch (error) {
      console.error("Error updating facilitator program:", error);
      this.showMessage("Error updating Facilitator Program setting", "error");

      // UI will be corrected on next loadAccounts() call
      await this.loadAccounts();
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
   * Setup i18n translations
   */
  setupI18n(): void {
    // Find all elements with data-i18n attribute
    const i18nElements = document.querySelectorAll("[data-i18n]");

    for (const element of i18nElements) {
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
    }
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
        // Check if we have an active account selected
        const activeAccount = await AccountService.getActiveAccount();

        if (activeAccount) {
          // Update existing account
          await OptionsService.displayUserDetails(
            arcadeData,
            profileUrl,
            "update"
          );
        } else {
          // Create new account
          await OptionsService.displayUserDetails(
            arcadeData,
            profileUrl,
            "create"
          );
        }
      } else {
        PopupUIService.showMessage(
          "#error-message",
          "Failed to fetch data. Please try again later.",
          ["text-red-500", "font-bold", "mt-2", "animate-pulse"]
        );
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
    profileUrl?: string,
    action?: "create" | "update"
  ): Promise<void> {
    // Check if we have an active account to update
    const activeAccount = await AccountService.getActiveAccount();

    let messageText = "";

    if (action === "create" || !activeAccount) {
      // Create new account
      if (profileUrl) {
        try {
          // Use userName from API if available
          const userDetail = this.extractUserDetails(data);
          const accountName = userDetail?.userName || "New account";

          await AccountService.createAccount({
            name: accountName,
            profileUrl,
            arcadeData: data,
          });
          messageText = `Created account "${accountName}" successfully!`;
        } catch {
          // Fallback to old storage method
          await StorageService.saveArcadeData(data);
          await StorageService.saveProfileUrl(profileUrl);
          messageText = "Data saved successfully!";
        }
      }
    } else {
      // Update existing account
      await AccountService.updateAccountArcadeData(activeAccount.id, data);
      if (profileUrl) {
        await AccountService.updateAccount(activeAccount.id, { profileUrl });
      }
      messageText = "Account updated successfully!";
    }

    PopupUIService.showMessage(
      "#success-message",
      messageText || browser.i18n.getMessage("successSettingsSaved"),
      ["text-green-500", "font-bold", "mt-2", "animate-pulse"]
    );

    PopupUIService.updateOptionsUI(data);

    // Reload account switcher to reflect changes
    await this.loadAccounts();

    // Ensure badge is refreshed after create/update flows
    try {
      await StorageService.refreshBadgeForActiveAccount();
    } catch (err) {
      console.debug("Failed to refresh badge after displayUserDetails:", err);
    }
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
   * Load badge display setting and update UI
   */
  async loadBadgeDisplaySetting(): Promise<void> {
    const badgeToggle = document.getElementById(
      "badge-display-toggle"
    ) as HTMLInputElement;
    if (!badgeToggle) return;
    try {
      const enabled = await StorageService.isBadgeDisplayEnabled();
      badgeToggle.checked = Boolean(enabled);
    } catch (e) {
      console.error("Failed to load badge display setting:", e);
    }
  },

  /**
   * Handle badge display toggle change
   */
  async handleBadgeDisplayToggle(enabled: boolean): Promise<void> {
    try {
      await StorageService.saveBadgeDisplayEnabled(Boolean(enabled));

      // Notify background to refresh or clear badge immediately
      try {
        await (
          await import("./runtimeMessage")
        ).default({
          type: enabled ? "refreshBadge" : "clearBadge",
        });
      } catch (err) {
        console.debug(
          "Failed to send runtime message to background for badge refresh:",
          err
        );
      }

      this.showMessage(
        enabled
          ? browser.i18n.getMessage("messageBadgeEnabled") ||
              "Badge display enabled"
          : browser.i18n.getMessage("messageBadgeDisabled") ||
              "Badge display disabled",
        "success"
      );
    } catch (error) {
      console.error("Error saving badge display setting:", error);
      this.showMessage("Failed to save setting", "error");
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
    if (!container) return;

    const contentArea = container.querySelector(
      MARKDOWN_CONFIG.DEFAULT_CONTENT_SELECTOR
    ) as HTMLElement | null;
    if (!contentArea) return;

    contentArea.innerHTML = `
      <div class="flex items-center justify-center py-4 animate-pulse">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
        <span class="text-blue-600 font-medium">Loading announcement...</span>
      </div>
    `;

    // Attempt to refresh the badge in the background while loading
    import("./runtimeMessage")
      .then((mod) => mod.default?.({ type: "refreshBadge" }))
      .catch((err) => {
        console.debug(
          "Failed to import or send runtime message for badge refresh:",
          err
        );
      });
  },

  /**
   * Show error state for markdown content area
   */
  showMarkdownError(): void {
    const container = document.getElementById(
      MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID
    );
    if (!container) return;

    const contentArea = container.querySelector(
      MARKDOWN_CONFIG.DEFAULT_CONTENT_SELECTOR
    ) as HTMLElement | null;
    if (!contentArea) return;

    contentArea.innerHTML = `
      <div class="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
        <i class="fa-solid fa-exclamation-triangle mr-2 text-red-500"></i>
        <span>❌ Unable to load announcement content. Please check your internet connection.</span>
      </div>
    `;
  },

  /**
   * Setup modal event listeners
   */
  setupModalEventListeners(): void {
    // Add account modal events
    this.setupAddAccountModalEvents();
    this.setupEditAccountModalEvents();
    this.setupImportModalEvents();
  },

  /**
   * Setup add account modal events
   */
  setupAddAccountModalEvents(): void {
    // Setup standard modal close events
    ModalUtils.setupStandardModal("add-account-modal", [
      "close-modal-btn",
      "cancel-add-account-btn",
      "skip-nickname-btn",
    ]);

    // Setup specific action buttons
    DOMUtils.setupEventListeners([
      {
        id: "create-account-btn",
        event: "click",
        handler: () => this.handleCreateAccount(),
      },
      {
        id: "save-nickname-btn",
        event: "click",
        handler: () => this.handleSaveNickname(),
      },
      {
        id: "account-url-input",
        event: "keypress",
        handler: (e: Event) => {
          const keyboardEvent = e as KeyboardEvent;
          if (keyboardEvent.key === "Enter") {
            this.handleCreateAccount();
          }
        },
      },
      {
        id: "go-to-profile-page-btn",
        event: "click",
        handler: () => {
          window.open(
            "https://www.cloudskillsboost.google/my_account/profile#public-profile",
            "_blank",
            "noopener,noreferrer"
          );
        },
      },
    ]);
  },

  /**
   * Setup edit account modal events
   */
  setupEditAccountModalEvents(): void {
    ModalUtils.setupStandardModal("edit-account-modal", [
      "close-edit-modal-btn",
      "cancel-edit-account-btn",
    ]);

    DOMUtils.addEventListener("confirm-edit-account-btn", "click", () => {
      this.handleEditAccount();
    });
  },

  /**
   * Setup import modal events
   */
  setupImportModalEvents(): void {
    ModalUtils.setupStandardModal("import-accounts-modal", [
      "close-import-modal-btn",
      "cancel-import-btn",
    ]);

    DOMUtils.addEventListener("confirm-import-btn", "click", () => {
      this.handleImportAccounts();
    });

    // File input change handler
    DOMUtils.addEventListener("import-file-input", "change", (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      const textArea = DOMUtils.getTextAreaElement("import-json-textarea");

      if (file && textArea) {
        const reader = new FileReader();
        reader.onload = (event) => {
          textArea.value = event.target?.result as string;
        };
        reader.readAsText(file);
      }
    });
  },

  /**
   * Show add account modal
   */
  showAddAccountModal(): void {
    ModalUtils.showModal("add-account-modal", {
      onOpen: () => {
        // Reset to step 1
        this.resetAddAccountModal();
        // Check if user has no accounts and hasn't seen modal tour
        this.checkAndShowModalTour();
      },
    });
  },

  /**
   * Check if modal tour should be shown
   */
  async checkAndShowModalTour(): Promise<void> {
    try {
      const accounts = await AccountService.getAllAccounts();
      const result = await browser.storage.local.get(["modalTourCompleted"]);

      // Show modal tour if no accounts exist and tour hasn't been completed
      if (accounts.length === 0 && !result.modalTourCompleted) {
        setTimeout(() => {
          TourService.startModalTour();
          // Mark modal tour as completed
          browser.storage.local.set({ modalTourCompleted: true });
        }, 500);
      }
    } catch (error) {
      console.error("Error checking modal tour status:", error);
    }
  },

  /**
   * Reset add account modal to initial state
   */
  resetAddAccountModal(): void {
    // Show step 1, hide others
    DOMUtils.toggleElementVisibility("step-url-input", true);
    DOMUtils.toggleElementVisibility("step-add-nickname", false);
    DOMUtils.toggleElementVisibility("error-profile", false);
    DOMUtils.toggleElementVisibility("loading-profile", false);
    DOMUtils.toggleElementVisibility("success-created", false);
    DOMUtils.toggleElementVisibility("skip-nickname-btn", false);
    DOMUtils.toggleElementVisibility("save-nickname-btn", false);

    // Clear form inputs
    DOMUtils.clearInputs(["account-nickname-input", "account-url-input"]);

    // Store created account ID for nickname step
    // this.createdAccountId = null;
  },

  /**
   * Handle creating account directly from URL
   */
  async handleCreateAccount(): Promise<void> {
    const urlInput = document.getElementById(
      "account-url-input"
    ) as HTMLInputElement;
    const loadingDiv = document.getElementById("loading-profile");
    const errorDiv = document.getElementById("error-profile");
    const stepUrlInput = document.getElementById("step-url-input");
    const stepNickname = document.getElementById("step-add-nickname");
    const successDiv = document.getElementById("success-created");

    if (!urlInput.value.trim()) {
      this.showProfileError("Please enter a profile URL!");
      return;
    }

    if (!ArcadeApiService.isValidProfileUrl(urlInput.value)) {
      this.showProfileError("Invalid profile URL!");
      return;
    }

    // Check if account already exists
    try {
      const existingAccount = await AccountService.isAccountExists(
        urlInput.value.trim()
      );
      if (existingAccount) {
        this.showProfileError(
          `An account with this URL already exists: "${existingAccount.name}".`,
          "Account already exists",
          true,
          existingAccount
        );
        return;
      }
    } catch (error) {
      console.error("Error checking existing account:", error);
    }

    // Show loading state
    if (errorDiv) errorDiv.classList.add("hidden");
    if (loadingDiv) loadingDiv.classList.remove("hidden");

    try {
      // Fetch arcade data
      const arcadeData = await ArcadeApiService.fetchArcadeData(urlInput.value);

      if (!arcadeData) {
        throw new Error("Unable to fetch information from this profile");
      }

      // Check if we have user details and can extract user name
      const userDetail = this.extractUserDetails(arcadeData);
      if (!userDetail?.userName) {
        throw new Error("Unable to get user name from this profile");
      }

      // Create account directly
      const facilitatorToggle = document.getElementById(
        "account-facilitator-toggle"
      ) as HTMLInputElement;

      const newAccount = await AccountService.createAccount({
        name: userDetail.userName,
        profileUrl: urlInput.value.trim(),
        arcadeData,
        facilitatorProgram: facilitatorToggle?.checked || true,
      });

      // Hide loading, show success and nickname step
      if (loadingDiv) loadingDiv.classList.add("hidden");
      if (successDiv) successDiv.classList.remove("hidden");
      if (stepUrlInput) stepUrlInput.classList.add("hidden");
      if (stepNickname) stepNickname.classList.remove("hidden");

      // Update preview with account data
      this.updateAccountPreview(newAccount, userDetail, arcadeData);

      // Show nickname buttons
      const skipBtn = document.getElementById("skip-nickname-btn");
      const saveBtn = document.getElementById("save-nickname-btn");
      if (skipBtn) skipBtn.classList.remove("hidden");
      if (saveBtn) saveBtn.classList.remove("hidden");

      // Store account ID for nickname update
      this.createdAccountId = newAccount.id;

      // Reload accounts to show new account
      await this.loadAccounts();

      // Refresh badge for the newly created account
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Failed to refresh badge after createAccount:", err);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      if (loadingDiv) loadingDiv.classList.add("hidden");
      this.showProfileError(
        error instanceof Error
          ? error.message
          : "Unable to create account. Please check the URL and try again!"
      );
    }
  },

  /**
   * Handle saving nickname for created account
   */
  async handleSaveNickname(): Promise<void> {
    const nicknameInput = document.getElementById(
      "account-nickname-input"
    ) as HTMLInputElement;
    const accountId = this.createdAccountId;

    if (!accountId) {
      this.showMessage(
        browser.i18n.getMessage("errorAccountNotFoundToUpdate"),
        "error"
      );
      return;
    }

    try {
      if (nicknameInput.value.trim()) {
        await AccountService.updateAccount(accountId, {
          nickname: nicknameInput.value.trim(),
        });

        // Update preview nickname
        const previewNicknameDisplay = document.getElementById(
          "preview-nickname-display"
        );
        const previewNicknameText = document.getElementById(
          "preview-nickname-text"
        );
        if (previewNicknameDisplay && previewNicknameText) {
          previewNicknameText.textContent = nicknameInput.value.trim();
          previewNicknameDisplay.classList.remove("hidden");
        }

        this.showMessage(
          browser.i18n.getMessage("successNicknameSaved"),
          "success"
        );
      }

      // Reload accounts and close modal
      await this.loadAccounts();
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Failed to refresh badge after saving nickname:", err);
      }
      this.hideAddAccountModal();
    } catch (error) {
      console.error("Error saving nickname:", error);
      this.showMessage(browser.i18n.getMessage("errorSavingNickname"), "error");
    }
  },

  /**
   * Hide add account modal
   */
  hideAddAccountModal(): void {
    ModalUtils.hideModal("add-account-modal");
  },

  /**
   * Fetch and preview profile information
   */
  async fetchProfilePreview(): Promise<void> {
    const urlInput = document.getElementById(
      "account-url-input"
    ) as HTMLInputElement;
    const loadingDiv = document.getElementById("loading-profile");
    const errorDiv = document.getElementById("error-profile");
    const stepUrlInput = document.getElementById("step-url-input");
    const stepPreview = document.getElementById("step-profile-preview");

    if (!urlInput.value.trim()) {
      this.showProfileError("Please enter a profile URL!");
      return;
    }

    if (!ArcadeApiService.isValidProfileUrl(urlInput.value)) {
      this.showProfileError("Invalid profile URL!");
      return;
    }

    // Check if account already exists
    try {
      const existingAccount = await AccountService.isAccountExists(
        urlInput.value.trim()
      );
      if (existingAccount) {
        this.showProfileError(
          `An account with this URL already exists: "${existingAccount.name}".`,
          "Account already exists",
          true,
          existingAccount
        );
        return;
      }
    } catch (error) {
      console.error("Error checking existing account:", error);
    }

    // Show loading state
    if (errorDiv) errorDiv.classList.add("hidden");
    if (loadingDiv) loadingDiv.classList.remove("hidden");

    try {
      // Fetch arcade data
      const arcadeData = await ArcadeApiService.fetchArcadeData(urlInput.value);

      if (!arcadeData) {
        throw new Error("Unable to fetch information from this profile");
      }

      // Check if we have user details and can extract user name
      const userDetail = this.extractUserDetails(arcadeData);
      if (!userDetail?.userName) {
        throw new Error("Unable to get user name from this profile");
      }

      // Hide loading, show preview
      if (loadingDiv) loadingDiv.classList.add("hidden");
      if (stepUrlInput) stepUrlInput.classList.add("hidden");
      if (stepPreview) stepPreview.classList.remove("hidden");

      // Update preview UI
      this.updateProfilePreview(arcadeData, urlInput.value);

      // Enable confirm button
      const confirmBtn = document.getElementById(
        "confirm-add-account-btn"
      ) as HTMLButtonElement;
      const backBtn = document.getElementById("back-to-input-btn");
      if (confirmBtn) confirmBtn.disabled = false;
      if (backBtn) backBtn.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (loadingDiv) loadingDiv.classList.add("hidden");
      this.showProfileError(
        error instanceof Error
          ? error.message
          : "Unable to fetch profile information. Please check the URL and try again!"
      );
    }
  },

  /**
   * Extract user details from ArcadeData (handle both array and object format)
   */
  extractUserDetails(arcadeData: ArcadeData) {
    if (!arcadeData.userDetails) return null;

    if (Array.isArray(arcadeData.userDetails)) {
      return arcadeData.userDetails[0] || null;
    }

    return arcadeData.userDetails;
  },

  /**
   * Update profile preview UI
   */
  updateProfilePreview(arcadeData: ArcadeData, profileUrl: string): void {
    // Extract user details using helper function
    const userDetail = this.extractUserDetails(arcadeData);

    if (userDetail) {
      // Update avatar
      PreviewUtils.updateAvatar(userDetail);

      // Update name and auto-fill name display
      if (userDetail.userName) {
        DOMUtils.setTextContent("preview-name", userDetail.userName);
        DOMUtils.setInputValue("account-name-display", userDetail.userName);
      }
    }

    // Update email/member info
    const previewEmail = DOMUtils.getElementById("preview-email");
    if (previewEmail) {
      if (userDetail?.memberSince) {
        previewEmail.textContent = userDetail.memberSince;
      } else {
        try {
          const url = new URL(profileUrl);
          const pathParts = url.pathname.split("/");
          const profileId = pathParts[pathParts.length - 1];
          previewEmail.textContent = profileId || "Profile ID not found";
        } catch {
          previewEmail.textContent = "Profile ID not found";
        }
      }
    }

    // Update points using PreviewUtils
    PreviewUtils.updateMainPoints(arcadeData);
  },

  /**
   * Show profile fetch error
   */
  showProfileError(
    message: string,
    title?: string,
    showSwitchBtn?: boolean,
    existingAccount?: Account
  ): void {
    const errorDiv = document.getElementById("error-profile");
    const errorTitle = document.getElementById("error-title");
    const errorMessage = document.getElementById("profile-error-message");
    const loadingDiv = document.getElementById("loading-profile");

    if (loadingDiv) loadingDiv.classList.add("hidden");
    if (errorDiv) errorDiv.classList.remove("hidden");
    if (errorTitle && title) errorTitle.textContent = title;
    if (errorMessage) errorMessage.textContent = message;

    // Remove any previous switch button
    if (errorMessage?.parentNode) {
      const prevBtn = errorMessage.parentNode.querySelector("button");
      prevBtn?.remove();
    }
    // Add switch button if needed
    if (showSwitchBtn && existingAccount) {
      this.showSwitchToExistingAccountOption(existingAccount);
    }
  },

  /**
   * Show option to switch to existing account
   */
  showSwitchToExistingAccountOption(existingAccount: Account): void {
    const errorDiv = document.getElementById("error-profile");
    const errorMessage = document.getElementById("profile-error-message");

    if (errorDiv && errorMessage) {
      // Add a button to switch to existing account
      const switchButton = document.createElement("button");
      switchButton.className =
        "mt-1 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200";
      switchButton.innerHTML = `<i class="fa-solid fa-arrow-right mr-1"></i>Switch to account "${existingAccount.name}"`;

      switchButton.addEventListener("click", async () => {
        try {
          await this.switchAccount(existingAccount.id);
          this.hideAddAccountModal();
          this.showMessage(
            `Switched to account "${existingAccount.name}"!`,
            "success"
          );
        } catch (error) {
          console.error("Error switching account:", error);
          this.showMessage("Error switching account!", "error");
        }
      });

      // Clear previous button if exists
      const parent = errorMessage.parentNode;
      if (parent) {
        const existingButton = parent.querySelector("button");
        if (existingButton) existingButton.remove();
        // Insert button after error-message
        errorMessage.insertAdjacentElement("afterend", switchButton);
      }
    }
  },

  /**
   * Go back to URL input step
   */
  backToUrlInput(): void {
    const stepUrlInput = document.getElementById("step-url-input");
    const stepPreview = document.getElementById("step-profile-preview");
    const errorDiv = document.getElementById("error-profile");
    const backBtn = document.getElementById("back-to-input-btn");
    const confirmBtn = document.getElementById(
      "confirm-add-account-btn"
    ) as HTMLButtonElement;
    const nameDisplay = document.getElementById(
      "account-name-display"
    ) as HTMLInputElement;

    if (stepUrlInput) stepUrlInput.classList.remove("hidden");
    if (stepPreview) stepPreview.classList.add("hidden");
    if (errorDiv) errorDiv.classList.add("hidden");
    if (backBtn) backBtn.classList.add("hidden");
    if (confirmBtn) confirmBtn.disabled = true;
    if (nameDisplay) nameDisplay.value = "";
  },

  /**
   * Show edit account modal
   */
  async showEditAccountModal(accountId?: string): Promise<void> {
    const account = accountId
      ? await AccountService.getAccountById(accountId)
      : await AccountService.getActiveAccount();

    if (!account) return;

    // Set form values
    DOMUtils.setInputValue("edit-account-name-input", account.name);
    DOMUtils.setInputValue(
      "edit-account-nickname-input",
      account.nickname || ""
    );

    // Set facilitator program toggle
    const facilitatorToggle = document.getElementById(
      "edit-account-facilitator-toggle"
    ) as HTMLInputElement;
    if (facilitatorToggle) {
      facilitatorToggle.checked = account.facilitatorProgram || false;
    }

    // Store account ID for editing
    const modal = document.getElementById("edit-account-modal");
    if (modal) {
      modal.dataset.accountId = account.id;
    }

    // Show modal
    ModalUtils.showModal("edit-account-modal");
  },

  /**
   * Hide edit account modal
   */
  hideEditAccountModal(): void {
    ModalUtils.hideModal("edit-account-modal");
  },

  /**
   * Show import modal
   */
  showImportModal(): void {
    ModalUtils.showModal("import-accounts-modal", {
      clearFields: ["import-file-input", "import-json-textarea"],
    });
  },

  /**
   * Hide import modal
   */
  hideImportModal(): void {
    ModalUtils.hideModal("import-accounts-modal");
  },

  /**
   * Handle adding a new account
   */
  async handleAddAccount(): Promise<void> {
    const nameDisplay = document.getElementById(
      "account-name-display"
    ) as HTMLInputElement;
    const nicknameInput = document.getElementById(
      "account-nickname-input"
    ) as HTMLInputElement;
    const urlInput = document.getElementById(
      "account-url-input"
    ) as HTMLInputElement;
    const confirmBtn = document.getElementById("confirm-add-account-btn");

    if (!urlInput.value.trim()) {
      this.showMessage(
        browser.i18n.getMessage("errorEnterProfileUrl"),
        "error"
      );
      return;
    }

    if (!ArcadeApiService.isValidProfileUrl(urlInput.value)) {
      this.showMessage(
        browser.i18n.getMessage("errorInvalidProfileUrl"),
        "error"
      );
      return;
    }

    // Check if account already exists
    try {
      const existingAccount = await AccountService.isAccountExists(
        urlInput.value.trim()
      );
      if (existingAccount) {
        // Show error UI with switch button
        const errorDiv = document.getElementById("error-profile");
        const errorTitle = document.getElementById("error-title");
        const errorMessage = document.getElementById("profile-error-message");
        if (errorDiv && errorTitle && errorMessage) {
          errorDiv.classList.remove("hidden");
          errorTitle.textContent = browser.i18n.getMessage(
            "errorAccountExistsTitle"
          );
          errorMessage.textContent = browser.i18n.getMessage(
            "errorAccountExistsMsg",
            [existingAccount.name]
          );
          this.showSwitchToExistingAccountOption(existingAccount);
        }
        return;
      }
    } catch (error) {
      console.error("Error checking existing account:", error);
    }

    // Validate that we have a name from the API
    if (!nameDisplay.value.trim()) {
      this.showMessage(
        browser.i18n.getMessage("errorNoNameFromProfile"),
        "error"
      );
      return;
    }

    if (confirmBtn) {
      confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>${browser.i18n.getMessage(
        "labelAdding"
      )}`;
      (confirmBtn as HTMLButtonElement).disabled = true;
    }

    try {
      // Fetch arcade data for the new account (re-fetch to ensure fresh data)
      const arcadeData = await ArcadeApiService.fetchArcadeData(urlInput.value);

      // Use name from API (already populated in nameDisplay)
      const accountName = nameDisplay.value.trim();

      const newAccount = await AccountService.createAccount({
        name: accountName,
        nickname: nicknameInput.value.trim() || undefined,
        profileUrl: urlInput.value.trim(),
        arcadeData: arcadeData || undefined,
      });

      await this.loadAccounts();

      // Switch to new account
      await this.switchAccount(newAccount.id);

      this.hideAddAccountModal();
      this.showMessage(
        browser.i18n.getMessage("successAccountAdded"),
        "success"
      );

      // Refresh badge (switchAccount will already attempt, but call again as fallback)
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Failed to refresh badge after handleAddAccount:", err);
      }
    } catch (error) {
      console.error("Error adding account:", error);

      // Show specific error message if account already exists
      let errorMessage = browser.i18n.getMessage("errorAddAccountGeneric");
      if (error instanceof Error && error.message.includes("already exists")) {
        errorMessage = browser.i18n.getMessage("errorAccountExistsMsgSimple");
      }
      this.showMessage(errorMessage, "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.innerHTML = `<i class="fa-solid fa-plus mr-1"></i>${browser.i18n.getMessage(
          "labelAddAccount"
        )}`;
        (confirmBtn as HTMLButtonElement).disabled = false;
      }
    }
  },

  /**
   * Handle editing current account
   */
  async handleEditAccount(): Promise<void> {
    const modal = document.getElementById("edit-account-modal");
    const accountId = modal?.dataset.accountId;

    if (!accountId) return;

    const nicknameInput = document.getElementById(
      "edit-account-nickname-input"
    ) as HTMLInputElement;

    const facilitatorToggle = document.getElementById(
      "edit-account-facilitator-toggle"
    ) as HTMLInputElement;

    try {
      await AccountService.updateAccount(accountId, {
        nickname: nicknameInput.value.trim() || undefined,
        facilitatorProgram: facilitatorToggle.checked,
      });

      await this.loadAccounts();
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Failed to refresh badge after editAccount:", err);
      }
      this.hideEditAccountModal();
      this.showMessage(
        browser.i18n.getMessage("successNicknameUpdated"),
        "success"
      );
    } catch (error) {
      console.error("Error updating account:", error);
      this.showMessage(
        browser.i18n.getMessage("errorUpdatingAccountGeneric"),
        "error"
      );
    }
  },

  /**
   * Handle deleting account
   */
  async handleDeleteAccount(accountId?: string): Promise<void> {
    const account = accountId
      ? await AccountService.getAccountById(accountId)
      : await AccountService.getActiveAccount();

    if (!account) return;

    const allAccounts = await AccountService.getAllAccounts();
    if (allAccounts.length <= 1) {
      this.showMessage(
        browser.i18n.getMessage("errorCannotDeleteLastAccount"),
        "error"
      );
      return;
    }

    // Show a custom confirmation modal instead of window.confirm
    const confirmed = await new Promise<boolean>((resolve) => {
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50";
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <div class="mb-4 text-gray-800 font-semibold">
            Are you sure you want to delete the account "${account.name}"?
          </div>
          <div class="flex justify-end space-x-2">
            <button id="cancel-delete-account-btn" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
            <button id="confirm-delete-account-btn" class="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      /**
       * Remove the confirmation modal from the DOM
       */
      const cleanup = () => {
        document.body.removeChild(modal);
      };

      modal
        .querySelector("#cancel-delete-account-btn")
        ?.addEventListener("click", () => {
          cleanup();
          resolve(false);
        });
      modal
        .querySelector("#confirm-delete-account-btn")
        ?.addEventListener("click", () => {
          cleanup();
          resolve(true);
        });
    });

    if (!confirmed) {
      return;
    }

    try {
      await AccountService.deleteAccount(account.id);
      await this.loadAccounts();
      try {
        await StorageService.refreshBadgeForActiveAccount();
      } catch (err) {
        console.debug("Failed to refresh badge after deleteAccount:", err);
      }
      this.showMessage(
        browser.i18n.getMessage("successAccountDeleted"),
        "success"
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      this.showMessage(
        browser.i18n.getMessage("errorDeletingAccountGeneric"),
        "error"
      );
    }
  },

  /**
   * Handle exporting accounts
   */
  async handleExportAccounts(): Promise<void> {
    try {
      const data = await AccountService.exportAccounts();

      // Create and download file
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gcskills-accounts-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showMessage(
        browser.i18n.getMessage("successDataExported"),
        "success"
      );
    } catch (error) {
      console.error("Error exporting accounts:", error);
      this.showMessage(browser.i18n.getMessage("errorExportingData"), "error");
    }
  },

  /**
   * Handle importing accounts
   */
  async handleImportAccounts(): Promise<void> {
    const textArea = document.getElementById(
      "import-json-textarea"
    ) as HTMLTextAreaElement;
    const confirmBtn = document.getElementById("confirm-import-btn");

    if (!textArea.value.trim()) {
      this.showMessage(browser.i18n.getMessage("errorNoImportData"), "error");
      return;
    }

    if (confirmBtn) {
      confirmBtn.textContent = "Importing...";
      (confirmBtn as HTMLButtonElement).disabled = true;
    }

    try {
      const success = await AccountService.importAccounts(textArea.value);

      if (success) {
        await this.loadAccounts();
        this.hideImportModal();
        this.showMessage(
          browser.i18n.getMessage("successDataImported"),
          "success"
        );

        // Reload page to refresh UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        this.showMessage(
          browser.i18n.getMessage("errorInvalidImportData"),
          "error"
        );
      }
    } catch (error) {
      console.error("Error importing accounts:", error);
      this.showMessage(browser.i18n.getMessage("errorImportingData"), "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.textContent = "Import data";
        (confirmBtn as HTMLButtonElement).disabled = false;
      }
    }
  },

  /**
   * Update account preview with real data
   */
  updateAccountPreview(
    account: Account,
    userDetail: UserDetail,
    arcadeData: ArcadeData
  ): void {
    PreviewUtils.updateAccountPreview(account, userDetail, arcadeData);
  },

  /**
   * Show a temporary message
   */
  showMessage(message: string, type: "success" | "error" = "success"): void {
    const messageElement = document.createElement("div");
    messageElement.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  },
};

export default OptionsService;
