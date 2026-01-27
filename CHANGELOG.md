# Changelog

All notable changes to this project will be documented in this file.

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
-   **Documentation**: Updated troubleshooting guides to point to the renamed `Pdf2Estimate-app` repository.

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
