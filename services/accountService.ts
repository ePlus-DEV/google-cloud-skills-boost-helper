import type {
  Account,
  AccountsData,
  ArcadeData,
  CreateAccountOptions,
} from "../types";

/**
 * Service to handle multiple accounts management
 */
const AccountService = {
  /**
   * Generate a unique account ID
   */
  generateAccountId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get all accounts data from storage
   */
  async getAccountsData(): Promise<AccountsData> {
    const data = await storage.getItem<AccountsData>("local:accountsData");
    if (!data) {
      return {
        accounts: {},
        activeAccountId: null,
        settings: {
          enableSearchFeature: true,
        },
      };
    }
    return data;
  },

  /**
   * Save accounts data to storage
   */
  async saveAccountsData(data: AccountsData): Promise<void> {
    await storage.setItem("local:accountsData", data);
  },

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    const data = await this.getAccountsData();
    return Object.values(data.accounts).sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    );
  },

  /**
   * Get active account
   */
  async getActiveAccount(): Promise<Account | null> {
    const data = await this.getAccountsData();
    if (!data.activeAccountId || !data.accounts[data.activeAccountId]) {
      return null;
    }
    return data.accounts[data.activeAccountId];
  },

  /**
   * Set active account
   */
  async setActiveAccount(accountId: string): Promise<boolean> {
    const data = await this.getAccountsData();
    if (!data.accounts[accountId]) {
      return false;
    }

    // Update last used time for the account
    data.accounts[accountId].lastUsed = new Date().toISOString();
    data.activeAccountId = accountId;

    await this.saveAccountsData(data);
    return true;
  },

  /**
   * Create a new account
   */
  async createAccount(options: CreateAccountOptions): Promise<Account> {
    const accountId = this.generateAccountId();
    const now = new Date().toISOString();

    // Extract name from profile URL if not provided
    let accountName = options.name;
    if (!accountName && options.profileUrl) {
      try {
        const url = new URL(options.profileUrl);
        const pathParts = url.pathname.split("/");
        const profilePart = pathParts.find((part) => part.includes("profile"));
        if (profilePart) {
          accountName = `Profile ${
            pathParts[pathParts.indexOf(profilePart) + 1]?.substring(0, 8) ||
            accountId.slice(-6)
          }`;
        } else {
          accountName = `Account ${accountId.slice(-6)}`;
        }
      } catch {
        accountName = `Account ${accountId.slice(-6)}`;
      }
    }

    const account: Account = {
      id: accountId,
      name: accountName || `Account ${accountId.slice(-6)}`,
      nickname: options.nickname,
      profileUrl: options.profileUrl,
      arcadeData: options.arcadeData,
      createdAt: now,
      lastUsed: now,
    };

    const data = await this.getAccountsData();
    data.accounts[accountId] = account;

    // Set as active if it's the first account
    if (!data.activeAccountId) {
      data.activeAccountId = accountId;
    }

    await this.saveAccountsData(data);
    return account;
  },

  /**
   * Update an existing account
   */
  async updateAccount(
    accountId: string,
    updates: Partial<Account>
  ): Promise<boolean> {
    const data = await this.getAccountsData();
    if (!data.accounts[accountId]) {
      return false;
    }

    data.accounts[accountId] = {
      ...data.accounts[accountId],
      ...updates,
      lastUsed: new Date().toISOString(),
    };

    await this.saveAccountsData(data);
    return true;
  },

  /**
   * Update account's arcade data
   */
  async updateAccountArcadeData(
    accountId: string,
    arcadeData: ArcadeData
  ): Promise<boolean> {
    return this.updateAccount(accountId, { arcadeData });
  },

  /**
   * Delete an account
   */
  async deleteAccount(accountId: string): Promise<boolean> {
    const data = await this.getAccountsData();
    if (!data.accounts[accountId]) {
      return false;
    }

    delete data.accounts[accountId];

    // If deleted account was active, set new active account
    if (data.activeAccountId === accountId) {
      const remainingAccounts = Object.keys(data.accounts);
      data.activeAccountId =
        remainingAccounts.length > 0 ? remainingAccounts[0] : null;
    }

    await this.saveAccountsData(data);
    return true;
  },

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string): Promise<Account | null> {
    const data = await this.getAccountsData();
    return data.accounts[accountId] || null;
  },

  /**
   * Search accounts by name or nickname
   */
  async searchAccounts(query: string): Promise<Account[]> {
    const accounts = await this.getAllAccounts();
    const searchTerm = query.toLowerCase();

    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(searchTerm) ||
        (account.nickname &&
          account.nickname.toLowerCase().includes(searchTerm)) ||
        account.profileUrl.toLowerCase().includes(searchTerm)
    );
  },

  /**
   * Migrate existing single account data to new multi-account structure
   */
  async migrateExistingData(): Promise<void> {
    // Check if we already have accounts data
    const existingAccountsData = await storage.getItem<AccountsData>(
      "local:accountsData"
    );
    if (existingAccountsData) {
      return; // Already migrated
    }

    // Get old format data
    const oldProfileUrl = await storage.getItem<string>("local:urlProfile");
    const oldArcadeData = await storage.getItem<ArcadeData>("local:arcadeData");
    const oldSearchFeature = await storage.getItem<boolean>(
      "local:enableSearchFeature"
    );

    // Create new accounts data structure
    const accountsData: AccountsData = {
      accounts: {},
      activeAccountId: null,
      settings: {
        enableSearchFeature:
          oldSearchFeature !== null ? oldSearchFeature : true,
      },
    };

    // If there was old data, create an account from it
    if (oldProfileUrl) {
      const account = await this.createAccountFromOldData(
        oldProfileUrl,
        oldArcadeData || undefined
      );
      accountsData.accounts[account.id] = account;
      accountsData.activeAccountId = account.id;
    }

    // Save new structure
    await this.saveAccountsData(accountsData);

    // Clean up old keys (optional - keep for backward compatibility)
    // await storage.removeItem("local:urlProfile");
    // await storage.removeItem("local:arcadeData");
    // await storage.removeItem("local:enableSearchFeature");
  },

  /**
   * Create account from old data format
   */
  async createAccountFromOldData(
    profileUrl: string,
    arcadeData?: ArcadeData
  ): Promise<Account> {
    const accountId = this.generateAccountId();
    const now = new Date().toISOString();

    let accountName = "Tài khoản chính";
    if (arcadeData?.userDetails?.userName) {
      accountName = arcadeData.userDetails.userName;
    }

    return {
      id: accountId,
      name: accountName,
      profileUrl,
      arcadeData,
      createdAt: now,
      lastUsed: now,
    };
  },

  /**
   * Export accounts data
   */
  async exportAccounts(): Promise<string> {
    const data = await this.getAccountsData();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import accounts data
   */
  async importAccounts(jsonData: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(jsonData) as AccountsData;

      // Validate the structure
      if (!importedData.accounts || typeof importedData.accounts !== "object") {
        throw new Error("Invalid accounts data structure");
      }

      // Get current data and merge
      const currentData = await this.getAccountsData();
      const mergedData: AccountsData = {
        accounts: { ...currentData.accounts },
        activeAccountId: currentData.activeAccountId,
        settings: { ...currentData.settings, ...importedData.settings },
      };

      // Add imported accounts with new IDs to avoid conflicts
      for (const account of Object.values(importedData.accounts)) {
        const newId = this.generateAccountId();
        mergedData.accounts[newId] = {
          ...account,
          id: newId,
          createdAt: new Date().toISOString(),
        };
      }

      await this.saveAccountsData(mergedData);
      return true;
    } catch (error) {
      console.error("Error importing accounts:", error);
      return false;
    }
  },

  /**
   * Get settings
   */
  async getSettings(): Promise<AccountsData["settings"]> {
    const data = await this.getAccountsData();
    return data.settings;
  },

  /**
   * Update settings
   */
  async updateSettings(
    settings: Partial<AccountsData["settings"]>
  ): Promise<void> {
    const data = await this.getAccountsData();
    data.settings = { ...data.settings, ...settings };
    await this.saveAccountsData(data);
  },
};

export default AccountService;
