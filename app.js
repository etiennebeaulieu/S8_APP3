// app.js — extended to show dependency build result

function getQueryParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

function setDeployInfo() {
  const built = getQueryParam('built') || null;
  const repo = getQueryParam('repo') || document.title || 'insecure-ci-demo';
  const el = document.getElementById('deploy-info');

  if (built) {
    el.innerText = `Built and deployed: ${new Date(Number(built)).toLocaleString()} — Source: ${repo}`;
  } else {
    el.innerText = `Site deployed statically. (No build metadata provided). Repo: ${repo}`;
  }
}

async function loadBuildInfo() {
  try {
    const res = await fetch('./build-info.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No build-info.json');
    const info = await res.json();
    const p = document.getElementById('build-info');
    p.textContent = `Build #${info.build} — ${new Date(info.timestamp).toLocaleString()} (commit ${info.commit.substring(0,7)})`;
  } catch {
    document.getElementById('build-info').textContent = 'No build info available';
  }
}

// NEW: fetch the generated dependency-info.json and display the dependency build status
async function loadDependencyInfo() {
  const el = document.getElementById('dependency-status');
  try {
    const res = await fetch('./dependency-info.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No dependency-info.json');
    const info = await res.json();
    // normalize expected values to uppercase to be robust
    const val = (info.value || '').toString().toUpperCase();
    if (val.includes('CLEAN')) {
      el.textContent = 'Built with dependency: CLEAN';
      el.className = 'badge clean';
    } else if (val.includes('EVIL')) {
      el.textContent = 'Built with dependency: EVIL';
      el.className = 'badge evil';
    } else if (val.startsWith('REQUIRE_FAILED') || val.startsWith('ERROR')) {
      el.textContent = `Dependency detection failed: ${info.value}`;
      el.className = 'badge unknown';
    } else {
      el.textContent = `Dependency reported: ${info.value}`;
      el.className = 'badge unknown';
    }
  } catch (e) {
    el.textContent = 'Dependency info not available';
    el.className = 'badge unknown';
  }
}

// existing preview & download code
document.getElementById('preview').addEventListener('click', () => {
  const msg = document.getElementById('message').value || '(empty)';
  document.getElementById('previewOut').innerText = `Preview:\n\n${msg}`;
});

document.getElementById('download').addEventListener('click', () => {
  const msg = document.getElementById('message').value || '';
  const blob = new Blob([`Snapshot from insecure-ci-demo\n\n${msg}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'snapshot.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// init
setDeployInfo();
loadBuildInfo();
loadDependencyInfo();
