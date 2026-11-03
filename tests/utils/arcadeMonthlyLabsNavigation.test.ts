import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const script = readFileSync(
  resolve(root, "entrypoints/arcade-access-code.content.ts"),
  "utf8",
);
const languages = [
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "ko",
  "pt_BR",
  "ru",
  "vi",
  "zh_CN",
];

describe("Arcade code assistant navigation", () => {
  it("sends users to Monthly Labs on Arcade Points, not to raw crawler JSON", () => {
    expect(script).toContain(
      'const MONTHLY_LABS_URL = "https://arcade.eplus.dev/#monthly-games"',
    );
    expect(script).toContain("monthlyLabsLink.href = MONTHLY_LABS_URL");
    expect(script).toContain(
      'monthlyLabsLink.textContent = t("arcadeCodeViewMonthlyLabs")',
    );
    expect(script).not.toContain("sourceLink.href = CRAWLER_SOURCE");
    expect(script).not.toContain("arcadeCodeViewSource");
  });

  it("opens the link in a separate tab without granting access to the opener", () => {
    expect(script).toContain('monthlyLabsLink.target = "_blank"');
    expect(script).toContain('monthlyLabsLink.rel = "noopener noreferrer"');
  });

  it("has a translated Monthly Labs label in all 13 locales", () => {
    for (const language of languages) {
      const catalog = JSON.parse(
        readFileSync(
          resolve(root, "public", "_locales", language, "messages.json"),
          "utf8",
        ),
      );
      expect(
        catalog.arcadeCodeViewMonthlyLabs?.message?.trim(),
        language,
      ).toBeTruthy();
      expect(catalog.arcadeCodeViewSource, language).toBeUndefined();
    }
    expect(
      JSON.parse(
        readFileSync(resolve(root, "public/_locales/en/messages.json"), "utf8"),
      ).arcadeCodeViewMonthlyLabs.message,
    ).toBe("View Monthly Labs");
  });
});
