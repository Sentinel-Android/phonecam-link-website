# PhoneCam Link website

A static, three-page Android-to-Windows product website. No backend, support service, external fonts, runtime dependencies or GPT Sites. HTML, CSS and plain JavaScript with Node.js 22+ build scripts.

## Preview

Open `dist/index.html` after extracting the complete ZIP, or run:

```sh
node scripts/serve.mjs
```

Visit `http://localhost:5173`. Read `SETUP.md` for Windows setup, GitHub release configuration and GitHub Pages deployment.

## Pages

- Home: unbranded device hero, Meet/Zoom calls, livestreaming, reconstructed app UI, lens selector, illustrative quality slider, expandable framing demo, modular connectivity and a one-shot USB ADB setup walkthrough.
- Downloads: Android and Windows downloads, separate GitHub repository and releases links, system requirements.
- Get Started: Wi-Fi, USB ADB, Wi-Fi Direct and camera-source selection instructions.

## Commands

```sh
node --test scripts/*.test.mjs
node scripts/build.mjs
node scripts/serve.mjs --dist
node scripts/preview-file.mjs
```

Set actual public URLs in `site.config.json` before `node scripts/build.mjs --production`. No repository URL was supplied; unconfigured links are visibly disabled in the review build.

## Edit

Page content: the three source HTML files. Theme and responsive layouts: `styles.css`. Interactions: `app.js`. Extensible transport cards: `content/connectivity.json`. Optimized illustrations: `assets/`. Build and routing: `scripts/`.

See `DESIGN.md`, `ASSETS.md` and `VALIDATION.md` for visual direction, provenance and verification limits. The app-source archive is intentionally not bundled with the website.

The offline `PhoneCam-Link-Preview.html` includes Home, Downloads and Get Started in one file. People are shown only in call/streaming concepts; both phone screens show PhoneCam Link controls. Device names are confined to the development test-device note.
