import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REQUIRED_KEYS = [
  "bonusMilestoneClaim",
  "bonusMilestoneClaimTooltip",
  "bonusMilestoneConfirmTitle",
  "bonusMilestoneConfirmMessage",
  "bonusMilestoneConfirmCheckbox",
  "bonusMilestoneConfirmButton",
  "bonusMilestoneConfirmedTitle",
  "bonusMilestoneConfirmedMessage",
  "bonusMilestoneUndo",
  "bonusMilestoneAppliedTooltip",
  "bonusMilestoneDisclaimer",
  "bonusMilestoneOfficialPage",
  "bonusMilestoneUpdating",
  "bonusMilestoneError",
] as const;

type LocaleMessage = {
  message?: string;
};

type LocaleCatalog = Record<string, LocaleMessage>;

/** Read one Chrome extension locale catalog from public/_locales. */
function readCatalog(locale: string): LocaleCatalog {
  const filePath = path.resolve("public", "_locales", locale, "messages.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as LocaleCatalog;
}

describe("Bonus Milestone browser i18n catalogs", () => {
  const localeRoot = path.resolve("public", "_locales");
  const locales = fs
    .readdirSync(localeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  it("keeps every Bonus Milestone message in every shipped locale", () => {
    expect(locales.length).toBeGreaterThan(1);

    for (const locale of locales) {
      const catalog = readCatalog(locale);
      for (const key of REQUIRED_KEYS) {
        expect(catalog[key]?.message?.trim(), `${locale}:${key}`).toBeTruthy();
      }
    }
  });

  it("keeps the claim and confirm actions fixed at +10 in every locale", () => {
    for (const locale of locales) {
      const catalog = readCatalog(locale);
      expect(catalog.bonusMilestoneClaim?.message, locale).toContain("+10");
      expect(catalog.bonusMilestoneConfirmButton?.message, locale).toContain(
        "+10",
      );
    }
  });
});
