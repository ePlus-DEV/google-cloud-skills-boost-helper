import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const path = ".output/chrome-mv3/manifest.json";
const manifest = JSON.parse(readFileSync(path, "utf8"));
const requested = new Set([
  ...(manifest.permissions ?? []),
  ...(manifest.optional_permissions ?? []),
]);

// Purple Potassium: these privileges are unnecessary for the shipped Chrome UI.
// tabs.create/query/sendMessage do not on their own require the "tabs" privilege.
// Browser notifications are currently disabled in the options UI.
for (const permission of ["tabs", "notifications"]) {
  assert.ok(
    !requested.has(permission),
    `Chrome Web Store review risk: unused "${permission}" permission in ${path}`,
  );
}

assert.ok(
  requested.has("storage"),
  "The extension needs the storage permission for accounts and preferences",
);

