import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import AccountService from "../../services/accountService";

async function seedAccountsData(data: object) {
  await fakeBrowser.storage.local.set({ accountsData: data });
}

beforeEach(() => {
  fakeBrowser.reset();
});

// ─── isAccountExists ──────────────────────────────────────────────────────────

describe("AccountService.isAccountExists", () => {
  it("returns null when no accounts", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.isAccountExists(
      "https://www.skills.google/public_profiles/abc",
    );
    expect(result).toBeNull();
  });

  it("finds account by exact URL (case-insensitive)", async () => {
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
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.isAccountExists(
      "https://www.skills.google/public_profiles/abc",
    );
    expect(result?.id).toBe("acc1");
  });

  it("finds account by profile ID when URL differs", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Test",
          profileUrl: "https://www.skills.google/public_profiles/abc123",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.isAccountExists(
      "https://www.cloudskillsboost.google/public_profiles/abc123",
    );
    expect(result?.id).toBe("acc1");
  });

  it("returns null when profile ID does not match", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Test",
          profileUrl: "https://www.skills.google/public_profiles/abc123",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.isAccountExists(
      "https://www.skills.google/public_profiles/xyz999",
    );
    expect(result).toBeNull();
  });
});

// ─── updateAccountArcadeData ──────────────────────────────────────────────────

describe("AccountService.updateAccountArcadeData", () => {
  it("updates arcade data on existing account", async () => {
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

    const result = await AccountService.updateAccountArcadeData("acc1", {
      totalArcadePoints: 500,
    });
    expect(result).toBe(true);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect(
      (stored.accountsData as any).accounts.acc1.arcadeData.totalArcadePoints,
    ).toBe(500);
  });

  it("returns false for non-existent account", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });
    const result = await AccountService.updateAccountArcadeData("nonexistent", {
      totalArcadePoints: 100,
    });
    expect(result).toBe(false);
  });
});

// ─── extractUserDetails ───────────────────────────────────────────────────────

describe("AccountService.extractUserDetails", () => {
  it("returns null when arcadeData is undefined", () => {
    expect(AccountService.extractUserDetails()).toBeNull();
  });

  it("returns null when userDetails is missing", () => {
    expect(AccountService.extractUserDetails({})).toBeNull();
  });

  it("returns first element when userDetails is an array", () => {
    const detail = { userName: "Alice" };
    const result = AccountService.extractUserDetails({ userDetails: [detail] });
    expect(result).toEqual(detail);
  });

  it("returns null when userDetails is empty array", () => {
    const result = AccountService.extractUserDetails({ userDetails: [] });
    expect(result).toBeNull();
  });

  it("returns userDetails directly when it is an object", () => {
    const detail = { userName: "Bob" };
    const result = AccountService.extractUserDetails({ userDetails: detail });
    expect(result).toEqual(detail);
  });
});

// ─── createAccountFromOldData ─────────────────────────────────────────────────

describe("AccountService.createAccountFromOldData", () => {
  it("creates account with userName from arcadeData", async () => {
    const arcadeData = { userDetails: { userName: "OldUser" } };
    const account = await AccountService.createAccountFromOldData(
      "https://www.skills.google/public_profiles/abc",
      arcadeData as any,
    );
    expect(account.name).toBe("OldUser");
    expect(account.profileUrl).toContain("skills.google");
  });

  it("uses default name when no arcadeData", async () => {
    const account = await AccountService.createAccountFromOldData(
      "https://www.skills.google/public_profiles/abc",
    );
    expect(account.name).toBe("Tài khoản chính");
  });

  it("generates a valid account ID", async () => {
    const account = await AccountService.createAccountFromOldData(
      "https://www.skills.google/public_profiles/abc",
    );
    expect(account.id).toMatch(/^account_/);
  });
});

// ─── migrateExistingData ──────────────────────────────────────────────────────

describe("AccountService.migrateExistingData", () => {
  it("does nothing when accountsData already exists", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Existing",
          profileUrl: "https://www.skills.google/public_profiles/abc",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.migrateExistingData();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    // Should still have the original account
    expect((stored.accountsData as any).accounts.acc1.name).toBe("Existing");
  });

  it("creates empty accounts structure when no old data", async () => {
    await AccountService.migrateExistingData();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect(stored.accountsData).toBeTruthy();
    expect((stored.accountsData as any).activeAccountId).toBeNull();
  });

  it("migrates old urlProfile to new account", async () => {
    await fakeBrowser.storage.local.set({
      urlProfile: "https://www.skills.google/public_profiles/migrated",
    });

    await AccountService.migrateExistingData();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const data = stored.accountsData as any;
    expect(data.activeAccountId).toBeTruthy();
    const accounts = Object.values(data.accounts) as any[];
    expect(accounts[0].profileUrl).toContain("migrated");
  });

  it("preserves old enableSearchFeature setting", async () => {
    await fakeBrowser.storage.local.set({
      enableSearchFeature: false,
    });

    await AccountService.migrateExistingData();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    expect((stored.accountsData as any).settings.enableSearchFeature).toBe(
      false,
    );
  });
});

// ─── normalizeAccountsAndDeduplicate ─────────────────────────────────────────

describe("AccountService.normalizeAccountsAndDeduplicate", () => {
  it("deduplicates accounts with same profileId, keeps most recent", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Older",
          profileUrl: "https://www.skills.google/public_profiles/abc123",
          createdAt: "2024-01-01T00:00:00Z",
          lastUsed: "2024-01-01T00:00:00Z",
          facilitatorProgram: true,
        },
        acc2: {
          id: "acc2",
          name: "Newer",
          profileUrl:
            "https://www.cloudskillsboost.google/public_profiles/abc123",
          createdAt: "2024-06-01T00:00:00Z",
          lastUsed: "2024-06-01T00:00:00Z",
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.normalizeAccountsAndDeduplicate();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const accounts = (stored.accountsData as any).accounts;
    const remaining = Object.values(accounts).filter(Boolean);
    expect(remaining).toHaveLength(1);
    expect((remaining[0] as any).name).toBe("Newer");
  });

  it("updates activeAccountId when active duplicate is removed", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Older",
          profileUrl: "https://www.skills.google/public_profiles/abc123",
          createdAt: "2024-01-01T00:00:00Z",
          lastUsed: "2024-01-01T00:00:00Z",
          facilitatorProgram: true,
        },
        acc2: {
          id: "acc2",
          name: "Newer",
          profileUrl:
            "https://www.cloudskillsboost.google/public_profiles/abc123",
          createdAt: "2024-06-01T00:00:00Z",
          lastUsed: "2024-06-01T00:00:00Z",
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.normalizeAccountsAndDeduplicate();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    // activeAccountId should now point to the keeper (acc2)
    expect((stored.accountsData as any).activeAccountId).toBe("acc2");
  });

  it("does not remove accounts with different profileIds", async () => {
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "User A",
          profileUrl: "https://www.skills.google/public_profiles/aaa111",
          createdAt: "2024-01-01T00:00:00Z",
          lastUsed: "2024-01-01T00:00:00Z",
          facilitatorProgram: true,
        },
        acc2: {
          id: "acc2",
          name: "User B",
          profileUrl: "https://www.skills.google/public_profiles/bbb222",
          createdAt: "2024-06-01T00:00:00Z",
          lastUsed: "2024-06-01T00:00:00Z",
          facilitatorProgram: true,
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.normalizeAccountsAndDeduplicate();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const accounts = Object.values(
      (stored.accountsData as any).accounts,
    ).filter(Boolean);
    expect(accounts).toHaveLength(2);
  });

  it("merges arcadeData from duplicate into keeper when keeper lacks it", async () => {
    const arcadeData = { totalArcadePoints: 999 };
    await seedAccountsData({
      accounts: {
        acc1: {
          id: "acc1",
          name: "Older",
          profileUrl: "https://www.skills.google/public_profiles/abc123",
          createdAt: "2024-01-01T00:00:00Z",
          lastUsed: "2024-01-01T00:00:00Z",
          facilitatorProgram: true,
          arcadeData,
        },
        acc2: {
          id: "acc2",
          name: "Newer",
          profileUrl:
            "https://www.cloudskillsboost.google/public_profiles/abc123",
          createdAt: "2024-06-01T00:00:00Z",
          lastUsed: "2024-06-01T00:00:00Z",
          facilitatorProgram: true,
          // no arcadeData
        },
      },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.normalizeAccountsAndDeduplicate();

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const accounts = Object.values(
      (stored.accountsData as any).accounts,
    ).filter(Boolean) as any[];
    expect(accounts[0].arcadeData?.totalArcadePoints).toBe(999);
  });
});

// ─── exportAccounts / importAccounts ─────────────────────────────────────────

describe("AccountService.exportAccounts", () => {
  it("returns valid JSON string", async () => {
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
      settings: { enableSearchFeature: true },
    });

    const json = await AccountService.exportAccounts();
    const parsed = JSON.parse(json);
    expect(parsed.accounts).toBeTruthy();
    expect(parsed.accounts.acc1.name).toBe("Test");
  });
});

describe("AccountService.importAccounts", () => {
  it("returns false for invalid JSON", async () => {
    const result = await AccountService.importAccounts("not-json");
    expect(result).toBe(false);
  });

  it("returns false for missing accounts field", async () => {
    const result = await AccountService.importAccounts(
      JSON.stringify({ foo: "bar" }),
    );
    expect(result).toBe(false);
  });

  it("merges imported accounts with new IDs", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });

    const importData = JSON.stringify({
      accounts: {
        old_id: {
          id: "old_id",
          name: "Imported User",
          profileUrl: "https://www.skills.google/public_profiles/imported",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          facilitatorProgram: true,
        },
      },
      settings: { enableSearchFeature: false },
    });

    const result = await AccountService.importAccounts(importData);
    expect(result).toBe(true);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const accounts = Object.values(
      (stored.accountsData as any).accounts,
    ) as any[];
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe("Imported User");
    // Should have a new ID, not the old one
    expect(accounts[0].id).not.toBe("old_id");
  });

  it("preserves existing accounts when importing", async () => {
    await seedAccountsData({
      accounts: {
        existing: {
          id: "existing",
          name: "Existing",
          profileUrl: "https://www.skills.google/public_profiles/existing",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          facilitatorProgram: true,
        },
      },
      activeAccountId: "existing",
      settings: { enableSearchFeature: true },
    });

    const importData = JSON.stringify({
      accounts: {
        new_acc: {
          id: "new_acc",
          name: "New Account",
          profileUrl: "https://www.skills.google/public_profiles/new",
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        },
      },
    });

    await AccountService.importAccounts(importData);

    const stored = await fakeBrowser.storage.local.get("accountsData");
    const accounts = Object.values(
      (stored.accountsData as any).accounts,
    ) as any[];
    expect(accounts).toHaveLength(2);
  });
});

// ─── createAccount edge cases ─────────────────────────────────────────────────

describe("AccountService.createAccount - edge cases", () => {
  it("extracts name from profile URL when name not provided", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });

    const account = await AccountService.createAccount({
      profileUrl: "https://www.skills.google/public_profiles/abc123",
    } as any);
    expect(account.name).toBeTruthy();
  });

  it("sets facilitatorProgram to false when explicitly passed", async () => {
    await seedAccountsData({
      accounts: {},
      activeAccountId: null,
      settings: { enableSearchFeature: true },
    });

    const account = await AccountService.createAccount({
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc123",
      facilitatorProgram: false,
    });
    expect(account.facilitatorProgram).toBe(false);
  });

  it("does not override activeAccountId when one already exists", async () => {
    const existing = {
      id: "acc1",
      name: "First",
      profileUrl: "https://www.skills.google/public_profiles/first",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1: existing },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    const newAccount = await AccountService.createAccount({
      name: "Second",
      profileUrl: "https://www.skills.google/public_profiles/second",
    });

    const stored = await fakeBrowser.storage.local.get("accountsData");
    // activeAccountId should still be acc1, not the new account
    expect((stored.accountsData as any).activeAccountId).toBe("acc1");
    expect(newAccount.name).toBe("Second");
  });
});

// ─── deleteAccount edge cases ─────────────────────────────────────────────────

describe("AccountService.deleteAccount - edge cases", () => {
  it("sets next account as active after deleting active account", async () => {
    const acc1 = {
      id: "acc1",
      name: "First",
      profileUrl: "https://www.skills.google/public_profiles/first",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    const acc2 = {
      id: "acc2",
      name: "Second",
      profileUrl: "https://www.skills.google/public_profiles/second",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1, acc2 },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    await AccountService.deleteAccount("acc1");

    const stored = await fakeBrowser.storage.local.get("accountsData");
    // Should have a new active account
    expect((stored.accountsData as any).activeAccountId).toBeTruthy();
  });
});

// ─── searchAccounts - profileUrl match ───────────────────────────────────────

describe("AccountService.searchAccounts - extended", () => {
  it("matches by profileUrl", async () => {
    const acc1 = {
      id: "acc1",
      name: "Alice",
      profileUrl: "https://www.skills.google/public_profiles/alice123",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1 },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    const results = await AccountService.searchAccounts("alice123");
    expect(results).toHaveLength(1);
  });

  it("matches by nickname", async () => {
    const acc1 = {
      id: "acc1",
      name: "Alice",
      nickname: "ali",
      profileUrl: "https://www.skills.google/public_profiles/alice",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1 },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    const results = await AccountService.searchAccounts("ali");
    expect(results).toHaveLength(1);
  });

  it("returns empty array when no match", async () => {
    const acc1 = {
      id: "acc1",
      name: "Alice",
      profileUrl: "https://www.skills.google/public_profiles/alice",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    };
    await seedAccountsData({
      accounts: { acc1 },
      activeAccountId: "acc1",
      settings: { enableSearchFeature: true },
    });

    const results = await AccountService.searchAccounts("zzznomatch");
    expect(results).toHaveLength(0);
  });
});
