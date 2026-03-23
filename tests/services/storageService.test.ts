import { describe, it, expect, vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import StorageService from "../../services/storageService";

// Mock AccountService
vi.mock("../../services/accountService", () => ({
  default: {
    getActiveAccount: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    updateAccount: vi.fn(),
    updateAccountArcadeData: vi.fn(),
    migrateExistingData: vi.fn(),
    normalizeAccountsAndDeduplicate: vi.fn(),
  },
}));

// Mock runtimeMessage so badge calls don't throw
vi.mock("../../services/runtimeMessage", () => ({
  default: vi.fn().mockRejectedValue(new Error("no runtime")),
}));

import AccountService from "../../services/accountService";

beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
});

describe("StorageService.getArcadeData", () => {
  it("returns arcade data from active account", async () => {
    const arcadeData = { totalArcadePoints: 100 };
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      arcadeData,
    });

    const result = await StorageService.getArcadeData();
    expect(result?.totalArcadePoints).toBe(100);
  });

  it("falls back to legacy storage when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);
    await fakeBrowser.storage.local.set({
      arcadeData: { totalArcadePoints: 50 },
    });

    const result = await StorageService.getArcadeData();
    expect(result?.totalArcadePoints).toBe(50);
  });

  it("returns null when no data anywhere", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);

    const result = await StorageService.getArcadeData();
    expect(result).toBeNull();
  });
});

describe("StorageService.getProfileUrl", () => {
  it("returns profile URL from active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });

    const result = await StorageService.getProfileUrl();
    expect(result).toBe("https://www.skills.google/public_profiles/abc");
  });

  it("falls back to legacy storage", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);
    await fakeBrowser.storage.local.set({
      urlProfile: "https://www.skills.google/public_profiles/xyz",
    });

    const result = await StorageService.getProfileUrl();
    expect(result).toBe("https://www.skills.google/public_profiles/xyz");
  });

  it("returns empty string when nothing stored", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);

    const result = await StorageService.getProfileUrl();
    expect(result).toBe("");
  });
});

describe("StorageService.isSearchFeatureEnabled", () => {
  it("returns value from account settings", async () => {
    vi.mocked(AccountService.getSettings).mockResolvedValueOnce({
      enableSearchFeature: false,
    });

    const result = await StorageService.isSearchFeatureEnabled();
    expect(result).toBe(false);
  });

  it("defaults to true when settings throw", async () => {
    vi.mocked(AccountService.getSettings).mockRejectedValueOnce(
      new Error("fail"),
    );

    const result = await StorageService.isSearchFeatureEnabled();
    expect(result).toBe(true);
  });
});

describe("StorageService.isBadgeDisplayEnabled", () => {
  it("returns showBadge from account settings", async () => {
    vi.mocked(AccountService.getSettings).mockResolvedValueOnce({
      enableSearchFeature: true,
      showBadge: true,
    });

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(true);
  });

  it("falls back to legacy storage when settings has no showBadge", async () => {
    vi.mocked(AccountService.getSettings).mockResolvedValueOnce({
      enableSearchFeature: true,
    });
    await fakeBrowser.storage.local.set({ showBadge: true });

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(true);
  });

  it("defaults to false when nothing set", async () => {
    vi.mocked(AccountService.getSettings).mockResolvedValueOnce({
      enableSearchFeature: true,
    });

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(false);
  });
});

describe("StorageService.saveArcadeData", () => {
  it("saves arcade data to legacy storage when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({ totalArcadePoints: 100 });

    const stored = await fakeBrowser.storage.local.get("arcadeData");
    expect(stored.arcadeData).toMatchObject({ totalArcadePoints: 100 });
  });

  it("adds lastUpdated when saving", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({ totalArcadePoints: 50 });

    const stored = await fakeBrowser.storage.local.get("arcadeData");
    expect((stored.arcadeData as any).lastUpdated).toBeTruthy();
  });
});

describe("StorageService.saveProfileUrl", () => {
  it("updates active account profileUrl", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/old",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });

    await StorageService.saveProfileUrl(
      "https://www.skills.google/public_profiles/new123",
    );
    expect(AccountService.updateAccount).toHaveBeenCalledWith(
      "acc1",
      expect.objectContaining({
        profileUrl: expect.stringContaining("new123"),
      }),
    );
  });

  it("saves to legacy storage when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);

    await StorageService.saveProfileUrl(
      "https://www.skills.google/public_profiles/xyz",
    );
    const stored = await fakeBrowser.storage.local.get("urlProfile");
    expect(stored.urlProfile).toContain("xyz");
  });
});

describe("StorageService.saveSearchFeatureEnabled", () => {
  it("calls updateSettings with new value", async () => {
    await StorageService.saveSearchFeatureEnabled(false);
    expect(AccountService.updateSettings).toHaveBeenCalledWith({
      enableSearchFeature: false,
    });
  });
});

describe("StorageService.saveBadgeDisplayEnabled", () => {
  it("calls updateSettings with showBadge value", async () => {
    await StorageService.saveBadgeDisplayEnabled(true);
    expect(AccountService.updateSettings).toHaveBeenCalledWith({
      showBadge: true,
    });
  });
});
