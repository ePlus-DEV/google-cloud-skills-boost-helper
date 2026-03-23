import { describe, it, expect, vi, beforeEach } from "vitest";
import ArcadeApiService from "../../services/arcadeApiService";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock import.meta.env
vi.stubEnv("WXT_ARCADE_POINT_URL", "https://api.example.com/arcade");

import axios from "axios";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ArcadeApiService.isValidProfileUrl", () => {
  it("returns false for invalid URL", () => {
    expect(ArcadeApiService.isValidProfileUrl("not-a-url")).toBe(false);
  });

  it("returns false for URL without /public_profiles/", () => {
    expect(
      ArcadeApiService.isValidProfileUrl("https://www.skills.google/catalog"),
    ).toBe(false);
  });

  it("returns true for valid profile URL", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://www.skills.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns true for cloudskillsboost profile URL", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://www.cloudskillsboost.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns false for unaccepted host", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://example.com/public_profiles/abc123",
      ),
    ).toBe(false);
  });
});

describe("ArcadeApiService.fetchArcadeData", () => {
  it("returns data on successful API response", async () => {
    const mockData = { totalArcadePoints: 100, success: true };
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: mockData,
    });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).not.toBeNull();
    expect(result?.totalArcadePoints).toBe(100);
    expect(result?.lastUpdated).toBeTruthy();
  });

  it("adds lastUpdated timestamp to returned data", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result?.lastUpdated).toBeTruthy();
    expect(result).not.toBeNull();
    if (result?.lastUpdated) {
      expect(new Date(result.lastUpdated).getTime()).not.toBeNaN();
    }
  });

  it("returns null when status is not 200", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 404, data: null });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("Network error"));

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toBeNull();
  });

  it("sends canonical URL to API", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.cloudskillsboost.google/public_profiles/abc123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        url: expect.stringContaining("www.skills.google"),
      }),
    );
  });

  it("sends profileId in request body", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/myprofile123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ profileId: "myprofile123" }),
    );
  });
});
