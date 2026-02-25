# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.32] - 2026-02-25
### Fixes
- **PDF.js**: Downgraded library to v4.10.38 and synchronized worker URL to resolve persistent `workerSrc` error in production.

## [v2.0.31] - 2026-02-25
### Fixes
- **PDF.js**: Fixed runtime error by switching from global `window.pdfjsLib` to imported module reference and stabilizing worker source URL.

## [v2.0.30] - 2026-02-25
### Fixes
- **PDF.js**: Fixed runtime error `No "GlobalWorkerOptions.workerSrc" specified` in production build by explicitly setting worker source.

## [v2.0.29] - 2026-02-25
### Features
- **AI Integration**: Implemented Automated Intelligence Routing.
    - Automatically selects `gemini-1.5-flash` for fast OCR/Extraction.
    - Automatically selects `gemini-1.5-pro` for deep property analysis and Search-enabled research.
- **UI/UX**: Simplified Settings panel by removing manual model selection.
- **PDF**: Dynamic naming (uses address) and improved multi-page layout stability.
### Fixes
- **AI API**: Resolved 404 error when using preview models by switching to stable versions.
- **Build**: Resolved dependency issues with `pdfjs-dist` worker distribution.

## [v2.0.28] - 2026-01-27
### Fixes
-   **Icons**: Converted Favicon paths to **Absolute URLs** (`https://bid.rico.bd/favicon.svg`).
    -   **Fix**: Ensures icons load correctly even on deep sub-paths or redirects.
    -   **Correction**: Removed invalid `image/png` link type causing MIME mismatches (now correctly uses `svg+xml`).

## [v2.0.27] - 2026-01-27
### Fixes
-   **Metadata**: Converted `og:image` and `twitter:image` paths to **Absolute URLs**.
    -   **Change**: `/banner.svg` -> `https://bid.rico.bd/banner.svg`.
    -   **Reason**: Facebook/LinkedIn crawlers strictly require absolute URLs to render images.

## [v2.0.26] - 2026-01-27
### Visuals
-   **Banner**: Remastered `banner.svg` with **Advanced Animations**.
    -   **Radar**: Scan sweep effect using rotating gradients.
    -   **Grid**: Moving perspective lines ("Tron" style).
    -   **Particles**: Data stream dots converging on the core.
    -   **HUD**: "SYSTEM: ONLINE" blinking status text.
-   **Metadata**: Fixed missing OGP tags (Retry).
    -   Added `og:site_name`, `og:locale`, `og:image:alt`.

## [v2.0.25] - 2026-01-27
### Documentation
-   **Social Metadata**: Added missing Open Graph tags to clear debugger warnings.
    -   `og:site_name`: "Pdf2Estimate"
    -   `og:locale`: "en_US"
    -   `og:image:alt`: Accessibility text for the banner.
-   **Resolution**: Fixes "Missing Properties" warnings in Facebook/LinkedIn debuggers.

## [v2.0.24] - 2026-01-27
### Improvements
-   **Logic**: Implemented **Smart Idempotency (Deep Compare)**.
    -   **Scenario**: If `Current Version == Latest Version`:
    -   **Action**: The script pulls silently to check if the image **Hash** changed (e.g., a rebuild of the same version).
    -   **Result**:
        -   Matches: "Images are bit-for-bit identical. No restart required." -> **Exits instantly**.
        -   Differs: "Deep Hash Mismatch... Updating..." -> **Auto-Restarts**.
    -   **Benefit**: Zero hassle. It *only* restarts if bits actually changed.

## [v2.0.23] - 2026-01-27
### Improvements
-   **Logic**: Enabled **Smart Auto-Update**.
    -   **Change**: Removed the `(Y/n)` confirmation prompt when an update is actually available.
    -   **Behavior**: If a new version is detected, it shows the Changelog and **automatically proceeds** with the update (after a 3-second courtesy delay).
    -   **Retained**: The "Force Reinstall?" prompt is kept safe (only asks if you are already up-to-date).

## [v2.0.22] - 2026-01-27
### Improvements
-   **Script**: Added **Cache Busting** (`?t=timestamp`) to `update_app.sh`.
    -   **Fix**: Prevents "stale version" reports caused by GitHub CDN caching.
-   **Logic**: Added **Smart Exit** capability.
    -   If "Already up to date", the script now asks: `Do you want to FORCE a re-install/restart? (y/N)`.
    -   If "No", it exits immediately without pulling.

## [v2.0.21] - 2026-01-27
### Fixes
-   **Script**: Updated `update_app.sh` to use `docker compose up -d --force-recreate`.
-   **Resolution**: Ensures the container *actually* restarts every time the update script runs, fixing the "Restarting..." log discrepancy where Docker would sometimes skip the restart if no files changed.

## [v2.0.20] - 2026-01-27
### Visuals
-   **Banner**: Redesigned `banner.svg` with a **Premium, High-Fidelity Futuristic Look**.
-   **Details**:
    -   Added "Bloom/Glow" neon filters.
    -   Implemented animated "PDF -> Excel" flow visualization.
    -   Reverted `index.html` to point to the new SVG (since PNG generation is unavailable).

## [v2.0.19] - 2026-01-27
### Features
-   **Script**: Implemented **Local Version Tracking** in `update_app.sh`.
-   **Functionality**:
    -   Tracks installed version in `version.txt`.
    -   Compares **Current Version** vs **Latest Version** (Cloud).
    -   Notifies: "✅ You are already up to date!" if versions match.

## [v2.0.18] - 2026-01-27
### Features
-   **Script**: `update_app.sh` now explicitly displays the **"Latest Version Available"** (e.g., `[v2.0.18]`) during the update check.
-   **Enhancement**: Parses the remote Changelog to show the specific version number alongside "What's New".

## [v2.0.17] - 2026-01-27
### Features
-   **Script**: Added **Interactive Update Mode** to `update_app.sh`.
-   **Functionality**:
    -   **Changelog Preview**: Fetches and displays the latest "WHAT'S NEW" from GitHub before updating.
    -   **Confirmation**: Asks the user `Do you want to check and pull updates now? (Y/n)` before downloading large files.

## [v2.0.16] - 2026-01-27
### Documentation
-   **Social**: Updated `index.html` metadata to point to `banner.png` (Raster) instead of `banner.svg`.
-   **Compatibility**: Ensures Open Graph images render correctly on Twitter, LinkedIn, and Facebook (which do not support SVG).

## [v2.0.15] - 2026-01-27
### Enhancements
-   **Script**: Extended **Deployment Summary** in `update_app.sh`.
-   **Details**: Now includes **Image Size**, **Container Disk Usage** (writable layer), and **Volume Mounts** inspection.

## [v2.0.14] - 2026-01-27
### Enhancements
-   **Script**: Added **Deployment Summary** to `update_app.sh`.
-   **Details**: Now displays detailed Container Name, Status (Uptime), Image ID, and Port Mappings upon successful update.

## [v2.0.13] - 2026-01-27
### Features
-   **Script**: Added **Self-Update** capability to `update_app.sh`.
-   **Functionality**: The script now checks GitHub for a newer version of *itself* before running, ensuring the user always has the latest update logic without manual intervention.

## [v2.0.12] - 2026-01-27
### Enhancements
-   **Scripts**: Completely rewrote `update_app.sh` into a "Smart Update Utility".
-   **Features**:
    -   **Pre-flight Checks**: Verifies Docker daemon, internet, and configuration before starting.
    -   **Health Checks**: Waits for container stabilization and verifies "Running" status.
    -   **Diagnostics**: Automatically captures and displays error logs if the update fails.
    -   **Logging**: Writes all operations to `update_log.txt` for troubleshooting.

## [v2.0.11] - 2026-01-27
### Fixed
-   **Rebrand**: Updated `update_app.sh` header text to "Pdf2Estimate Pro" (previously "Repair Base App").
-   **Docs**: Updated troubleshooting links to `Pdf2Estimate-app` repo.

## [v2.0.10] - 2026-01-27
### Fixed
-   **Scripts**: Updated `update_app.sh` to use modern `docker compose` syntax instead of legacy `docker-compose`.
-   **Resolution**: Fixes "command not found" error on servers without legacy Compose V1.

## [v2.0.9] - 2026-01-27
### Visuals
-   **Rebrand**: Introduced "Futuristic Cyber-Shield" visual identity.
-   **New Assets**:
    -   `logo.svg`: Animated hexagonal logo with "P2E" monogram.
    -   `favicon.svg`: Matching glowing node icon.
    -   `banner.svg`: High-tech circuit grid social banner with "Intelligent Repair AI" tag.

## [v2.0.8] - 2026-01-27
### SEO
-   **Optimization**: Improved Title and Meta Description for better search ranking (Score Optimization).
-   **Key Changes**: Added keywords "Excel Converter", "CSV", and "Insurance Supplements" to snippets.

## [v2.0.7] - 2026-01-27
### Documentation
-   **Metadata**: Added custom **SVG Favicon** and **Banner** for better branding and social sharing.
-   **Updated**: `index.html` now points to vector assets (`favicon.svg`, `banner.svg`).

## [v2.0.6] - 2026-01-27
### Documentation
-   **Architecture**: Added custom **Animated SVG** diagram to `README.md` (`public/assets/architecture.svg`).
-   **Polishing**: Enhanced visuals with dark-mode optimized System Architecture flow.

## [v2.0.5] - 2026-01-27
### Security
-   **Hardening**: Verified production build usage in `docker-compose.yml` (removed unused volume mounts).
-   **Note**: The deployment uses Nginx (Static Build), mitigating `esbuild`/`npm run dev` security risks.

## [v2.0.4] - 2026-01-27
### Documentation
-   **Changelog**: Added `CHANGELOG.md` and linked it in releases.
### Features
-   **UI**: Added a **Clear All** button to the header for quick reset.

## [v2.0.3] - 2026-01-27
### Documentation
-   **License**: Added MIT License file.
-   **README**: Added Visual Interface Guide, Table of Contents, and ASCII architecture diagram.

## [v2.0.2] - 2026-01-27
### Fixed
-   **CI/CD**: Corrected workflow permissions.

## [v2.0.1] - 2026-01-27
### Documentation
-   **README**: Revamped with futuristic design, typing header, and collapsible sections.

## [v2.0.0] - 2026-01-27
### Major Release
-   **Rebrand**: Fully renamed from "RepairBase Pro" to "Pdf2Estimate Pro".
-   **Package**: Migrated to `pdf2estimate-app` on GHCR.
-   **Cleanup**: Removed legacy branding references.
