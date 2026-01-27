# Changelog

All notable changes to this project will be documented in this file.

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

## [v1.0.19]
### Cleanse
-   Removed remaining "RepairBase" references while preserving PDF export logic.

## [v1.0.18]
### Initial Rename
-   Renamed application to Pdf2Estimate Pro.
-   Updated Docker image references.
