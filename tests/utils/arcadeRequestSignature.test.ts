import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildArcadeSignatureHeaders } from "../../utils/arcadeRequestSignature";

describe("buildArcadeSignatureHeaders", () => {
  beforeEach(() => {
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
  });

  it("requires key and secret for Arcade v3", async () => {
    vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "");

    await expect(
      buildArcadeSignatureHeaders(
        "https://private-api.example.test/api/v3/arcade",
        {
          url: "https://www.skills.google/public_profiles/abc123",
        },
      ),
    ).rejects.toThrow(/requires WXT_ARCADE_CLIENT_KEY/i);
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

  it("signs the manifest version in the body and exposes it as a header", async () => {
    const payload: Record<string, unknown> = {
      url: "https://www.skills.google/public_profiles/abc123",
      profileId: "abc123",
    };

    const headers = await buildArcadeSignatureHeaders(
      "https://private-api.example.test/api/v3/arcade",
      payload,
    );

    expect(payload.extensionVersion).toBe("1.3.1");
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
});
