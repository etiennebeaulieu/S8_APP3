// Minimal client-side logic so the deployed site looks interactive.
// The "deployment info" section reads a build timestamp from a query param
// (the pipeline can add ?built=timestamp to the Pages URL if you want)
// but here we fallback to a static message so students always see something.

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

document.getElementById('preview').addEventListener('click', () => {
  const msg = document.getElementById('message').value || '(empty)';
  document.getElementById('previewOut').innerText = `Preview:\n\n${msg}`;
});

// Small toy "download snapshot" that creates a txt file with the preview content.
// This is harmless and gives students a visible action they can test after deploy.
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

setDeployInfo();
loadBuildInfo();
