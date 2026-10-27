# Axon landing page

Live site: https://mrmanwonder.github.io/

The current Axon landing page uses React, TypeScript, Vite and GSAP. The serif hero, pure black background, amber dot wave and porcelain headline match the published Axon prototype.

## Develop and build

Use Node.js 22.12 or newer.

```sh
cd site-source
npm ci
npm run dev
```

To validate and prepare a new production build:

```sh
npm test
npm run build
node scripts/prepare-pages.mjs
```

Commit the source and updated root `index.html` / `assets/`, then push to `main`. The existing GitHub Pages branch deployment publishes the root directory automatically. `.nojekyll` serves the compiled Vite output directly. No backend, API keys or runtime configuration is required; Explore Axon links to the app at https://axonstudy.online/app.

## Repository layout

- `index.html` and `assets/`: compiled site served by GitHub Pages.
- `site-source/`: editable React source, local fonts, scanner recording, checks and locked dependencies.
- `PREVIOUS-SITE.md`: documentation for the previous homepage. Its supporting files remain in place; its previous HTML can be recovered from commit `472dc5392d940de050bd98dacafdda8797f29901`.

Imported from the Axon prototype source commit `7f0f63ba3a7e2dce80d33580e0b124d86caa6b70`.
