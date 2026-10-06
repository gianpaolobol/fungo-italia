# Migration record
Main before migration: 68fce519e93a4646218ce360811bb174d241a032.
Backup: backup/pre-migration-flutter. Despite that requested branch name, the repository contained Next/vinext/React, not Flutter.
Verified web improvements: e3b9ca01bd43ec87d3630ab954c45229b2ba15e1, backed up as backup/verified-web-readiness and preserved byte-for-byte in legacy/web.
First native Android build: GitHub Actions run37007888136, source0d01cc17da6e38723bf0f39d7ab7ab8188424ff2. APK artifact11227342673, ZIP sha256:131be6b12c7e7b42f8760fb9aaaff79d3534638507c0b36a678f6b7cdeeec282.
No database deletion, Sites deployment or Floot mutation was performed. Existing D1/R2 and web authentication remain separate services.
The offline catalog includes148canonicalminimumunits and66teachinggroups, with internal review distinguished from independent approval.616scientificclaims remain pending; published database modifications and licensed image verification are not part of this static export.
Native contributor accounts and synchronization are not migrated. The current PWA opens a public GitHub Issues form for documented scientific proposals; no local note or photo is uploaded automatically. The historical authenticated web service remains optional for existing accounts. Local notes are private unreviewed drafts.
Android artifacts use the Expo template debug signing key for preview. Stable private production signing and store distribution are separate requirements.
iOS JavaScript export is validated separately from a signed iOS binary. Expo Go preview and EAS publication require verified SDK/client compatibility and real Expo project access; no QR or deployment URL is invented when those are unavailable.
