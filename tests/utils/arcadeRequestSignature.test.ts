import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { isBonusMilestoneCompletedMock } = vi.hoisted(() => ({
  isBonusMilestoneCompletedMock: vi.fn(),
}));

vi.mock("../../services/bonusMilestoneService", () => ({
  isBonusMilestoneCompleted: isBonusMilestoneCompletedMock,
}));

import { buildArcadeSignatureHeaders } from "../../utils/arcadeRequestSignature";

describe("buildArcadeSignatureHeaders", () => {
  beforeEach(() => {
    isBonusMilestoneCompletedMock.mockResolvedValue(false);
    vi.stubGlobal("crypto", webcrypto as unknown as Crypto);
    vi.stubGlobal("browser", {
      runtime: {
        getManifest: () => ({ version: "1.3.1" }),
      },
    });
    vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "release-client-key");
    vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "release-client-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("allows unsigned Arcade v3 when signing credentials are missing", async () => {
    vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "");
    vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "");
    const payload: Record<string, unknown> = {
      url: "https://www.skills.google/public_profiles/abc123",
    };

    await expect(
      buildArcadeSignatureHeaders(
        "https://private-api.example.test/api/v3/arcade",
        payload,
      ),
    ).resolves.toEqual({});
    expect(payload.extensionVersion).toBe("1.3.1");
    expect(payload.facilitator).toEqual({ bonusMilestoneCompleted: false });
  });

  it("does not block Arcade v3 when only one signing credential is present", async () => {
    vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "");

    await expect(
      buildArcadeSignatureHeaders(
        "https://private-api.example.test/api/v3/arcade",
        {
          url: "https://www.skills.google/public_profiles/abc123",
        },
      ),
    ).resolves.toEqual({});
  });

  it("rejects endpoints outside the Arcade v3 contract", async () => {
    await expect(
      buildArcadeSignatureHeaders(
        "https://private-api.example.test/api/arcade",
        {
          url: "https://www.skills.google/public_profiles/abc123",
        },
      ),
    ).rejects.toThrow(/requires the \/api\/v3\/arcade endpoint/i);
  });

  it("signs only the Bonus Milestone self-report flag with the manifest version", async () => {
    const payload: Record<string, unknown> = {
      url: "https://www.skills.google/public_profiles/abc123",
      profileId: "abc123",
    };

    const headers = await buildArcadeSignatureHeaders(
      "https://private-api.example.test/api/v3/arcade",
      payload,
    );

    expect(payload.extensionVersion).toBe("1.3.1");
    expect(payload.facilitator).toEqual({ bonusMilestoneCompleted: false });
    expect(payload.facilitator).not.toHaveProperty("participating");
    expect(headers).toEqual(
      expect.objectContaining({
        "X-Arcade-Key": "release-client-key",
        "X-Arcade-Extension-Version": "1.3.1",
        "X-Arcade-Timestamp": expect.stringMatching(/^\d+$/),
        "X-Arcade-Nonce": expect.stringMatching(/^[A-Za-z0-9_-]{16,128}$/),
        "X-Arcade-Signature": expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it("sends true when the user has manually confirmed Bonus Milestone", async () => {
    isBonusMilestoneCompletedMock.mockResolvedValue(true);
    const payload: Record<string, unknown> = {
      url: "https://www.skills.google/public_profiles/abc123",
    };

    await buildArcadeSignatureHeaders(
      "https://private-api.example.test/api/v3/arcade",
      payload,
    );

    expect(payload.facilitator).toEqual({ bonusMilestoneCompleted: true });
  });

  it("produces the same signature with or without a trailing endpoint slash", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_786_420_000_000);
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "01234567-89ab-cdef-0123-456789abcdef",
    );

    const payload = () => ({
      url: "https://www.skills.google/public_profiles/abc123",
      profileId: "abc123",
    });

    const withoutSlash = await buildArcadeSignatureHeaders(
      "https://private-api.example.test/api/v3/arcade",
      payload(),
    );
    const withSlash = await buildArcadeSignatureHeaders(
      "https://private-api.example.test/api/v3/arcade/",
      payload(),
    );

    expect(withSlash["X-Arcade-Signature"]).toBe(
      withoutSlash["X-Arcade-Signature"],
    );
  });
});
