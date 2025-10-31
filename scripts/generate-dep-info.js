// scripts/generate-dep-info.js
// Generate public/dependency-info.json with:
// - which internal package was installed (CLEAN/EVIL/unknown)
// - whether lodash (external) is up-to-date or outdated
//
// Usage: run after npm install in your build job.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_DIR = path.join(__dirname, '..', 'public');
const OUT_FILE = path.join(OUT_DIR, 'dependency-info.json');

function safeRequire(pkg) {
  try {
    return require(pkg);
  } catch (e) {
    return null;
  }
}

function runCmd(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], ...opts });
    return out.trim();
  } catch (e) {
    return null;
  }
}

// simple semver compare: returns -1 if a<b, 0 if a==b, 1 if a>b
function compareSemver(a, b) {
  if (!a || !b) return null;
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

async function main() {
  const out = {
    generatedAt: Date.now(),
    internalDependency: {
      name: '@lab/super_legit_dependency',
      installedValue: null, // e.g. CLEAN or EVIL or error
    },
    externalDependency: {
      name: 'lodash',
      installed: null,
      latest: null,
      status: 'unknown' // 'Up to date' | 'Outdated' | 'unknown'
    },
    summaryExternal: 'External dependency: unknown'
  };

  // ensure out dir exists
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1) detect internal package (same logic as before)
  try {
    const dep = safeRequire('@lab/super_legit_dependency');

    let value = 'unknown';
    try {
      if (!dep) {
        value = 'require_failed';
      } else if (typeof dep === 'function') {
        value = String(dep());
      } else if (dep && typeof dep === 'object' && typeof dep.default === 'function') {
        value = String(dep.default());
      } else {
        value = String(dep);
      }
    } catch (e) {
      value = `error: ${e && e.message ? e.message : String(e)}`;
    }
    out.internalDependency.installedValue = value;
  } catch (e) {
    out.internalDependency.installedValue = `error: ${e && e.message ? e.message : String(e)}`;
  }

  // 2) check lodash: installed version vs registry latest
  try {
    const installedPkg = safeRequire('lodash/package.json');
    const installedVersion = installedPkg && installedPkg.version ? installedPkg.version : null;
    out.externalDependency.installed = installedVersion;

    // ask npm registry for latest published version of lodash
    const latestVersion = runCmd('npm view lodash version');
    out.externalDependency.latest = latestVersion || null;

    if (installedVersion && latestVersion) {
      const cmp = compareSemver(installedVersion, latestVersion);
      if (cmp === -1) {
        out.externalDependency.status = 'Outdated';
        out.summaryExternal = 'External dependency: Outdated';
      } else if (cmp === 0) {
        out.externalDependency.status = 'Up to date';
        out.summaryExternal = 'External dependency: Up to date';
      } else if (cmp === 1) {
        // Installed is newer than registry latest (rare), treat as up-to-date but note it
        out.externalDependency.status = 'Installed newer than registry latest';
        out.summaryExternal = 'External dependency: Up to date';
      } else {
        out.externalDependency.status = 'unknown';
        out.summaryExternal = 'External dependency: unknown';
      }
    } else {
      // If we couldn't determine versions, attempt fallback: npm outdated
      const npmOutdatedJson = runCmd('npm outdated lodash --json');
      if (npmOutdatedJson) {
        try {
          const parsed = JSON.parse(npmOutdatedJson);
          if (parsed && parsed.lodash && parsed.lodash.current) {
            out.externalDependency.installed = parsed.lodash.current;
            out.externalDependency.latest = parsed.lodash.latest || parsed.lodash.wanted || null;
            const installed = parsed.lodash.current;
            const latest = parsed.lodash.latest || parsed.lodash.wanted || null;
            const cmp2 = (installed && latest) ? compareSemver(installed, latest) : null;
            if (cmp2 === -1) {
              out.externalDependency.status = 'Outdated';
              out.summaryExternal = 'External dependency: Outdated';
            } else {
              out.externalDependency.status = 'Up to date';
              out.summaryExternal = 'External dependency: Up to date';
            }
          } else {
            out.externalDependency.status = 'unknown';
            out.summaryExternal = 'External dependency: unknown';
          }
        } catch (e) {
          out.externalDependency.status = 'unknown';
          out.summaryExternal = 'External dependency: unknown';
        }
      } else {
        out.externalDependency.status = 'unknown';
        out.summaryExternal = 'External dependency: unknown';
      }
    }
  } catch (e) {
    out.externalDependency.status = `error: ${e && e.message ? e.message : String(e)}`;
    out.summaryExternal = 'External dependency: unknown';
  }

  // 3) convenience top-level fields
  out.summary = `${out.internalDependency.installedValue || 'unknown'} | ${out.summaryExternal}`;

  // write file
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('Wrote', OUT_FILE, out);
}

main();
