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

const hosts = new Set(manifest.host_permissions ?? []);
assert.ok(
  hosts.has("https://raw.githubusercontent.com/*"),
  "Arcade code assistant requires access only to the public crawler host",
);
assert.ok(
  [...hosts].every((host) => host === "https://raw.githubusercontent.com/*"),
  "Do not add broad or unused host permissions for the crawler feature",
);
