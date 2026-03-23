import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import AccountService from "../../services/accountService";

// Helper to seed accountsData into fake storage
async function seedAccountsData(data: object) {
  await fakeBrowser.storage.local.set({ accountsData: data });
}

beforeEach(() => {
  fakeBrowser.reset();
});

describe("AccountService.generateAccountId", () => {
  it("generates a string starting with 'account_'", () => {
    const id = AccountService.generateAccountId();
    expect(id).toMatch(/^account_\d+_/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(
      Array.from({ length: 10 }, () => AccountService.generateAccountId()),
    );
    expect(ids.size).toBe(10);
  });
});

describe("AccountService.getAccountsData", () => {
  it("returns default data when storage is empty", async () => {
    const data = await AccountService.getAccountsData();
    expect(data.accounts).toEqual({});
    expect(data.activeAccountId).toBeNull();
    expect(data.settings.enableSearchFeature).toBe(true);
  });

  it("returns stored data when available", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Test",
          profileUrl: "https://www.skills.google/public_profiles/abc",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: false },
    });
    const data = await AccountService.getAccountsData();
    expect(data.activeAccountId).toBe("acc1");
  });

  it("migrates accounts missing facilitatorProgram to true", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Test",
          profileUrl: "https://www.skills.google/public_profiles/abc",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          // no facilitatorProgram
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const data = await AccountService.getAccountsData();
    expect(data.accounts["acc1"].facilitatorProgram).toBe(true);
  });
});

describe("AccountService.getActiveAccount", () => {
  it("returns null when no active account", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.getActiveAccount();
    expect(result).toBeNull();
  });

  it("returns active account when set", async () => {
    const account = {
      id: "acc1",
      name: "Test User",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: account },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.getActiveAccount();
    expect(result?.id).toBe("acc1");
    expect(result?.name).toBe("Test User");
  });
});

describe("AccountService.setActiveAccount", () => {
  it("returns false when account does not exist", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.setActiveAccount("nonexistent");
    expect(result).toBe(false);
  });

  it("sets active account and returns true", async () => {
    const account = {
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: account },
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.setActiveAccount("acc1");
    expect(result).toBe(true);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect((stored.accountsData as any).activeAccountId).toBe("acc1");
  });
});

describe("AccountService.getAllAccounts", () => {
  it("returns empty array when no accounts", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const accounts = await AccountService.getAllAccounts();
    expect(accounts).toEqual([]);
  });

  it("returns accounts sorted by lastUsed descending", async () => {
    const older = {
      id: "acc1",
      name: "Older",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: "2024-01-01T00:00:00Z",
      lastUsed: "2024-01-01T00:00:00Z",
      facilitatorProgram: true,
    };
    const newer = {
      id: "acc2",
      name: "Newer",
      profileUrl: "https://www.skills.google/public_profiles/xyz",
      createdAt: "2024-06-01T00:00:00Z",
      lastUsed: "2024-06-01T00:00:00Z",
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: older, acc2: newer },
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const accounts = await AccountService.getAllAccounts();
    expect(accounts[0].id).toBe("acc2");
    expect(accounts[1].id).toBe("acc1");
  });
});

describe("AccountService.createAccount", () => {
  it("creates a new account and sets it as active when first", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const account = await AccountService.createAccount({
      name: "Test User",
      profileUrl: "https://www.skills.google/public_profiles/abc123",
    });
    expect(account.name).toBe("Test User");
    expect(account.id).toMatch(/^account_/);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect((stored.accountsData as any).activeAccountId).toBe(account.id);
  });

  it("throws when account with same URL already exists", async () => {
    const existing = {
      id: "acc1",
      name: "Existing",
      profileUrl: "https://www.skills.google/public_profiles/abc123",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: existing },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    await expect(
      AccountService.createAccount({
        name: "Duplicate",
        profileUrl: "https://www.skills.google/public_profiles/abc123",
      }),
    ).rejects.toThrow();
  });
});

describe("AccountService.updateAccount", () => {
  it("returns false for non-existent account", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.updateAccount("nonexistent", {
      name: "New Name",
    });
    expect(result).toBe(false);
  });

  it("updates account fields and returns true", async () => {
    const account = {
      id: "acc1",
      name: "Old Name",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: account },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.updateAccount("acc1", {
      name: "New Name",
    });
    expect(result).toBe(true);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect((stored.accountsData as any).accounts.acc1.name).toBe("New Name");
  });
});

describe("AccountService.deleteAccount", () => {
  it("returns false for non-existent account", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    expect(await AccountService.deleteAccount("nonexistent")).toBe(false);
  });

  it("deletes account and clears activeAccountId when it was active", async () => {
    const account = {
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: account },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.deleteAccount("acc1");
    expect(result).toBe(true);
  });
});

describe("AccountService.getAccountById", () => {
  it("returns null for non-existent account", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    expect(await AccountService.getAccountById("nonexistent")).toBeNull();
  });

  it("returns account by id", async () => {
    const account = {
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: account },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.getAccountById("acc1");
    expect(result?.name).toBe("Test");
  });
});

describe("AccountService.searchAccounts", () => {
  it("returns matching accounts by name", async () => {
    const acc1 = {
      id: "acc1",
      name: "Alice",
      profileUrl: "https://www.skills.google/public_profiles/alice",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    const acc2 = {
      id: "acc2",
      name: "Bob",
      profileUrl: "https://www.skills.google/public_profiles/bob",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1, acc2 },
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const results = await AccountService.searchAccounts("alice");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Alice");
  });
});

describe("AccountService.getSettings / updateSettings", () => {
  it("returns default settings", async () => {
    const settings = await AccountService.getSettings();
    expect(settings.enableSearchFeature).toBe(true);
  });

  it("updates settings", async () => {
    await AccountService.updateSettings({ enableSearchFeature: false });
    const settings = await AccountService.getSettings();
    expect(settings.enableSearchFeature).toBe(false);
  });
});
