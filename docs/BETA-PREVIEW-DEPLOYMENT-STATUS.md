# Beta preview deployment status

This branch is the isolated beta-primary preview derived from release/beta-primary-review-20261008. The owner authorized publication on 2026-10-09.

Deployment workflow: .github/workflows/publish-beta-preview.yml.

IMPORTANT: GitHub Pages is a repository-level site. Deploying this workflow may replace the existing main-based Pages site rather than create a separate URL. Do not run deploy-pages until a separate Pages destination (e.g. separate repository) is configured and verified.

Required checks before a live deployment:
- CI browser tests pass
- generated data is reconciled
- independent scientific review status remains accurately disclosed
- target URL is confirmed not to overwrite main's public site

No deployment is asserted by this document.
