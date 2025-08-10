/**
 * UI components for account management functionality
 */
import { AccountService, ArcadeApiService } from "../services";
import type { Account, CreateAccountOptions } from "../types";

const AccountUIService = {
  /**
   * Create account switcher UI component
   */
  createAccountSwitcher(): HTMLElement {
    const switcher = document.createElement("div");
    switcher.className =
      "account-switcher bg-gradient-to-r from-purple-100 to-indigo-200 shadow-md rounded-lg p-4 border border-indigo-300 mb-4";
    switcher.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h4 class="text-lg font-bold text-gray-800">
          <i class="fa-solid fa-user-group mr-2 text-indigo-600"></i>
          Quản lý tài khoản
        </h4>
        <button id="add-account-btn" class="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-medium px-3 py-1 rounded-lg shadow-md transition duration-200 text-sm">
          <i class="fa-solid fa-plus mr-1"></i>
          Thêm tài khoản
        </button>
      </div>
      
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-2">Tài khoản hiện tại:</label>
        <div class="relative">
          <select id="account-selector" class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
            <option value="">Chọn tài khoản...</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <i class="fa-solid fa-chevron-down text-gray-400"></i>
          </div>
        </div>
      </div>

      <div id="current-account-info" class="hidden bg-white rounded-lg p-3 border border-gray-200">
        <div class="flex items-center space-x-3">
          <img id="account-avatar" src="" alt="Avatar" class="w-8 h-8 rounded-full border border-gray-300" style="display: none;">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900" id="account-display-name"></div>
            <div class="text-xs text-gray-500" id="account-profile-url"></div>
          </div>
          <div class="flex space-x-1">
            <button id="edit-account-btn" class="text-blue-600 hover:text-blue-800 transition duration-200" title="Sửa tài khoản">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button id="delete-account-btn" class="text-red-600 hover:text-red-800 transition duration-200" title="Xóa tài khoản">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-3 flex space-x-2">
        <button id="export-accounts-btn" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium px-3 py-2 rounded-lg shadow-md transition duration-200 text-sm">
          <i class="fa-solid fa-download mr-1"></i>
          Xuất
        </button>
        <button id="import-accounts-btn" class="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-medium px-3 py-2 rounded-lg shadow-md transition duration-200 text-sm">
          <i class="fa-solid fa-upload mr-1"></i>
          Nhập
        </button>
      </div>
    `;

    return switcher;
  },

  /**
   * Create add account modal
   */
  createAddAccountModal(): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "add-account-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Thêm tài khoản mới</h3>
          <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị (tùy chọn):</label>
            <input type="text" id="account-name-input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Nhập tên hiển thị...">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Biệt danh (tùy chọn):</label>
            <input type="text" id="account-nickname-input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Nhập biệt danh...">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL Profile:</label>
            <input type="url" id="account-url-input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="https://www.cloudskillsboost.google/public_profiles/..." required>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button id="cancel-add-account-btn" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition duration-200">
            Hủy
          </button>
          <button id="confirm-add-account-btn" class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-medium px-4 py-2 rounded-lg transition duration-200">
            Thêm tài khoản
          </button>
        </div>
      </div>
    `;

    return modal;
  },

  /**
   * Create import accounts modal
   */
  createImportModal(): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "import-accounts-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Nhập dữ liệu tài khoản</h3>
          <button id="close-import-modal-btn" class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn file JSON:</label>
            <input type="file" id="import-file-input" accept=".json" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hoặc dán nội dung JSON:</label>
            <textarea id="import-json-textarea" rows="8" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder='{"accounts": {...}, "settings": {...}}'></textarea>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button id="cancel-import-btn" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition duration-200">
            Hủy
          </button>
          <button id="confirm-import-btn" class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-medium px-4 py-2 rounded-lg transition duration-200">
            Nhập dữ liệu
          </button>
        </div>
      </div>
    `;

    return modal;
  },

  /**
   * Initialize account switcher
   */
  async initializeAccountSwitcher(container: HTMLElement): Promise<void> {
    // Create and append account switcher
    const switcher = this.createAccountSwitcher();
    container.appendChild(switcher);

    // Create and append modals
    const addModal = this.createAddAccountModal();
    const importModal = this.createImportModal();
    document.body.appendChild(addModal);
    document.body.appendChild(importModal);

    // Load accounts and setup event listeners
    await this.loadAccounts();
    this.setupEventListeners();
  },

  /**
   * Load and populate accounts in the selector
   */
  async loadAccounts(): Promise<void> {
    const selector = document.getElementById(
      "account-selector"
    ) as HTMLSelectElement;
    if (!selector) return;

    // Clear existing options except the first one
    while (selector.children.length > 1) {
      const lastChild = selector.lastChild;
      if (lastChild) {
        selector.removeChild(lastChild);
      }
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
    const avatarImg = document.getElementById(
      "account-avatar"
    ) as HTMLImageElement;
    const displayName = document.getElementById("account-display-name");
    const profileUrl = document.getElementById("account-profile-url");

    if (!infoContainer || !displayName || !profileUrl) return;

    infoContainer.classList.remove("hidden");
    displayName.textContent = account.nickname || account.name;
    profileUrl.textContent = account.profileUrl;

    // Update avatar if available
    if (account.arcadeData?.userDetails?.profileImage && avatarImg) {
      avatarImg.src = account.arcadeData.userDetails.profileImage;
      avatarImg.style.display = "block";
    } else if (avatarImg) {
      avatarImg.style.display = "none";
    }
  },

  /**
   * Setup event listeners for account management
   */
  setupEventListeners(): void {
    // Account selector change
    const selector = document.getElementById(
      "account-selector"
    ) as HTMLSelectElement;
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

    // Add account modal events
    this.setupAddAccountModalEvents();

    // Import/Export events
    this.setupImportExportEvents();

    // Edit/Delete account events
    this.setupAccountManagementEvents();
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
   * Setup import/export events
   */
  setupImportExportEvents(): void {
    const exportBtn = document.getElementById("export-accounts-btn");
    const importBtn = document.getElementById("import-accounts-btn");

    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        await this.handleExportAccounts();
      });
    }

    if (importBtn) {
      importBtn.addEventListener("click", () => {
        this.showImportModal();
      });
    }

    // Import modal events
    this.setupImportModalEvents();
  },

  /**
   * Setup import modal events
   */
  setupImportModalEvents(): void {
    const modal = document.getElementById("import-accounts-modal");
    const closeBtn = document.getElementById("close-import-modal-btn");
    const cancelBtn = document.getElementById("cancel-import-btn");
    const confirmBtn = document.getElementById("confirm-import-btn");
    const fileInput = document.getElementById(
      "import-file-input"
    ) as HTMLInputElement;
    const textArea = document.getElementById(
      "import-json-textarea"
    ) as HTMLTextAreaElement;

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
   * Setup account management events (edit/delete)
   */
  setupAccountManagementEvents(): void {
    const editBtn = document.getElementById("edit-account-btn");
    const deleteBtn = document.getElementById("delete-account-btn");

    if (editBtn) {
      editBtn.addEventListener("click", async () => {
        await this.handleEditAccount();
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        await this.handleDeleteAccount();
      });
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
        this.updateCurrentAccountInfo(account);

        // Trigger a reload of the main UI
        window.location.reload();
      }
    }
  },

  /**
   * Show add account modal
   */
  showAddAccountModal(): void {
    const modal = document.getElementById("add-account-modal");
    if (modal) {
      modal.classList.remove("hidden");

      // Clear form
      const nameInput = document.getElementById(
        "account-name-input"
      ) as HTMLInputElement;
      const nicknameInput = document.getElementById(
        "account-nickname-input"
      ) as HTMLInputElement;
      const urlInput = document.getElementById(
        "account-url-input"
      ) as HTMLInputElement;

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
    }
  },

  /**
   * Handle adding a new account
   */
  async handleAddAccount(): Promise<void> {
    const nameInput = document.getElementById(
      "account-name-input"
    ) as HTMLInputElement;
    const nicknameInput = document.getElementById(
      "account-nickname-input"
    ) as HTMLInputElement;
    const urlInput = document.getElementById(
      "account-url-input"
    ) as HTMLInputElement;
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
      confirmBtn.setAttribute("disabled", "true");
    }

    try {
      // Fetch arcade data for the new account
      const arcadeData = await ArcadeApiService.fetchArcadeData(urlInput.value);

      const options: CreateAccountOptions = {
        name: nameInput.value.trim() || undefined,
        nickname: nicknameInput.value.trim() || undefined,
        profileUrl: urlInput.value.trim(),
        arcadeData: arcadeData || undefined,
      };

      const newAccount = await AccountService.createAccount(options);
      await this.loadAccounts();

      // Switch to new account
      await this.switchAccount(newAccount.id);

      this.hideAddAccountModal();

      // Show success message
      this.showMessage("Đã thêm tài khoản thành công!", "success");
    } catch (error) {
      console.error("Error adding account:", error);
      this.showMessage(
        "Có lỗi xảy ra khi thêm tài khoản. Vui lòng thử lại!",
        "error"
      );
    } finally {
      if (confirmBtn) {
        confirmBtn.textContent = "Thêm tài khoản";
        confirmBtn.removeAttribute("disabled");
      }
    }
  },

  /**
   * Show import modal
   */
  showImportModal(): void {
    const modal = document.getElementById("import-accounts-modal");
    if (modal) {
      modal.classList.remove("hidden");

      // Clear form
      const fileInput = document.getElementById(
        "import-file-input"
      ) as HTMLInputElement;
      const textArea = document.getElementById(
        "import-json-textarea"
      ) as HTMLTextAreaElement;

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
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `gcskills-accounts-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
    const textArea = document.getElementById(
      "import-json-textarea"
    ) as HTMLTextAreaElement;
    const confirmBtn = document.getElementById("confirm-import-btn");

    if (!textArea.value.trim()) {
      this.showMessage("Vui lòng chọn file hoặc dán nội dung JSON!", "error");
      return;
    }

    if (confirmBtn) {
      confirmBtn.textContent = "Đang nhập...";
      confirmBtn.setAttribute("disabled", "true");
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
        this.showMessage(
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!",
          "error"
        );
      }
    } catch (error) {
      console.error("Error importing accounts:", error);
      this.showMessage("Có lỗi xảy ra khi nhập dữ liệu!", "error");
    } finally {
      if (confirmBtn) {
        confirmBtn.textContent = "Nhập dữ liệu";
        confirmBtn.removeAttribute("disabled");
      }
    }
  },

  /**
   * Handle editing current account
   */
  async handleEditAccount(): Promise<void> {
    const activeAccount = await AccountService.getActiveAccount();
    if (!activeAccount) return;

    // Create edit modal
    const modal = this.createEditAccountModal(activeAccount);
    document.body.appendChild(modal);

    // Show modal
    modal.classList.remove("hidden");

    // Setup event listeners for the edit modal
    this.setupEditAccountModalEvents(modal, activeAccount);
  },

  /**
   * Create edit account modal
   */
  createEditAccountModal(account: Account): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "edit-account-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Chỉnh sửa tài khoản</h3>
          <button id="close-edit-modal-btn" class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị:</label>
            <input type="text" id="edit-account-name-input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value="${
              account.name
            }">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Biệt danh:</label>
            <input type="text" id="edit-account-nickname-input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value="${
              account.nickname || ""
            }">
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button id="cancel-edit-account-btn" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition duration-200">
            Hủy
          </button>
          <button id="confirm-edit-account-btn" class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-medium px-4 py-2 rounded-lg transition duration-200">
            Lưu thay đổi
          </button>
        </div>
      </div>
    `;

    return modal;
  },

  /**
   * Setup edit account modal events
   */
  setupEditAccountModalEvents(modal: HTMLElement, account: Account): void {
    const closeBtn = modal.querySelector("#close-edit-modal-btn");
    const cancelBtn = modal.querySelector("#cancel-edit-account-btn");
    const confirmBtn = modal.querySelector("#confirm-edit-account-btn");

    /**
     * Hide the modal and clean up
     */
    const hideModal = () => {
      modal.classList.add("hidden");
      document.body.removeChild(modal);
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", hideModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", hideModal);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        const nameInput = modal.querySelector(
          "#edit-account-name-input"
        ) as HTMLInputElement;
        const nicknameInput = modal.querySelector(
          "#edit-account-nickname-input"
        ) as HTMLInputElement;

        try {
          await AccountService.updateAccount(account.id, {
            name: nameInput.value.trim() || account.name,
            nickname: nicknameInput.value.trim() || undefined,
          });

          await this.loadAccounts();
          this.showMessage("Đã cập nhật tài khoản thành công!", "success");
          hideModal();
        } catch (error) {
          console.error("Error updating account:", error);
          this.showMessage("Có lỗi xảy ra khi cập nhật tài khoản!", "error");
        }
      });
    }

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
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

    // Create confirmation modal
    const modal = this.createDeleteConfirmModal(activeAccount);
    document.body.appendChild(modal);
    modal.classList.remove("hidden");

    this.setupDeleteConfirmModalEvents(modal, activeAccount);
  },

  /**
   * Create delete confirmation modal
   */
  createDeleteConfirmModal(account: Account): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "delete-confirm-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
          <h3 class="text-lg font-bold text-gray-900">Xác nhận xóa tài khoản</h3>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-600">Bạn có chắc chắn muốn xóa tài khoản:</p>
          <p class="font-semibold text-gray-900 mt-2">"${account.name}"</p>
          <p class="text-sm text-red-600 mt-2">Hành động này không thể hoàn tác!</p>
        </div>
        
        <div class="flex space-x-3">
          <button id="cancel-delete-btn" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition duration-200">
            Hủy
          </button>
          <button id="confirm-delete-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200">
            Xóa tài khoản
          </button>
        </div>
      </div>
    `;

    return modal;
  },

  /**
   * Setup delete confirmation modal events
   */
  setupDeleteConfirmModalEvents(modal: HTMLElement, account: Account): void {
    const cancelBtn = modal.querySelector("#cancel-delete-btn");
    const confirmBtn = modal.querySelector("#confirm-delete-btn");

    /**
     * Hide the modal and clean up
     */
    const hideModal = () => {
      modal.classList.add("hidden");
      document.body.removeChild(modal);
    };

    if (cancelBtn) {
      cancelBtn.addEventListener("click", hideModal);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        try {
          await AccountService.deleteAccount(account.id);
          await this.loadAccounts();
          this.showMessage("Đã xóa tài khoản thành công!", "success");
          hideModal();

        } catch (error) {
          console.error("Error deleting account:", error);
          this.showMessage("Có lỗi xảy ra khi xóa tài khoản!", "error");
        }
      });
    }

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
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

export default AccountUIService;
