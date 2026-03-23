import { describe, it, expect } from "vitest";
import profileConfigService from "../../services/profileConfigService";
import { PROFILE_CONFIG } from "../../utils/config";

describe("ProfileConfigService", () => {
  describe("getAcceptedHosts", () => {
    it("returns a copy of accepted hosts", () => {
      const hosts = profileConfigService.getAcceptedHosts();
      expect(hosts).toEqual(PROFILE_CONFIG.ACCEPTED_HOSTS);
    });

    it("returns a new array each time (immutable)", () => {
      const h1 = profileConfigService.getAcceptedHosts();
      const h2 = profileConfigService.getAcceptedHosts();
      expect(h1).not.toBe(h2);
    });
  });

  describe("isAcceptedHost", () => {
    it("returns true for www.skills.google", () => {
      expect(profileConfigService.isAcceptedHost("www.skills.google")).toBe(
        true,
      );
    });

    it("returns true for www.cloudskillsboost.google", () => {
      expect(
        profileConfigService.isAcceptedHost("www.cloudskillsboost.google"),
      ).toBe(true);
    });

    it("returns true for www.qwiklabs.com", () => {
      expect(profileConfigService.isAcceptedHost("www.qwiklabs.com")).toBe(
        true,
      );
    });

    it("returns false for unknown host", () => {
      expect(profileConfigService.isAcceptedHost("example.com")).toBe(false);
    });
  });

  describe("canonicalizeProfileUrl", () => {
    it("returns null for invalid URL", () => {
      expect(
        profileConfigService.canonicalizeProfileUrl("not-a-url"),
      ).toBeNull();
    });

    it("returns null for unaccepted host", () => {
      expect(
        profileConfigService.canonicalizeProfileUrl(
          "https://example.com/public_profiles/123",
        ),
      ).toBeNull();
    });

    it("returns URL as-is when host is already canonical", () => {
      const url = "https://www.skills.google/public_profiles/abc123";
      const result = profileConfigService.canonicalizeProfileUrl(url);
      expect(result).toBe(url);
    });

    it("replaces cloudskillsboost host with canonical host", () => {
      const url = "https://www.cloudskillsboost.google/public_profiles/abc123";
      const result = profileConfigService.canonicalizeProfileUrl(url);
      expect(result).toContain("www.skills.google");
      expect(result).toContain("/public_profiles/abc123");
    });

    it("replaces qwiklabs host with canonical host", () => {
      const url = "https://www.qwiklabs.com/public_profiles/abc123";
      const result = profileConfigService.canonicalizeProfileUrl(url);
      expect(result).toContain("www.skills.google");
    });

    it("preserves path and query params", () => {
      const url =
        "https://www.cloudskillsboost.google/public_profiles/abc123?foo=bar";
      const result = profileConfigService.canonicalizeProfileUrl(url);
      expect(result).toContain("foo=bar");
      expect(result).toContain("/public_profiles/abc123");
    });
  });
});
