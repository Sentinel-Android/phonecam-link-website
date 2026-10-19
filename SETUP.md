# Set up PhoneCam Link on Windows

## 1. Extract and open the preview

1. Extract `PhoneCam-Link-Website.zip` to a normal folder, for example `C:\Projects\phonecam-link-website`.
2. Open the extracted `phonecam-link-website` folder.
3. Open `dist`, then double-click `index.html`.

This is the built website. It works offline and needs no installation just to view. Do not open the source-level `index.html` directly: it contains configuration tokens that the build replaces.

The site includes original illustrative artwork and device interfaces. It does not connect to your phone, request camera permission, or stream a live feed. The landscape/portrait controls and independent Flip horizontally switch demonstrate the website's framing interaction.

## 2. Install the development tools

- Use [Node.js LTS](https://nodejs.org/en/download), version 22 or later. 
- Use VS Code or another editor you prefer.
- Use Git/GitHub Desktop if you will publish through a repository.

After installing Node, close and reopen your terminal. Check:

```powershell
node --version
```

The project does not need Java, Spring Boot, PostgreSQL, Docker, Heroku, Python, Flutter or paid template tooling.

## 3. Run the editable website

Open the extracted folder in VS Code. Choose Terminal → New Terminal and run:

```powershell
node scripts/serve.mjs
```

Open http://localhost:5173 in Chrome or Edge. Keep the terminal running. Save a source file and refresh the browser to see changes. Press Ctrl+C in the terminal to stop the preview.

`npm run dev` runs the same command. If PowerShell reports that `npm.ps1` is blocked, use the direct `node` command above or `npm.cmd run dev`; you do not need to change PowerShell's execution policy.

If port 5173 is already occupied:

```powershell
node scripts/serve.mjs --port 5174
```

Then open http://localhost:5174.

## 4. Add the real GitHub repository

Open `site.config.json` and set `repositoryUrl` to the repository that contains the application releases. This may be a different repository from the website source.

The following is an example only. Replace OWNER and APP-REPO with your actual values:

```json
{
  "repositoryUrl": "https://github.com/OWNER/APP-REPO",
  "releasesUrl": "",
  "releaseTag": "",
  "androidDownloadUrl": "",
  "windowsDownloadUrl": "",
  "siteUrl": "",
  "releaseLabel": "Available on GitHub",
  "description": "Bring your Android phone camera to your Windows PC with PhoneCam Link. Explore the experience and get the apps from GitHub Releases."
}
```

Do not paste a personal access token or other credentials into this file. These fields contain public URLs and text only.

### Use a release page

With only `repositoryUrl` filled in:

- Both download cards open `REPOSITORY/releases/latest`.
- “GitHub releases” opens `REPOSITORY/releases`.
- The footer opens the repository itself.

Visitors select the APK or Windows installer from that release. Use a public release that contains both packages. GitHub's `/releases/latest` normally points to a full release; if your intended download is a prerelease, set its exact `releaseTag`.

To link a particular release, set `releaseTag` to its exact tag. The application version is never inferred or changed by the website.

### Use direct installer links

For the best download experience, copy the APK and Windows installer links from the release's Assets list into `androidDownloadUrl` and `windowsDownloadUrl`. Copy the links instead of guessing the filenames.

Examples of URL shapes, not working downloads:

```text
https://github.com/OWNER/APP-REPO/releases/download/TAG/ACTUAL-ANDROID-FILE.apk
https://github.com/OWNER/APP-REPO/releases/download/TAG/ACTUAL-WINDOWS-FILE.msi
```

Direct download URLs take priority over the selected release page. Keep them updated when publishing a new application release. Leave them empty if you prefer GitHub to show the release page.

If you want to announce a version, set `releaseLabel` to the wording appropriate to the selected release. This is display text only.

## 5. Rebuild after editing

```powershell
node --test scripts/*.test.mjs
node scripts/build.mjs
node scripts/serve.mjs --dist
```

Stop an existing preview before starting another on the same port. The build replaces only the generated `dist` folder. Edit the source files, not files inside `dist`.

The local build permits unconfigured links so you can review the design. A public build requires the repository and website URL:

```powershell
node scripts/build.mjs --production
```

Set `siteUrl` first when using this command locally. Example shape: `https://OWNER.github.io/WEBSITE-REPO`. Use your actual public website address, without a trailing slash. The public build adds the canonical URL, Open Graph image URL, sitemap and robots file.

## 6. Publish to GitHub Pages

These are the publication steps for you to perform when the website is ready. The files have not been published automatically.

1. Create a GitHub repository for the website. A separate repository such as `phonecam-link-website` keeps the landing page independent of APK/MSI builds.
2. Put the extracted project contents at the repository root. `package.json` and `.github` must be at the root, not one folder deeper. GitHub Desktop can publish this local folder if you prefer a GUI.
3. Ensure `site.config.json` points to your actual application repository.
4. Commit and push the source to the `main` branch. `dist` is ignored because the workflow builds it.
5. In the website repository, open Settings → Pages.
6. Under Build and deployment, choose **GitHub Actions** as the source.
7. Open Actions → Publish PhoneCam Link website → Run workflow. If an initial run failed before Pages was enabled, rerun it now.
8. Open the website URL shown by the successful deployment.

The workflow checks the configuration, builds `dist`, uploads that folder as the Pages artifact, and deploys it. Future pushes to `main` publish an updated website.

The workflow obtains the deployed URL from GitHub Pages automatically. You can leave `siteUrl` empty when using it; an explicitly configured `siteUrl` overrides the workflow's value.

All CSS, JavaScript, image and anchor paths are relative, so a project URL such as `https://OWNER.github.io/phonecam-link-website/` works. A custom domain can be configured later in Pages settings, with `siteUrl` updated to match if you set it manually.

Official reference: [GitHub's custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 7. Review on your laptop and phone

Check the following before publishing:

1. The hero heading fits, the phone/laptop illustration stays inside the viewport, and nothing scrolls sideways.
2. Scroll through the expanding landscape section.
3. Select Landscape and Portrait, then toggle Flip horizontally with each in the playground. The image crop and description should change.
4. Toggle the composition grid, expand the scene, then close it with Close and Escape.
5. Use the motion button in the top navigation to pause motion. Also test the operating system's reduced-motion setting.
6. At narrow widths, open and close the navigation menu. Test its links and Escape key.
7. Use Tab to reach controls and confirm focus is visible.
8. Open both download links and the release-notes link. Confirm that the correct APK and MSI are present and publicly accessible.
9. Try 390px, 768px and 1440px widths in browser DevTools. Test once on the actual Android phone after deployment.

The local preview is deliberately bound to your own computer by default. To optionally preview from your phone on your trusted local network, run the following in PowerShell:

```powershell
$env:HOST = "0.0.0.0"
node scripts/serve.mjs
```

Connect the phone to the same Wi-Fi and open `http://YOUR-LAPTOP-LAN-IP:5173`. If Windows asks, allow the preview on the private network. Stop the server when finished and clear this setting with `Remove-Item Env:HOST` in that terminal. Public GitHub Pages hosting does not require this local-network step.

## 8. Make future changes

| Change | Where |
| --- | --- |
| Headline and wording | `index.html` |
| Colours | Variables near the top of `styles.css` |
| Typography | Base layer in `styles.css` |
| Section spacing and device positions | Component and responsive layers in `styles.css` |
| Interactive behaviour | `app.js` |
| New app release | `site.config.json` |
| Real product screenshots | Add to `assets`, update the relevant image tags; WebP/JPG/SVG assets are copied automatically |
| Logo | Replace `assets/favicon.svg` and the header/footer brand mark |

When the product screenshots are ready, replace the illustrative interfaces section by section. Keep the generated landscape if you want it as a brand image, or replace it with original product footage.

A later Spring Boot backend can serve forms or other approved features through HTTPS APIs. The frontend can remain on GitHub Pages. There is no backend configuration to do now.


## 9. New pages and interactions

The site has three pages: `index.html` (product story), `downloads.html` (Android/Windows packages and separate repository/releases links), and `get-started.html` (installation and connection instructions). The `dist` folder contains all three. Keep its files together. The main header links to Downloads and Get Started; its former section-jump navigation has been removed.

Run `node scripts/preview-file.mjs` to create offline review copies. Each copy now includes all three pages, images, styles and scripts. Open `PhoneCam-Link-Preview.html` by itself; Downloads and Get Started work inside it. The other two copies simply start on their named page. These review files use an embedded frame; the production website in `dist` uses ordinary HTML pages.

Connectivity content lives in `content/connectivity.json`. Add or reorder objects there; tabs and panels are built from the data, without changing their count in JavaScript. Use unique lowercase IDs. Supported visuals are `wireless`, `cable`, `direct`, and `network`. Supported status labels are `implemented`, `testing`, and `planned`. Only add confirmed product features. The retired USB accessory mode and automatic-open flow have been removed. Adding a future mode does not require editing the tab count in JavaScript. A fundamentally different transport illustration can add a new renderer later.

The optional `releasesUrl` may point to a different GitHub releases index; leaving it empty derives it from `repositoryUrl`.

Additional preview checks:

- Drag the camera comparison with mouse and touch; use arrow keys while its range input is focused.
- Choose Ultra wide, Wide, Telephoto, Periscope and Front camera. Rear lenses change the landscape framing. Front camera shows an empty workspace facing an alpine window; no people appear in this example.
- Select every connectivity tab. Test Left/Right/Home/End on the tab row.
- Bring the USB ADB setup scene into view. It plays once, zooming into Android mode/start, Windows mode/connect, and Android authorization before showing Connected. Scrolling upward must not rewind it. Move it fully offscreen and back to check that it resets. Test Pause demo, Replay and the global pause icon. With reduced motion enabled, the connected view and written steps remain available.
- Navigate Home → Downloads → Get Started → Home at phone and laptop sizes.

The app panels are source-based reconstructions from PhoneCam Link 1.1.21 with blue accents. They are not captured screenshots. The camera slider artificially softens one generated alpine landscape, and lens previews crop one landscape. Replace them with matched real captures before making quality claims. Device imagery is unbranded, generated concept art. Samsung Galaxy S24 Ultra and Galaxy Book6 Ultra appear only in the development test-device note. USB accessory and automatic opening are not advertised. USB ADB requires debugging authorization and manual Start camera/Connect. Phone app documents are cropped to a normal phone viewport rather than stretched. Faces appear only in the video-call and content-creation illustrations, on laptop screens; both phone screens show PhoneCam Link controls.

## 10. Copy decisions for this revision

The opening, use-case, app, nature introduction, comparison and closing/footer wording were kept as selected. Lens uses “Choose your lens”, framing uses “Set your orientation”, and connectivity uses direct mode names. Repeated benefit cards were removed. Downloads and Get Started copy remain unchanged pending review of their now-working offline pages. See COPY-REVIEW.md.

## 11. Preview fixes

The opening compatibility line was removed at the user’s request. Section links such as “See what it can do” scroll inside the one-file preview rather than navigating to its outer file. Flip is horizontal mirroring in both orientations. Wi-Fi and Wi-Fi Direct show matching signal waves without USB port/plug parts; USB ADB uses a pulse measured against the entire cable path. The lens and USB illustrations have viewport-based height limits. Written USB steps are available under “Read the setup steps”, and padding before the closing invitation is reduced.

## 12. Shared navigation and tab icon

A fixed bottom-right scroll-to-top button appears after scrolling beyond the header and hides again at the top. It is present on Home, Downloads and Get Started, including inside the offline preview. Smooth scrolling respects the global pause/reduced-motion preference. Both wireless connection illustrations use synchronized outward signal-ring animation. The camera logo is included as SVG and PNG icons on the production pages and on the outer offline preview document.

Windows compatibility was checked against the supplied application source: its virtual-camera host calls MFCreateVirtualCamera and its installer requires build 22000 or newer. Microsoft lists build 22000 as the minimum for that API: https://learn.microsoft.com/en-us/windows/win32/api/mfvirtualcamera/nf-mfvirtualcamera-mfcreatevirtualcamera . The Windows 11 requirement is retained.

## 13. Browser navigation in the offline preview

The one-file review now records page and section navigation in browser history. Use Back and Forward to return between Home, Downloads, Get Started and section links. Saved scroll positions are restored within the preview session. The address fragment identifies the current page and section; reloading can reopen that route. Normal production pages continue to use ordinary browser navigation.

The top arrow fades over 350 ms without moving or scaling when appearing or disappearing. While hidden it cannot receive clicks or keyboard focus. Paused/reduced-motion preferences keep transitions immediate. Get Started now uses its explicit page label, setup heading and direct instruction headings as approved.

## 14. Get Started sizing and neutral top button

The top button is black and white, including hover/focus, and uses a 350 ms opacity-only fade. No translation or scaling is applied. Only the “GET STARTED” page label is enlarged, to a responsive 18–24 px. The broader h1/body/card size edits were reverted after the user clarified the intended text. The user clarified that the existing fonts should remain and that the detailed section below “Choose your connection” is already fine. No font families or styles in that detailed section were changed.

## 15. Final setup overview treatment

After the user invited a broader visual refinement, the Get Started introduction was styled with an explicit responsive main title (44–84 px), the existing enlarged page label, a larger supporting sentence, and three lightly bordered setup cards. Cards stack into compact number/icon and text layouts on phones. Font families and the detailed connection guide are retained. The scroll-to-top button now uses the same paper/ink and shared hover-color variables as the “Get the apps” button, without color inversion or movement.
