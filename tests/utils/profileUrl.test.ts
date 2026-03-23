import { describe, it, expect } from "vitest";
import {
  canonicalizeProfileUrl,
  isProfileUrl,
  extractProfileId,
} from "../../utils/profileUrl";

describe("canonicalizeProfileUrl", () => {
  it("returns null for invalid URL", () => {
    expect(canonicalizeProfileUrl("not-a-url")).toBeNull();
  });

  it("returns null for unaccepted host", () => {
    expect(
      canonicalizeProfileUrl("https://google.com/public_profiles/123"),
    ).toBeNull();
  });

  it("returns canonical URL for skills.google", () => {
    const url = "https://www.skills.google/public_profiles/abc";
    expect(canonicalizeProfileUrl(url)).toBe(url);
  });

  it("canonicalizes cloudskillsboost URL", () => {
    const result = canonicalizeProfileUrl(
      "https://www.cloudskillsboost.google/public_profiles/abc",
    );
    expect(result).toContain("www.skills.google");
  });
});

describe("isProfileUrl", () => {
  it("returns false for invalid URL", () => {
    expect(isProfileUrl("not-a-url")).toBe(false);
  });

  it("returns false for URL without /public_profiles/", () => {
    expect(isProfileUrl("https://www.skills.google/catalog")).toBe(false);
  });

  it("returns true for valid profile URL", () => {
    expect(
      isProfileUrl("https://www.skills.google/public_profiles/abc123"),
    ).toBe(true);
  });

  it("returns true for cloudskillsboost profile URL", () => {
    expect(
      isProfileUrl(
        "https://www.cloudskillsboost.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns false for unaccepted host", () => {
    expect(isProfileUrl("https://example.com/public_profiles/abc123")).toBe(
      false,
    );
  });
});

describe("extractProfileId", () => {
  it("returns null for invalid URL", () => {
    expect(extractProfileId("not-a-url")).toBeNull();
  });

  it("returns null for URL without /public_profiles/", () => {
    expect(extractProfileId("https://www.skills.google/catalog")).toBeNull();
  });

  it("extracts profile ID from skills.google URL", () => {
    expect(
      extractProfileId("https://www.skills.google/public_profiles/abc123"),
    ).toBe("abc123");
  });

  it("extracts profile ID from cloudskillsboost URL", () => {
    expect(
      extractProfileId(
        "https://www.cloudskillsboost.google/public_profiles/xyz789",
      ),
    ).toBe("xyz789");
  });

  it("strips trailing slash from profile ID", () => {
    expect(
      extractProfileId("https://www.skills.google/public_profiles/abc123/"),
    ).toBe("abc123");
  });

  it("returns null for unaccepted host", () => {
    expect(
      extractProfileId("https://example.com/public_profiles/abc123"),
    ).toBeNull();
  });
});
