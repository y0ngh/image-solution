# Change Log

## 2026-06-10 00:26 KST

- Backed up the affected content pages and `CHANGELOG.md` in `.backups/2026-06-10_0026/`.
- Added practical usage instructions and implementation-specific limitations to the image, PDF, data, and receipt tool pages.
- Added a format-conversion guide to the home page without changing the existing feature introduction layout.
- Updated the site introduction to describe the currently available tools and Cloudflare Workers hosting accurately.

## 2026-06-10 00:24 KST

- Backed up `privacy.html` and `CHANGELOG.md` in `.backups/2026-06-10_0024/`.
- Expanded the privacy policy with the site's actual Cloudflare Workers, jsDelivr, and GitHub Issues service relationships.
- Added conditional Google AdSense cookie, identifier, personalized advertising opt-out, and consent-management disclosures.
- Updated the privacy policy effective date to June 10, 2026.

## 2026-06-10 00:03 KST

- Backed up `about.html` and `CHANGELOG.md` in `.backups/2026-06-10_0003/`.
- Removed the future feature expansion and implementation-maintenance paragraph from the site introduction.

## 2026-06-09 23:50 KST

- Backed up `index.html`, `assets/css/styles.css`, and `CHANGELOG.md` in `.backups/2026-06-09_2350/`.
- Replaced the home-page feature introduction with concise Image Solution service copy.
- Removed the unrelated feature checklist and expanded the introduction to the full content width above the privacy summary.

## 2026-06-09 23:46 KST

- Backed up all previously existing affected HTML files and `CHANGELOG.md` in `.backups/2026-06-09_2346/`.
- Added `contact.html` with a public GitHub Issues contact link and safe-submission guidance.
- Added `사이트 소개` and `문의` links to the shared side menu on every page.
- Removed advertising and Google AdSense guidance from the home-page privacy summary and privacy policy.

## 2026-06-09 23:28 KST

- Backed up `CHANGELOG.md` in `.backups/2026-06-09_2328/`.
- Added `.gitignore` to exclude macOS metadata and local backup snapshots from the public repository.
- Prepared the static website for publication from the `main` branch.

## 2026-06-09 23:21 KST

- Backed up all affected HTML files and `CHANGELOG.md` in `.backups/2026-06-09_2321/`.
- Changed the site title and brand text from `Everything you need` to `Image Solution`.
- Changed the shared side-menu label from `자르기 회전 뒤집기` to `이미지 회전 및 크롭` while leaving the tool page heading unchanged.

## 2026-06-09 14:52 KST

- Backed up `assets/js/watermark.js` and `CHANGELOG.md` in `.backups/2026-06-09_1452/`.
- Corrected the watermark transparency calculation so a lower transparency percentage produces a more opaque watermark.
- Changed the canvas opacity calculation to `1 - transparency`, making 10 percent transparency equal 90 percent opacity.

## 2026-06-09 01:13 KST

- Created a static JPG to PNG converter site for Cloudflare Pages.
- Added macOS-inspired centered app window, top-left menu bar, image upload, preview, resize controls, and PNG download flow.
- Added SEO metadata, structured content sections, privacy policy, site introduction, feature introduction, and robots.txt.
- Split styles and behavior into `assets/css/styles.css` and `assets/js/app.js` for easier maintenance.
- Recorded initial backup state in `.backups/2026-06-09_0113/CREATED_FILES.txt`.
- Backed up `assets/css/styles.css` and `CHANGELOG.md`, then removed viewport-scaled heading sizing and decorative radial background gradients.

## 2026-06-09 01:36 KST

- Backed up `index.html`, subpages, shared CSS, shared JS, and `CHANGELOG.md` in `.backups/2026-06-09_0136/`.
- Changed the visible and SEO-facing site title to `이미지 종합 솔루션 제공`.
- Replaced the top dropdown menus on `index.html` with a left-side function side tab opened by the menu button.

## 2026-06-09 01:44 KST

- Backed up `index.html`, subpages, and `CHANGELOG.md` in `.backups/2026-06-09_0144/`.
- Changed the site title and brand text from `이미지 종합 솔루션 제공` to `everything you want`.
- Removed the `사이트 소개` item from navigation links and removed the site introduction content section from `index.html`.

## 2026-06-09 01:55 KST

- Backed up `index.html`, `features.html`, `privacy.html`, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_0155/`.
- Added `data-tools.html` with client-side JSON to CSV and CSV to JSON conversion.
- Added `receipt-tools.html` with receipt text to CSV conversion and meal receipt print/PDF flow.
- Added `assets/js/data-tools.js` and `assets/js/receipt-tools.js` for the new tools.
- Updated menus, feature copy, and privacy copy to include the new browser-only data and receipt tools.

## 2026-06-09 02:00 KST

- Backed up HTML files and `CHANGELOG.md` in `.backups/2026-06-09_0200/`.
- Changed the site brand text from `everything you want` to `Everything you need`.
- Moved `기능 소개` to the top of the side menu.
- Clarified that `원본 크기 복원` restores the uploaded image's original pixel dimensions.
- Removed the music recognition feasibility section from `features.html`.

## 2026-06-09 02:03 KST

- Backed up HTML files and `CHANGELOG.md` in `.backups/2026-06-09_0203/`.
- Removed square brackets from the site title, changing `[[Everything you need]]` to `Everything you need`.

## 2026-06-09 02:08 KST

- Backed up affected HTML files, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_0208/`.
- Added `screenshot-merge.html` for merging multiple screenshots into one PNG.
- Added `assets/js/screenshot-merge.js` with horizontal, vertical, and row-by-column grid layout rendering.
- Updated menus, feature copy, and privacy copy to include the screenshot merge tool.

## 2026-06-09 02:15 KST

- Backed up affected HTML files, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_0215/`.
- Added image compression, image format conversion, image crop/rotate/flip, PDF image tools, and batch image processing pages.
- Added client-side JavaScript for the five new tools.
- Updated home menu, feature copy, and privacy copy for the expanded tool set.

## 2026-06-09 02:22 KST

- Backed up all HTML files and `CHANGELOG.md` in `.backups/2026-06-09_0222/`.
- Replaced page-specific top link menus with the shared `메뉴` button and left side tab on every page.
- Added `assets/js/app.js` to tool pages so the shared side menu opens consistently outside the home page.

## 2026-06-09 02:30 KST

- Backed up HTML files, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_0230/`.
- Added `watermark.html`, `redact-screenshot.html`, and `background-remove.html`.
- Added client-side JavaScript for text watermarking, screenshot redaction rectangles, and color-based background removal.
- Updated shared menus, feature copy, and privacy copy for the three new tools.

## 2026-06-09 02:36 KST

- Backed up HTML files, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_0236/`.
- Changed the shared side menu from a button-opened drawer to a permanently visible desktop sidebar.
- Shifted headers, page content, and footers to account for the fixed sidebar.
- Changed the mobile layout to show the full menu above page content without requiring a button.
- Updated the shared menu script so Escape and tool actions cannot mark the persistent sidebar as closed.

## 2026-06-09 11:08 KST

- Backed up the receipt page, receipt script, shared CSS, and `CHANGELOG.md` in `.backups/2026-06-09_1108/`.
- Fixed receipt PDF printing so hidden page content is removed from print layout instead of occupying a blank second page.
- Added a receipt-only print mode that prints only the generated receipt preview.
## 2026-06-09 11:22 KST

- Backed up `assets/js/watermark.js` and `CHANGELOG.md` in `.backups/2026-06-09_1122/`.
- Fixed watermark opacity so the selected percentage is applied directly to the text color and its shadow.
- Replaced the fallback expression that treated a numeric zero as the default 55 percent value.
## 2026-06-09 11:32 KST

- Backed up all affected HTML files, shared CSS, `assets/js/app.js`, and `CHANGELOG.md` in `.backups/2026-06-09_1132/`.
- Consolidated single-image JPG, PNG, and WebP conversion with resize controls into `index.html`.
- Consolidated the two image conversion menu entries into one and redirected the legacy format converter URL to the unified tool.
- Preserved the side menu scroll position across static page navigation with session storage.
