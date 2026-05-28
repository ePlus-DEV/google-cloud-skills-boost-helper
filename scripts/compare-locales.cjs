const fs = require('fs');
const path = require('path');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return { __error: true, message: e.message };
  }
}

const repoRoot = process.cwd();
const localesDir = path.join(repoRoot, 'public', '_locales');

const enPath = path.join(localesDir, 'en', 'messages.json');
const en = readJson(enPath);
const enKeys = Object.keys(en).sort();

function compareLocale(locale) {
  const p = path.join(localesDir, locale, 'messages.json');
  if (!fs.existsSync(p)) return { locale, error: 'missing_file' };
  const other = readJson(p);
  if (other && other.__error) return { locale, error: 'invalid_json', message: other.message };
  const otherKeys = Object.keys(other).sort();
  const missing = enKeys.filter(k => !(k in other));
  const extra = otherKeys.filter(k => !(k in en));
  const untranslated = [];
  for (const k of enKeys) {
    if (k in other) {
      const enMsg = (en[k] && en[k].message) ? en[k].message.trim() : '';
      const oMsg = (other[k] && other[k].message) ? other[k].message.trim() : '';
      if (!oMsg) untranslated.push({ key: k, reason: 'empty' });
      else if (enMsg.toLowerCase() === oMsg.toLowerCase()) untranslated.push({ key: k, reason: 'same_as_en' });
    }
  }
  return { locale, keys: otherKeys.length, missing, extra, untranslated };
}

const locales = fs.readdirSync(localesDir).filter(d => fs.statSync(path.join(localesDir, d)).isDirectory());

let overall = [];
for (const loc of locales) {
  if (loc === 'en') continue;
  const res = compareLocale(loc);
  overall.push(res);
}

console.log('Locales compared against English (en)');
console.log('=====================================');
overall.forEach(r => {
  if (r.error) {
    console.log(`${r.locale}: ERROR - ${r.error}${r.message ? ' - ' + r.message : ''}`);
    return;
  }
  console.log(`\nLocale: ${r.locale}`);
  console.log(`  Keys: ${r.keys}`);
  console.log(`  Missing: ${r.missing.length}`);
  console.log(`  Extra: ${r.extra.length}`);
  console.log(`  Untranslated/empty: ${r.untranslated.length}`);
  if (r.missing.length) {
    console.log('   --- Missing keys ---');
    r.missing.forEach(k => console.log('    ' + k));
  }
  if (r.extra.length) {
    console.log('   --- Extra keys ---');
    r.extra.forEach(k => console.log('    ' + k));
  }
  if (r.untranslated.length) {
    console.log('   --- Untranslated/empty keys ---');
    r.untranslated.forEach(x => console.log('    ' + x.key + '  (' + x.reason + ')'));
  }
});

console.log('\nSummary:');
overall.forEach(r => {
  if (r.error) console.log(`${r.locale}: ${r.error}`);
  else console.log(`${r.locale}: missing=${r.missing.length} extra=${r.extra.length} untranslated=${r.untranslated.length}`);
});

process.exit(0);
