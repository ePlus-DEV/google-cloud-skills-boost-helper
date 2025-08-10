import { UAParser } from "ua-parser-js";
import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import AccountService from "./accountService";
import PopupUIService from "./popupUIService";
import MarkdownService from "./markdownService";
import { MARKDOWN_CONFIG } from "../utils/config";
import type { ArcadeData, Account } from "../types";

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
    await this.loadAccounts();
    this.setupAccountEventListeners();
  },

  /**
   * Load and populate accounts in the selector
   */
  async loadAccounts(): Promise<void> {
    const selector = document.getElementById("account-selector") as HTMLSelectElement;
    if (!selector) return;

    // Clear existing options except the first one
    while (selector.children.length > 1) {
      selector.removeChild(selector.lastChild as Node);
    }

    // Load accounts
    const accounts = await AccountService.getAllAccounts();
    const activeAccount = await AccountService.getActiveAccount();

    accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account.id;
      option.textContent = account.nickname || account.name;
      
      if (activeAccount && account.id === activeAccount.id) {
        option.selected = true;
      }

      selector.appendChild(option);
    });

    // Update current account info
    if (activeAccount) {
      this.updateCurrentAccountInfo(activeAccount);
    }
  },

  /**
   * Update current account info display
   */
  updateCurrentAccountInfo(account: Account): void {
    const infoContainer = document.getElementById("current-account-info");
    const avatarImg = document.getElementById("account-avatar") as HTMLImageElement;
    const displayName = document.getElementById("account-display-name");
    const profileUrl = document.getElementById("account-profile-url");
    const profileUrlInput = document.getElementById("public-profile-url") as HTMLInputElement;

    if (!infoContainer || !displayName || !profileUrl) return;

    infoContainer.classList.remove("hidden");
    displayName.textContent = account.nickname || account.name;
    profileUrl.textContent = account.profileUrl;

    // Update profile URL input
    if (profileUrlInput) {
      profileUrlInput.value = account.profileUrl;
    }

    // Update avatar if available
    if (account.arcadeData?.userDetails?.profileImage && avatarImg) {
      avatarImg.src = account.arcadeData.userDetails.profileImage;
      avatarImg.style.display = "block";
    } else if (avatarImg) {
      avatarImg.style.display = "none";
    }
  },

  /**
   * Setup account-related event listeners
   */
  setupAccountEventListeners(): void {
    // Account selector change
    const selector = document.getElementById("account-selector") as HTMLSelectElement;
    if (selector) {
      selector.addEventListener("change", async (e) => {
        const target = e.target as HTMLSelectElement;
        if (target.value) {
          await this.switchAccount(target.value);
        }
      });
    }

    // Add account button
    const addBtn = document.getElementById("add-account-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.showAddAccountModal();
      });
    }

    // Edit account button
    const editBtn = document.getElementById("edit-account-btn");
    if (editBtn) {
      editBtn.addEventListener("click", async () => {
        await this.showEditAccountModal();
      });
    }

    // Delete account button
    const deleteBtn = document.getElementById("delete-account-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        await this.handleDeleteAccount();
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

    // Setup modal event listeners
    this.setupModalEventListeners();
  },

  /**
   * Switch to a different account
   */
  async switchAccount(accountId: string): Promise<void> {
    const success = await AccountService.setActiveAccount(accountId);
    if (success) {
      const account = await AccountService.getAccountById(accountId);
      if (account) {
        this.updateCurrentAccountInfo(account);
        
        // Update arcade data if available
        if (account.arcadeData) {
          PopupUIService.updateOptionsUI(account.arcadeData);
        } else {
          PopupUIService.toggleElementVisibility("#arcade-points", false);
        }
      }
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
    await this.loadAccounts();
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
    const modal = document.getElementById("add-account-modal");
    const closeBtn = document.getElementById("close-modal-btn");
    const cancelBtn = document.getElementById("cancel-add-account-btn");
    const confirmBtn = document.getElementById("confirm-add-account-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideAddAccountModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.hideAddAccountModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        await this.handleAddAccount();
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideAddAccountModal();
        }
      });
    }
  },

  /**
   * Setup edit account modal events
   */
  setupEditAccountModalEvents(): void {
    const modal = document.getElementById("edit-account-modal");
    const closeBtn = document.getElementById("close-edit-modal-btn");
    const cancelBtn = document.getElementById("cancel-edit-account-btn");
    const confirmBtn = document.getElementById("confirm-edit-account-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideEditAccountModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.hideEditAccountModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        await this.handleEditAccount();
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideEditAccountModal();
        }
      });
    }
  },

  /**
   * Setup import modal events
   */
  setupImportModalEvents(): void {
    const modal = document.getElementById("import-accounts-modal");
    const closeBtn = document.getElementById("close-import-modal-btn");
    const cancelBtn = document.getElementById("cancel-import-btn");
    const confirmBtn = document.getElementById("confirm-import-btn");
    const fileInput = document.getElementById("import-file-input") as HTMLInputElement;
    const textArea = document.getElementById("import-json-textarea") as HTMLTextAreaElement;

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideImportModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.hideImportModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        await this.handleImportAccounts();
      });
    }

    // File input change
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && textArea) {
          const reader = new FileReader();
          reader.onload = (e) => {
            textArea.value = e.target?.result as string;
          };
          reader.readAsText(file);
        }
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideImportModal();
        }
      });
    }
  },

  /**
   * Show add account modal
   */
  showAddAccountModal(): void {
    const modal = document.getElementById("add-account-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      
      // Clear form
      const nameInput = document.getElementById("account-name-input") as HTMLInputElement;
      const nicknameInput = document.getElementById("account-nickname-input") as HTMLInputElement;
      const urlInput = document.getElementById("account-url-input") as HTMLInputElement;
      
      if (nameInput) nameInput.value = "";
      if (nicknameInput) nicknameInput.value = "";
      if (urlInput) urlInput.value = "";
    }
  },

  /**
   * Hide add account modal
   */
  hideAddAccountModal(): void {
    const modal = document.getElementById("add-account-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  /**
   * Show edit account modal
   */
  async showEditAccountModal(): Promise<void> {
    const activeAccount = await AccountService.getActiveAccount();
    if (!activeAccount) return;

    const modal = document.getElementById("edit-account-modal");
    const nameInput = document.getElementById("edit-account-name-input") as HTMLInputElement;
    const nicknameInput = document.getElementById("edit-account-nickname-input") as HTMLInputElement;

    if (modal && nameInput && nicknameInput) {
      nameInput.value = activeAccount.name;
      nicknameInput.value = activeAccount.nickname || "";

      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  /**
   * Hide edit account modal
   */
  hideEditAccountModal(): void {
    const modal = document.getElementById("edit-account-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  /**
   * Show import modal
   */
  showImportModal(): void {
    const modal = document.getElementById("import-accounts-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      
      // Clear form
      const fileInput = document.getElementById("import-file-input") as HTMLInputElement;
      const textArea = document.getElementById("import-json-textarea") as HTMLTextAreaElement;
      
      if (fileInput) fileInput.value = "";
      if (textArea) textArea.value = "";
    }
  },

  /**
   * Hide import modal
   */
  hideImportModal(): void {
    const modal = document.getElementById("import-accounts-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  /**
   * Handle adding a new account
   */
  async handleAddAccount(): Promise<void> {
    const nameInput = document.getElementById("account-name-input") as HTMLInputElement;
    const nicknameInput = document.getElementById("account-nickname-input") as HTMLInputElement;
    const urlInput = document.getElementById("account-url-input") as HTMLInputElement;
    const confirmBtn = document.getElementById("confirm-add-account-btn");

    if (!urlInput.value.trim()) {
      this.showMessage("Vui lòng nhập URL profile!", "error");
      return;
    }

    if (!ArcadeApiService.isValidProfileUrl(urlInput.value)) {
      this.showMessage("URL profile không hợp lệ!", "error");
      return;
    }

    if (confirmBtn) {
      confirmBtn.textContent = "Đang thêm...";
      (confirmBtn as HTMLButtonElement).disabled = true;
    }

    try {
      // Fetch arcade data for the new account
      const arcadeData = await ArcadeApiService.fetchArcadeData(urlInput.value);
      
      const newAccount = await AccountService.createAccount({
        name: nameInput.value.trim() || undefined,
        nickname: nicknameInput.value.trim() || undefined,
        profileUrl: urlInput.value.trim(),
        arcadeData: arcadeData || undefined,
      });

      await this.loadAccounts();
      
      // Switch to new account
      await this.switchAccount(newAccount.id);
      
      this.hideAddAccountModal();
      this.showMessage("Đã thêm tài khoản thành công!", "success");
      
    } catch (error) {
      console.error("Error adding account:", error);
      this.showMessage("Có lỗi xảy ra khi thêm tài khoản. Vui lòng thử lại!", "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.textContent = "Thêm tài khoản";
        (confirmBtn as HTMLButtonElement).disabled = false;
      }
    }
  },

  /**
   * Handle editing current account
   */
  async handleEditAccount(): Promise<void> {
    const activeAccount = await AccountService.getActiveAccount();
    if (!activeAccount) return;

    const nameInput = document.getElementById("edit-account-name-input") as HTMLInputElement;
    const nicknameInput = document.getElementById("edit-account-nickname-input") as HTMLInputElement;

    if (!nameInput.value.trim()) {
      this.showMessage("Tên hiển thị không được để trống!", "error");
      return;
    }

    try {
      await AccountService.updateAccount(activeAccount.id, {
        name: nameInput.value.trim(),
        nickname: nicknameInput.value.trim() || undefined,
      });
      
      await this.loadAccounts();
      this.hideEditAccountModal();
      this.showMessage("Đã cập nhật tài khoản thành công!", "success");
    } catch (error) {
      console.error("Error updating account:", error);
      this.showMessage("Có lỗi xảy ra khi cập nhật tài khoản!", "error");
    }
  },

  /**
   * Handle deleting current account
   */
  async handleDeleteAccount(): Promise<void> {
    const activeAccount = await AccountService.getActiveAccount();
    if (!activeAccount) return;

    const allAccounts = await AccountService.getAllAccounts();
    if (allAccounts.length <= 1) {
      this.showMessage("Không thể xóa tài khoản cuối cùng!", "error");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${activeAccount.name}"?`)) {
      return;
    }

    try {
      await AccountService.deleteAccount(activeAccount.id);
      await this.loadAccounts();
      this.showMessage("Đã xóa tài khoản thành công!", "success");
      
      // Reload page since active account changed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting account:", error);
      this.showMessage("Có lỗi xảy ra khi xóa tài khoản!", "error");
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
      link.download = `gcskills-accounts-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      this.showMessage("Đã xuất dữ liệu thành công!", "success");
    } catch (error) {
      console.error("Error exporting accounts:", error);
      this.showMessage("Có lỗi xảy ra khi xuất dữ liệu!", "error");
    }
  },

  /**
   * Handle importing accounts
   */
  async handleImportAccounts(): Promise<void> {
    const textArea = document.getElementById("import-json-textarea") as HTMLTextAreaElement;
    const confirmBtn = document.getElementById("confirm-import-btn");

    if (!textArea.value.trim()) {
      this.showMessage("Vui lòng chọn file hoặc dán nội dung JSON!", "error");
      return;
    }

    if (confirmBtn) {
      confirmBtn.textContent = "Đang nhập...";
      (confirmBtn as HTMLButtonElement).disabled = true;
    }

    try {
      const success = await AccountService.importAccounts(textArea.value);
      
      if (success) {
        await this.loadAccounts();
        this.hideImportModal();
        this.showMessage("Đã nhập dữ liệu thành công!", "success");
        
        // Reload page to refresh UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        this.showMessage("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!", "error");
      }
    } catch (error) {
      console.error("Error importing accounts:", error);
      this.showMessage("Có lỗi xảy ra khi nhập dữ liệu!", "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.textContent = "Nhập dữ liệu";
        (confirmBtn as HTMLButtonElement).disabled = false;
      }
    }
  },

  /**
   * Show a temporary message
   */
  showMessage(message: string, type: "success" | "error" = "success"): void {
    const messageElement = document.createElement("div");
    messageElement.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === "success" 
        ? "bg-green-500 text-white" 
        : "bg-red-500 text-white"
    }`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  },
};

export default OptionsService;
