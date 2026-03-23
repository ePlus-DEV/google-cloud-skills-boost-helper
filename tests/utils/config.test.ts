import { describe, it, expect } from "vitest";
import { MARKDOWN_CONFIG, UI_COLORS, PROFILE_CONFIG } from "../../utils/config";

describe("MARKDOWN_CONFIG", () => {
  it("has ANNOUNCEMENT_URL defined", () => {
    expect(MARKDOWN_CONFIG.ANNOUNCEMENT_URL).toBeTruthy();
    expect(MARKDOWN_CONFIG.ANNOUNCEMENT_URL).toContain("https://");
  });

  it("has CHANGELOG_URL defined", () => {
    expect(MARKDOWN_CONFIG.CHANGELOG_URL).toBeTruthy();
    expect(MARKDOWN_CONFIG.CHANGELOG_URL).toContain("https://");
  });

  it("has DEFAULT_CONTAINER_ID", () => {
    expect(MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID).toBe("markdown-container");
  });

  it("has PARSER_OPTIONS with gfm and breaks", () => {
    expect(MARKDOWN_CONFIG.PARSER_OPTIONS.gfm).toBe(true);
    expect(MARKDOWN_CONFIG.PARSER_OPTIONS.breaks).toBe(true);
  });
});

describe("UI_COLORS", () => {
  it("has BADGE color defined", () => {
    expect(UI_COLORS.BADGE).toBeTruthy();
    expect(UI_COLORS.BADGE).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe("PROFILE_CONFIG", () => {
  it("has CANONICAL_HOST set to www.skills.google", () => {
    expect(PROFILE_CONFIG.CANONICAL_HOST).toBe("www.skills.google");
  });

  it("includes www.skills.google in ACCEPTED_HOSTS", () => {
    expect(PROFILE_CONFIG.ACCEPTED_HOSTS).toContain("www.skills.google");
  });

  it("includes www.cloudskillsboost.google in ACCEPTED_HOSTS", () => {
    expect(PROFILE_CONFIG.ACCEPTED_HOSTS).toContain(
      "www.cloudskillsboost.google",
    );
  });

  it("includes www.qwiklabs.com in ACCEPTED_HOSTS", () => {
    expect(PROFILE_CONFIG.ACCEPTED_HOSTS).toContain("www.qwiklabs.com");
  });

  it("has at least 3 accepted hosts", () => {
    expect(PROFILE_CONFIG.ACCEPTED_HOSTS.length).toBeGreaterThanOrEqual(3);
  });
});
