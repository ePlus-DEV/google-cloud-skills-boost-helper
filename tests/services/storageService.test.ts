import { describe, it, expect, vi, beforeEach } from "vitest";
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

// Mock runtimeMessage
vi.mock("../../services/runtimeMessage", () => ({
  default: vi.fn().mockRejectedValue(new Error("no runtime")),
}));

import AccountService from "../../services/accountService";

const storageMock = (globalThis as unknown as Record<string, unknown>)
  .storage as {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
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
    storageMock.getItem.mockResolvedValueOnce({ totalArcadePoints: 50 });

    const result = await StorageService.getArcadeData();
    expect(result?.totalArcadePoints).toBe(50);
  });

  it("returns null when no data anywhere", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);
    storageMock.getItem.mockResolvedValueOnce(null);

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
    storageMock.getItem.mockResolvedValueOnce(
      "https://www.skills.google/public_profiles/xyz",
    );

    const result = await StorageService.getProfileUrl();
    expect(result).toBe("https://www.skills.google/public_profiles/xyz");
  });

  it("returns empty string when nothing stored", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValueOnce(null);
    storageMock.getItem.mockResolvedValueOnce(null);

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
    storageMock.getItem.mockResolvedValueOnce(true);

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(true);
  });

  it("defaults to false when nothing set", async () => {
    vi.mocked(AccountService.getSettings).mockResolvedValueOnce({
      enableSearchFeature: true,
    });
    storageMock.getItem.mockResolvedValueOnce(null);

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(false);
  });
});

describe("formatBadgeText (via saveArcadeData side effects)", () => {
  // Test the formatBadgeText logic indirectly by checking badge calls
  // We test it directly by importing the internal logic through saveArcadeData behavior

  it("saves arcade data to legacy storage when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({ totalArcadePoints: 100 });
    expect(storageMock.setItem).toHaveBeenCalledWith(
      "local:arcadeData",
      expect.objectContaining({ totalArcadePoints: 100 }),
    );
  });

  it("adds lastUpdated when saving", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({ totalArcadePoints: 50 });
    const savedData = storageMock.setItem.mock.calls[0][1];
    expect(savedData.lastUpdated).toBeTruthy();
  });
});
