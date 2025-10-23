import type {
  Account,
  AccountsData,
  ArcadeData,
  CreateAccountOptions,
} from "../types";
import { extractProfileId, canonicalizeProfileUrl } from "../utils/profileUrl";

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
          // default to false (badge off) for new installs unless migrated value exists
          showBadge: false,
        },
      };
    }

    // Migration: Add facilitatorProgram property to existing accounts
    let needsUpdate = false;
    for (const accountId in data.accounts) {
      const account = data.accounts[accountId];
      if (account.facilitatorProgram === undefined) {
        account.facilitatorProgram = true; // Default to true for existing accounts
        needsUpdate = true;
      }
    }

    // Save updated data if migration was needed
    if (needsUpdate) {
      await this.saveAccountsData(data);
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
   * Check if an account with the same profile URL already exists
   */
  async isAccountExists(profileUrl: string): Promise<Account | null> {
    const data = await this.getAccountsData();
    const accounts = Object.values(data.accounts);

    const normalizedUrl = profileUrl.toLowerCase();
    const providedProfileId = extractProfileId(profileUrl);

    // First try exact URL match (case-insensitive)
    let existingAccount = accounts.find(
      (account) =>
        account.profileUrl && account.profileUrl.toLowerCase() === normalizedUrl
    );

    if (existingAccount) return existingAccount || null;

    // If provided URL contains a profileId, try matching by profileId
    if (providedProfileId) {
      existingAccount = accounts.find((account) => {
        if (!account.profileUrl) return false;
        try {
          const acctProfileId = extractProfileId(account.profileUrl);
          return acctProfileId !== null && acctProfileId === providedProfileId;
        } catch {
          return false;
        }
      });
      if (existingAccount) return existingAccount || null;
    }

    return null;
  },

  /**
   * Create a new account
   */
  async createAccount(options: CreateAccountOptions): Promise<Account> {
    // Check if account already exists
    const canonicalUrl = options.profileUrl
      ? canonicalizeProfileUrl(options.profileUrl) || options.profileUrl
      : options.profileUrl;

    const existingAccount = canonicalUrl
      ? await this.isAccountExists(canonicalUrl)
      : await this.isAccountExists(options.profileUrl);
    if (existingAccount) {
      throw new Error(
        `Tài khoản với URL này đã tồn tại: "${existingAccount.name}"`
      );
    }

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
      profileUrl: canonicalUrl || options.profileUrl,
      arcadeData: options.arcadeData,
      createdAt: now,
      lastUsed: now,
      facilitatorProgram: options.facilitatorProgram ?? true,
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

    // If profileUrl is being updated, canonicalize it before saving
    const updated = { ...data.accounts[accountId], ...updates };
    if (updates.profileUrl) {
      const canonical = canonicalizeProfileUrl(updates.profileUrl);
      updated.profileUrl = canonical || updates.profileUrl;
    }
    updated.lastUsed = new Date().toISOString();

    data.accounts[accountId] = updated;

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

    data.accounts[accountId] = undefined as unknown as Account;

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
    // legacy badge setting (was stored directly in local storage)
    const oldShowBadge = await storage.getItem<boolean>("local:showBadge");

    // Create new accounts data structure
    const accountsData: AccountsData = {
      accounts: {},
      activeAccountId: null,
      settings: {
        enableSearchFeature:
          oldSearchFeature !== null ? oldSearchFeature : true,
        // preserve legacy showBadge if it exists, otherwise default false
        showBadge: oldShowBadge !== null ? oldShowBadge : false,
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
   * Extract user details from ArcadeData (handle both array and object format)
   */
  extractUserDetails(arcadeData?: ArcadeData) {
    if (!arcadeData?.userDetails) return null;

    if (Array.isArray(arcadeData.userDetails)) {
      return arcadeData.userDetails[0] || null;
    }

    return arcadeData.userDetails;
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
    const userDetail = this.extractUserDetails(arcadeData);
    if (userDetail?.userName) {
      accountName = userDetail.userName;
    }

    const canonical = canonicalizeProfileUrl(profileUrl) || profileUrl;

    return {
      id: accountId,
      name: accountName,
      profileUrl: canonical,
      arcadeData,
      createdAt: now,
      lastUsed: now,
    };
  },

  /**
   * Normalize existing accounts: canonicalize profileUrl hosts and deduplicate
   * accounts that refer to the same profileId.
   *
   * Strategy:
   * - For each account, attempt to canonicalize its profileUrl and update it.
   * - Group accounts by extracted profileId. For groups with multiple accounts,
   *   keep the account with the most recent `lastUsed` and merge arcadeData if
   *   the keeper lacks it; delete the others.
   */
  async normalizeAccountsAndDeduplicate(): Promise<void> {
    const data = await this.getAccountsData();
    const accounts = data.accounts;

    // First, canonicalize profileUrl for each account if possible
    for (const id of Object.keys(accounts)) {
      const acct = accounts[id];
      if (!acct || !acct.profileUrl) continue;
      try {
        const canonical = canonicalizeProfileUrl(acct.profileUrl);
        if (canonical && canonical !== acct.profileUrl) {
          acct.profileUrl = canonical;
        }
      } catch {
        // non-fatal: skip
      }
    }

    // Group by profileId
    const groups: Record<string, string[]> = {};
    for (const id of Object.keys(accounts)) {
      const acct = accounts[id];
      if (!acct || !acct.profileUrl) continue;
      const pid = extractProfileId(acct.profileUrl);
      if (!pid) continue;
      if (!groups[pid]) groups[pid] = [];
      groups[pid].push(id);
    }

    // Deduplicate groups with more than one account
    for (const pid of Object.keys(groups)) {
      const ids = groups[pid];
      if (ids.length <= 1) continue;

      // Choose keeper: account with latest lastUsed
      ids.sort((a, b) => {
        const la = new Date(accounts[a].lastUsed).getTime();
        const lb = new Date(accounts[b].lastUsed).getTime();
        return lb - la; // descending -> first is newest
      });

      const keeperId = ids[0];
      const keeper = accounts[keeperId];

      // Merge arcadeData if keeper missing and another has
      for (let i = 1; i < ids.length; i++) {
        const otherId = ids[i];
        const other = accounts[otherId];
        if (!other) continue;
        if (!keeper.arcadeData && other.arcadeData) {
          keeper.arcadeData = other.arcadeData;
        }
        // If keeper has no nickname but other has, prefer other
        if (!keeper.nickname && other.nickname) {
          keeper.nickname = other.nickname;
        }
        // Remove the duplicate account
        delete accounts[otherId];
        // If deleted account was active, set keeper as active
        if (data.activeAccountId === otherId) {
          data.activeAccountId = keeperId;
        }
      }
    }

    // Persist changes
    await this.saveAccountsData(data);
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
