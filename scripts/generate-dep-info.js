// scripts/generate-dep-info.js
// Node script run at build-time to capture what the installed dependency exports.

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public'); // adjust if your static dir differs
const OUT_FILE = path.join(OUT_DIR, 'dependency-info.json');

async function main() {
  try {
    // require the package that was installed during the build
    // Use the scoped name your Worker serves: @lab/super_legit_dependency
    const dep = require('@lab/super_legit_dependency');

    // The package we built exports a function returning "CLEAN" or "EVIL"
    let value = 'unknown';
    try {
      if (typeof dep === 'function') {
        value = String(dep());
      } else if (dep && typeof dep === 'object' && typeof dep.default === 'function') {
        value = String(dep.default());
      } else {
        value = String(dep);
      }
    } catch (e) {
      value = `error: ${e && e.message ? e.message : String(e)}`;
    }

    const payload = {
      installed: '@lab/super_legit_dependency@1.0.0',
      value,
      generatedAt: Date.now()
    };

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log('Wrote', OUT_FILE, payload);
  } catch (err) {
    // if require fails, still emit a file so the front-end can show missing info
    const payload = {
      installed: '@lab/super_legit_dependency@1.0.0',
      value: `require_failed: ${err && err.message ? err.message : String(err)}`,
      generatedAt: Date.now()
    };
    try {
      if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
      console.log('Wrote fallback', OUT_FILE, payload);
    } catch (e) {
      console.error('Failed to write dependency-info.json', e);
    }
    // don't throw so build can continue if you prefer; or rethrow to fail the build intentionally
    // throw err;
  }
}

main();
