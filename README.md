# Insecure CI Demo — Static Web App

This is the static web app used in the Insecure CI demo. The app is intentionally tiny — the pipeline (`.github/workflows/ci-insecure-owasp.yml`) contains the course's insecure CI/CD practices (OWASP Top 10 CI/CD risks).

To build locally:
1. `npm install` (not required; no deps)
2. `npm run build`  # copies public/ -> dist/

To preview locally:
- simply open `public/index.html` in your browser, or use a static server:
  `npx http-server public -p 3000`

Deployment:
- The instructor pipeline deploys `public/` to GitHub Pages.

Teaching note:
- Students should mainly modify the pipeline to add scanning, secrets hygiene, SBOM generation, and least-privilege deploy controls. Only minimal app code changes are expected (e.g., remove the `SAMPLE_API_KEY` from repo files).
