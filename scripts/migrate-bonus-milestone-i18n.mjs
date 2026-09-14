import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve("services/bonusMilestoneI18n.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const match = source.match(
  /const COPY:\s*Record<string, BonusMilestoneCopy>\s*=\s*(\{[\s\S]*?\n\});\n\n\/\*\* Resolve/u,
);

if (!match) {
  throw new Error("Could not extract Bonus Milestone copy from the legacy i18n service.");
}

// The extracted block is a static object literal maintained in this repository.
// Evaluating only that literal lets this one-time migration preserve every
// existing translation exactly while moving it into Chrome's native catalogs.
const copyByLocale = Function(`"use strict"; return (${match[1]});`)();

const keyMap = {
  claim: "bonusMilestoneClaim",
  claimTooltip: "bonusMilestoneClaimTooltip",
  confirmTitle: "bonusMilestoneConfirmTitle",
  confirmMessage: "bonusMilestoneConfirmMessage",
  confirmCheckbox: "bonusMilestoneConfirmCheckbox",
  confirmButton: "bonusMilestoneConfirmButton",
  confirmedTitle: "bonusMilestoneConfirmedTitle",
  confirmedMessage: "bonusMilestoneConfirmedMessage",
  removeButton: "bonusMilestoneUndo",
  appliedTooltip: "bonusMilestoneAppliedTooltip",
  disclaimer: "bonusMilestoneDisclaimer",
  officialPage: "bonusMilestoneOfficialPage",
  updating: "bonusMilestoneUpdating",
  error: "bonusMilestoneError",
};

for (const [locale, copy] of Object.entries(copyByLocale)) {
  const filePath = path.resolve("public", "_locales", locale, "messages.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing locale catalog: ${filePath}`);
  }

  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const [legacyKey, messageKey] of Object.entries(keyMap)) {
    const value = copy[legacyKey];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Missing ${legacyKey} translation for locale ${locale}`);
    }

    // Claim/confirmation is intentionally fixed at +10 by product design.
    messages[messageKey] = { message: value.replaceAll("{points}", "10") };
  }

  fs.writeFileSync(filePath, `${JSON.stringify(messages, null, 2)}\n`, "utf8");
}

console.log(`Migrated Bonus Milestone messages for ${Object.keys(copyByLocale).length} locales.`);
