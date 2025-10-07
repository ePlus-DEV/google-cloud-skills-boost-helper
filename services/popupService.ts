import ArcadeApiService from "./arcadeApiService";
import StorageService from "./storageService";
import AccountService from "./accountService";
import PopupUIService from "./popupUIService";
import BadgeService from "./badgeService";
import MarkdownService from "./markdownService";
import { MARKDOWN_CONFIG } from "../utils/config";
import type { Account } from "../types";
import sendRuntimeMessage from "./runtimeMessage";
const PopupService = {
  profileUrl: "",
  currentAccount: null as Account | null,
  SPINNER_CLASS: "animate-spin",

  async initialize(): Promise<void> {
    // Initialize migration first
    await StorageService.initializeMigration();

    // Initialize markdown service
    await this.initializeMarkdown();

    // Initialize account management
    await this.initializeAccountManagement();

    // Load current account and data
    this.currentAccount = await AccountService.getActiveAccount();
    this.profileUrl = await StorageService.getProfileUrl();

    // Load existing data
    const arcadeData = await StorageService.getArcadeData();

    if (!this.profileUrl && !this.currentAccount) {
      this.showAuthScreen();
    } else if (arcadeData) {
      // Ensure lastUpdated is set for existing data
      if (!arcadeData.lastUpdated) {
        arcadeData.lastUpdated = new Date().toISOString();
      }
      PopupUIService.updateMainUI(
        arcadeData,
        Boolean(this.currentAccount?.facilitatorProgram),
      );
      BadgeService.renderBadges(arcadeData.badges || []);
    } else {
      // Profile URL exists but no data - show loading state and try to fetch
      PopupUIService.showLoadingState();
      // Update milestone section even without arcade data
      await PopupUIService.updateMilestoneSection();
      this.refreshData();
    }

    this.setupEventListeners();
  },

  /**
   * Initialize account management in popup
   */
  async initializeAccountManagement(): Promise<void> {
    await this.loadPopupAccounts();
    this.setupAccountSelectorEvents();
  },

  /**
   * Load accounts into popup selector
   */
  async loadPopupAccounts(): Promise<void> {
    const accountList = document.getElementById("account-list");
    const accountCount = document.getElementById("account-count");
    if (!accountList) return;

    // Clear existing options
    accountList.innerHTML = "";

    const accounts = await AccountService.getAllAccounts();
    const activeAccount = await AccountService.getActiveAccount();

    // Update account count if present
    if (accountCount) {
      accountCount.textContent = accounts.length.toString();
    }

    for (const account of accounts) {
      const displayText = this.createAccountDisplayText(account);
      const userDetail = account.arcadeData?.userDetails
        ? AccountService.extractUserDetails(account.arcadeData)
        : null;
      const profileImage = userDetail?.profileImage;
      const isActive = Boolean(
        activeAccount && account.id === activeAccount.id,
      );

      const accountItem = this.createAccountItem(
        account,
        displayText,
        profileImage,
        isActive,
      );

      accountItem.addEventListener("click", () => {
        if (!isActive) {
          this.switchAccount(account.id);
          this.hideAccountDropdown();
        }
      });

      accountList.appendChild(accountItem);
    }

    if (activeAccount) {
      this.updatePopupAccountInfo(activeAccount);
      this.updateUserNameFromAccount(activeAccount);
    }
  },

  /**
   * Create display text for an account with priority: nickname > userName from arcadeData > account name
   */
  createAccountDisplayText(account: Account): string {
    let displayText = account.nickname;

    if (!displayText && account.arcadeData?.userDetails) {
      const userDetail = AccountService.extractUserDetails(account.arcadeData);
      displayText = userDetail?.userName;
    }

    if (!displayText) {
      displayText = account.name;
    }

    return displayText;
  },

  /**
   * Create avatar HTML string given display text and optional profile image
   */
  createAvatarHTML(displayText: string, profileImage?: string | null): string {
    if (profileImage) {
      return `<img src="${profileImage}" alt="${displayText}" class="w-6 h-6 rounded-full object-cover mr-2 flex-shrink-0" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0" style="display: none;">
             ${displayText.charAt(0).toUpperCase()}
           </div>`;
    }

    return `<div class="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
             ${displayText.charAt(0).toUpperCase()}
           </div>`;
  },

  /**
   * Create account item element for the dropdown
   */
  createAccountItem(
    account: Account,
    displayText: string,
    profileImage: string | undefined | null,
    isActive: boolean,
  ): HTMLElement {
    const accountItem = document.createElement("div");
    accountItem.className =
      "px-3 py-2 hover:bg-slate-700/80 cursor-pointer transition-all duration-200 flex items-center justify-between group border-b border-white/10 last:border-b-0";
    accountItem.dataset.accountId = account.id;

    const avatarHTML = this.createAvatarHTML(displayText, profileImage);

    accountItem.innerHTML = `
      <div class="flex items-center flex-1 min-w-0">
        ${avatarHTML}
        <div class="min-w-0 flex-1">
          <div class="text-white/95 text-sm font-medium truncate">${displayText}</div>
          ${
            account.name !== displayText
              ? `<div class="text-white/70 text-xs truncate">${account.name}</div>`
              : ""
          }
        </div>
      </div>
      <div class="flex items-center">
        ${
          isActive
            ? '<div class="bg-green-500/30 text-green-300 text-xs px-2 py-0.5 rounded flex items-center"><i class="fa-solid fa-check mr-1"></i>Active</div>'
            : '<i class="fa-solid fa-arrow-right text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity"></i>'
        }
      </div>
    `;

    if (isActive) {
      accountItem.classList.add("bg-slate-700/60");
    }

    return accountItem;
  },

  /**
   * Update popup account info display
   */
  updatePopupAccountInfo(account: Account): void {
    const infoContainer = document.getElementById("popup-current-account-info");
    const accountUrl = document.getElementById("popup-account-url");

    if (!infoContainer || !accountUrl) return;

    infoContainer.classList.remove("hidden");
    accountUrl.textContent = account.profileUrl;
  },

  /**
   * Setup account selector events
   */
  setupAccountSelectorEvents(): void {
    // Account switcher button
    const accountSwitcherBtn = document.getElementById("account-switcher-btn");
    const accountDropdown = document.getElementById("account-dropdown");

    if (accountSwitcherBtn && accountDropdown) {
      accountSwitcherBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleAccountDropdown();
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (
          !accountSwitcherBtn.contains(target) &&
          !accountDropdown.contains(target)
        ) {
          this.hideAccountDropdown();
        }
      });
    }

    // Copy profile URL functionality with timeout to ensure DOM is ready
    setTimeout(() => {
      const copyUrlBtn = document.getElementById("copy-profile-url");
      if (copyUrlBtn) {
        // Remove any existing listeners
        const newCopyBtn = copyUrlBtn.cloneNode(true) as HTMLElement;
        copyUrlBtn.parentNode?.replaceChild(newCopyBtn, copyUrlBtn);

        newCopyBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get profile URL from current account or fallback to stored profileUrl
          let profileUrl = this.profileUrl;
          if (!profileUrl && this.currentAccount) {
            profileUrl = this.currentAccount.profileUrl;
          }

          if (profileUrl) {
            try {
              await navigator.clipboard.writeText(profileUrl);

              // Show visual feedback - just change icon for compact button
              const originalIcon = newCopyBtn.innerHTML;
              newCopyBtn.innerHTML =
                '<i class="fa-solid fa-check text-xs"></i>';
              newCopyBtn.classList.add(
                "text-green-400",
                "bg-green-400/20",
                "border-green-400/50",
              );
              newCopyBtn.classList.remove(
                "text-blue-400",
                "bg-blue-400/20",
                "border-blue-400/30",
              );
              newCopyBtn.title = "Copied!";

              setTimeout(() => {
                newCopyBtn.innerHTML = originalIcon;
                newCopyBtn.classList.remove(
                  "text-green-400",
                  "bg-green-400/20",
                  "border-green-400/50",
                );
                newCopyBtn.classList.add(
                  "text-blue-400",
                  "bg-blue-400/20",
                  "border-blue-400/30",
                );
                newCopyBtn.title = "Copy Profile URL";
              }, 1500);
            } catch (error) {
              console.error("DEBUG: Failed to copy URL:", error);

              // Show error feedback
              const originalIcon = newCopyBtn.innerHTML;
              newCopyBtn.innerHTML =
                '<i class="fa-solid fa-times text-xs"></i>';
              newCopyBtn.classList.add(
                "text-red-400",
                "bg-red-400/20",
                "border-red-400/50",
              );
              newCopyBtn.classList.remove(
                "text-blue-400",
                "bg-blue-400/20",
                "border-blue-400/30",
              );
              newCopyBtn.title = "Failed to copy";

              setTimeout(() => {
                newCopyBtn.innerHTML = originalIcon;
                newCopyBtn.classList.remove(
                  "text-red-400",
                  "bg-red-400/20",
                  "border-red-400/50",
                );
                newCopyBtn.classList.add(
                  "text-blue-400",
                  "bg-blue-400/20",
                  "border-blue-400/30",
                );
                newCopyBtn.title = "Copy Profile URL";
              }, 1500);
            }
          } else {
            // No URL available
            const originalIcon = newCopyBtn.innerHTML;
            newCopyBtn.innerHTML =
              '<i class="fa-solid fa-exclamation text-xs"></i>';
            newCopyBtn.classList.add(
              "text-yellow-400",
              "bg-yellow-400/20",
              "border-yellow-400/50",
            );
            newCopyBtn.classList.remove(
              "text-blue-400",
              "bg-blue-400/20",
              "border-blue-400/30",
            );
            newCopyBtn.title = "No URL available";

            setTimeout(() => {
              newCopyBtn.innerHTML = originalIcon;
              newCopyBtn.classList.remove(
                "text-yellow-400",
                "bg-yellow-400/20",
                "border-yellow-400/50",
              );
              newCopyBtn.classList.add(
                "text-blue-400",
                "bg-blue-400/20",
                "border-blue-400/30",
              );
              newCopyBtn.title = "Copy Profile URL";
            }, 1500);
          }
        });
      } else {
        // Optionally handle missing copy button here (e.g., show UI feedback)
      }
    }, 1000); // Wait 1 second to ensure DOM is ready
  },

  /**
   * Toggle account dropdown visibility
   */
  toggleAccountDropdown(): void {
    const dropdown = document.getElementById("account-dropdown");
    if (!dropdown) return;

    if (dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("hidden");
      // Focus on dropdown for better accessibility
      dropdown.focus();
    } else {
      dropdown.classList.add("hidden");
    }
  },

  /**
   * Hide account dropdown
   */
  hideAccountDropdown(): void {
    const dropdown = document.getElementById("account-dropdown");
    if (dropdown && !dropdown.classList.contains("hidden")) {
      dropdown.classList.add("hidden");
    }
  },

  /**
   * Update user name display from account data
   */
  updateUserNameFromAccount(account: Account): void {
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      // Priority: nickname > userName from arcadeData > account name
      let displayName = account.nickname;

      if (!displayName && account.arcadeData?.userDetails) {
        const userDetail = AccountService.extractUserDetails(
          account.arcadeData,
        );
        displayName = userDetail?.userName;
      }

      if (!displayName) {
        displayName = account.name;
      }

      // Add transition effect when changing name
      userNameElement.style.transform = "scale(0.95)";
      userNameElement.style.opacity = "0.7";

      setTimeout(() => {
        userNameElement.textContent = displayName || "Anonymous";
        userNameElement.title = `Account: ${account.name}${
          account.nickname ? ` (${account.nickname})` : ""
        }`;

        // Restore normal appearance with animation
        userNameElement.style.transform = "scale(1)";
        userNameElement.style.opacity = "1";
      }, 150);
    }
  },

  /**
   * Switch to a different account
   */
  async switchAccount(accountId: string): Promise<void> {
    const success = await AccountService.setActiveAccount(accountId);
    if (success) {
      const account = await AccountService.getAccountById(accountId);
      if (account) {
        this.currentAccount = account;
        this.profileUrl = account.profileUrl;
        this.updatePopupAccountInfo(account);

        // Update the user name immediately with account data
        this.updateUserNameFromAccount(account);

        // Reload account list to update active status
        await this.loadPopupAccounts();

        // Refresh data for the new account
        if (account.arcadeData) {
          PopupUIService.updateMainUI(
            account.arcadeData,
            Boolean(account.facilitatorProgram),
          );
          BadgeService.renderBadges(account.arcadeData.badges || []);
        } else {
          PopupUIService.showLoadingState();
          await this.refreshData();
        }

        // Request background to refresh the toolbar badge for the newly active account
        try {
          await sendRuntimeMessage({ type: "refreshBadge" });
        } catch (err) {
          console.debug(
            "Failed to request badge refresh after account switch:",
            err,
          );
        }

        // Always update milestone section when switching accounts
        await PopupUIService.updateMilestoneSection();
      }
    }
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
        // Save to both new and old storage systems
        await StorageService.saveArcadeData(arcadeData);

        // Update current account if exists
        if (this.currentAccount) {
          await AccountService.updateAccountArcadeData(
            this.currentAccount.id,
            arcadeData,
          );
        }

        PopupUIService.updateMainUI(
          arcadeData,
          Boolean(this.currentAccount?.facilitatorProgram),
        );
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
    for (const button of document.querySelectorAll(
      ".refresh-button",
    ) as NodeListOf<HTMLButtonElement>) {
      button.addEventListener("click", () => this.refreshData());
    }

    // Settings buttons
    for (const button of document.querySelectorAll(
      ".settings-button",
    ) as NodeListOf<HTMLButtonElement>) {
      button.addEventListener("click", () => {
        window.open(browser.runtime.getURL("/options.html"), "_blank");
      });
    }

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
