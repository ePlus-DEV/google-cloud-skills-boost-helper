const fs = require("fs");
const path = require("path");

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("Failed to read", p, e.message);
    process.exit(2);
  }
}

const repoRoot = process.cwd();
const enPath = path.join(repoRoot, "public", "_locales", "en", "messages.json");
const dePath = path.join(repoRoot, "public", "_locales", "de", "messages.json");

const en = readJson(enPath);
const de = readJson(dePath);

const enKeys = Object.keys(en).sort();
const deKeys = Object.keys(de).sort();

const missingInDe = enKeys.filter((k) => !(k in de));
const extraInDe = deKeys.filter((k) => !(k in en));

const untranslated = [];
for (const k of enKeys) {
  if (k in de) {
    const enMsg = en[k] && en[k].message ? en[k].message.trim() : "";
    const deMsg = de[k] && de[k].message ? de[k].message.trim() : "";
    if (!deMsg) {
      untranslated.push({ key: k, reason: "empty" });
      continue;
    }
    // consider untranslated if exactly the same (case-insensitive)
    if (enMsg.toLowerCase() === deMsg.toLowerCase()) {
      untranslated.push({ key: k, reason: "same_as_en" });
    }
  }
}

console.log("Locale comparison report");
console.log("========================");
console.log("English keys:", enKeys.length);
console.log("German keys:", deKeys.length);
console.log("Missing in de:", missingInDe.length);
console.log("Extra in de:", extraInDe.length);
console.log("Untranslated/empty in de:", untranslated.length);

if (missingInDe.length) {
  console.log("\n--- Missing keys in de/messages.json ---");
  missingInDe.forEach((k) => console.log(k));
}

if (extraInDe.length) {
  console.log("\n--- Extra keys in de/messages.json (not present in en) ---");
  extraInDe.forEach((k) => console.log(k));
}

if (untranslated.length) {
  console.log("\n--- Untranslated or empty keys in de/messages.json ---");
  untranslated.forEach((x) => console.log(x.key + "  (" + x.reason + ")"));
}

if (!missingInDe.length && !extraInDe.length && !untranslated.length) {
  console.log("\nAll keys present and appear translated.");
}

// Exit with code 0 always; humans will inspect output.
process.exit(0);
