import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountService from "../../services/accountService";

// Mock storage global is set up in tests/setup.ts
// We need to access the mock to control return values
const storageMock = global.storage as {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
};

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
    storageMock.getItem.mockResolvedValueOnce(null);
    const data = await AccountService.getAccountsData();
    expect(data.accounts).toEqual({});
    expect(data.activeAccountId).toBeNull();
    expect(data.settings.enableSearchFeature).toBe(true);
  });

  it("returns stored data when available", async () => {
    const stored = {
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
    };
    storageMock.getItem.mockResolvedValueOnce(stored);
    const data = await AccountService.getAccountsData();
    expect(data.activeAccountId).toBe("acc1");
  });

  it("migrates accounts missing facilitatorProgram to true", async () => {
    const stored = {
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
    };
    storageMock.getItem.mockResolvedValueOnce(stored);
    const data = await AccountService.getAccountsData();
    expect(data.accounts["acc1"].facilitatorProgram).toBe(true);
    expect(storageMock.setItem).toHaveBeenCalled();
  });
});

describe("AccountService.getActiveAccount", () => {
  it("returns null when no active account", async () => {
    storageMock.getItem.mockResolvedValueOnce({
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
    storageMock.getItem.mockResolvedValueOnce({
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
    storageMock.getItem.mockResolvedValueOnce({
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
    storageMock.getItem.mockResolvedValue({
      accounts: { acc1: account },
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.setActiveAccount("acc1");
    expect(result).toBe(true);
    expect(storageMock.setItem).toHaveBeenCalled();
  });
});

describe("AccountService.getAllAccounts", () => {
  it("returns empty array when no accounts", async () => {
    storageMock.getItem.mockResolvedValueOnce({
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
    storageMock.getItem.mockResolvedValueOnce({
      accounts: { acc1: older, acc2: newer },
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const accounts = await AccountService.getAllAccounts();
    expect(accounts[0].id).toBe("acc2");
    expect(accounts[1].id).toBe("acc1");
  });
});
