# Vinicius Oliveira — Código com propósito

A complete manga-inspired professional portfolio. Editorial panels, paper/ink/red art direction, and an approachable story about backend development.

## Features

- Portuguese-first site with persistent English toggle
- Professional quick view for recruiters
- Detailed Keel, Star Wars API, and Auxilium case studies
- Project filtering and local backend-concept playground
- Fourteen original badge images: eleven issuer-verified Credly badges and three historical Oracle records, individual dossiers, and issuer verification links
- Detailed Chinese-inspired SVG paper dragon with continuous head-to-tail flying waves and physically attached credential banners
- Automatic enter/toss/exit/re-entry cycles rotate through the badge catalog with independently phased segments, fins, limbs, mane, whiskers, and tail
- Credential missions, repeat-mode control, synchronized pause/resume, restart, route scrubbing, and a stable delivery dock
- Reading the delivered credential by hover or keyboard focus holds the flight; visibility and responsive-layout changes preserve its state
- Layered papercraft dragon anatomy: overlapping scales, antlers, facial planes, mane, whiskers, plated joints/claws, and tail folds
- Static close-up illustration inspector with face, armor/claws, tail, and whole-dragon views
- A searchable 58-record formation/participation catalog with private-source URLs excluded
- Rich visible experience details and a dedicated GitHub repository chapter
- Four-layer architecture explorer with inspectable illustrative code and request tracing
- Hidden keyboard/touch margin panels and a local bug-hunt extra
- Real email link, working clipboard copy, GitHub, and LinkedIn
- Keyboard command palette: Ctrl/⌘ K, arrow keys, Enter, Escape
- Native accessible dialogs, reduced-motion support, manual animation pause
- Mobile/touch layouts; all main content remains available without JavaScript
- Self-hosted fonts, zero runtime dependencies, no trackers, no fake contact forms

## Develop and test

Requires Node.js 20 or newer. Runtime pages do not require Node.js.

```sh
npm ci
npm run check
npm run build
npm run preview
```

The preview serves `dist/` at http://localhost:4173.

`npm run preview:standalone` builds a self-contained downloadable HTML next to the repository. All fonts, artwork, styles, scripts, and dynamic badge-dialog images are embedded. `npm run test:standalone` tests the actual file in Chromium.

```sh
npx playwright install --with-deps chromium
npm test
```

The automated suite starts its own local preview server, runs Chromium tests and axe-core audits, then saves screenshots and a report under `test-results/`. For environments requiring a custom installed Chromium path, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. For standard Playwright caches, `PLAYWRIGHT_BROWSERS_PATH` is supported by Playwright.

## GitHub Pages

The existing repository and history are preserved. `.github/workflows/pages.yml` builds and tests the static site, then requires the installed GitGuardian app's `GitGuardian Security Checks` check to be completed and successful for the exact tested commit (app ID `46505`, slug `gitguardian`). It reads the Checks API with the workflow's existing `GITHUB_TOKEN`; no separate GitGuardian API key is required. Missing/pending checks wait for at most ten minutes; failure, an API error, or timeout blocks publication. This verifies the installed app's result and does not claim the separate ggshield job's scanning coverage.

Pull requests validate their actual head SHA, rather than borrowing an approval from GitHub's synthetic merge commit, and never deploy. A push to `main` or a manual run selecting `main` builds and verifies that event's exact SHA. The deployment rechecks GitGuardian, requires matching build/security/checkout SHAs and current `main`, and selects the artifact named for that SHA. A merge that creates a new SHA needs its own successful app check; the PR's older approval cannot authorize it. PR runs cannot cancel main publication runs. Set the Pages source to **GitHub Actions**; a local build or feature branch does not publish by itself.

`npm run test:security` exercises the gate's trusted identity, exact commit selection, polling, API errors and main-only deployment restrictions without using credentials or making network requests. See [docs/SECURITY-GATE.md](docs/SECURITY-GATE.md) for operational limits.

The build allowlists `profile.jpg`, the original vector illustrations, authentic public badge PNGs, and licensed local fonts. Historic resume PDFs and legacy project assets are preserved in the repository but are not copied into the deploy artifact.

## Content and sources

See [docs/CONTENT.md](docs/CONTENT.md) for project and credential source URLs, and [docs/QUALITY.md](docs/QUALITY.md) for review scope and test limitations.

## Contact

- [Email](mailto:vinicius.oliveiratwt@gmail.com)
- [GitHub](https://github.com/viniciuslks7)
- [LinkedIn](https://www.linkedin.com/in/vinicius-oliveira-72698a1ab/)
- Intended public site: [viniciuslks7.github.io](https://viniciuslks7.github.io/)
