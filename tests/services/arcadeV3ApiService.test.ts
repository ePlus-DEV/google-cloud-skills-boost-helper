import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import ArcadeApiService from "../../services/arcadeApiService";
import { buildArcadeSignatureHeaders } from "../../utils/arcadeRequestSignature";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("../../utils/arcadeRequestSignature", () => ({
  buildArcadeSignatureHeaders: vi.fn((_endpoint: string, body: unknown) => {
    if (body && typeof body === "object" && !Array.isArray(body)) {
      (body as Record<string, unknown>).extensionVersion = "1.3.1";
    }

    return Promise.resolve({
      "X-Arcade-Key": "release-client-key",
      "X-Arcade-Timestamp": "1786413245",
      "X-Arcade-Nonce": "0123456789abcdef0123456789abcdef",
      "X-Arcade-Signature": "a".repeat(64),
      "X-Arcade-Extension-Version": "1.3.1",
    });
  }),
}));

describe("ArcadeApiService v3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "WXT_ARCADE_POINT_URL",
      "https://private-api.example.test/api/arcade",
    );
    vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "release-client-key");
    vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "release-client-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("derives signed v3 from the existing Arcade endpoint env and sends the extension version", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: { success: true },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(buildArcadeSignatureHeaders).toHaveBeenCalledWith(
      "https://private-api.example.test/api/v3/arcade",
      expect.objectContaining({
        profileId: "abc123",
      }),
    );
    expect(axios.post).toHaveBeenCalledWith(
      "https://private-api.example.test/api/v3/arcade",
      expect.objectContaining({
        profileId: "abc123",
        extensionVersion: "1.3.1",
      }),
      expect.objectContaining({
        timeout: 15_000,
        headers: expect.objectContaining({
          "X-Arcade-Key": "release-client-key",
          "X-Arcade-Extension-Version": "1.3.1",
        }),
      }),
    );
  });

  it("does not send the v3 request when signing cannot be built", async () => {
    vi.mocked(buildArcadeSignatureHeaders).mockRejectedValueOnce(
      new Error("Arcade v3 signing credentials are required."),
    );

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toBeNull();
    expect(axios.post).not.toHaveBeenCalled();
  });
});
