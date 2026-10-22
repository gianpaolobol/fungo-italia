#!/usr/bin/env bash
set -euo pipefail
# Runtime qualification is behavioral: availability or a release-note fix alone
# is not proof. The standalone lifecycle + UI startup probe qualified iOS 26.2
# on Xcode 26.6; the mandatory full-application suites must still pass.
# 26.6/27.0 remain explicit diagnostic candidates, never silent fallbacks.
# Never replace Apple transaction verification with runtime assumptions.
mkdir -p store-evidence
exec > >(tee store-evidence/runtime-selection.log) 2>&1
storekit_version="${STOREKIT_RUNTIME_VERSION:-26.2}"
case "$storekit_version" in
  26.2|26.6|27.0) ;;
  *) echo "::error::Unqualified StoreKit runtime version: $storekit_version"; exit 1 ;;
esac
xcodebuild -version
storekit_list="$RUNNER_TEMP/storekit-runtimes.json"
trap 'if test -f "$storekit_list"; then cp "$storekit_list" store-evidence/runtime-inventory.json; fi' EXIT
select_runtime() {
  xcrun simctl list runtimes -j > "$storekit_list"
  node -e 'const a=require(process.argv[1]).runtimes.filter(r=>r.isAvailable&&r.identifier.includes(".iOS-"));const r=a.find(r=>r.version===process.argv[2]);if(r)process.stdout.write(r.identifier)' "$storekit_list" "$storekit_version"
}
download_runtime() {
  local storekit_export="$RUNNER_TEMP/storekit-runtime-$storekit_version"
  mkdir -p "$storekit_export"
  # Apple's catalog may not resolve the marketing-version alias. Ask the
  # selected Xcode for its default only after the explicit request fails.
  # Selection below still requires the exact requested version.
  if ! xcodebuild -downloadPlatform iOS -buildVersion "$storekit_version" -exportPath "$storekit_export"; then
    echo "::warning::Explicit iOS $storekit_version download unavailable; trying selected Xcode's default runtime, then revalidating."
    xcodebuild -downloadPlatform iOS -exportPath "$storekit_export" || return 1
  fi
  local storekit_image
  storekit_image=$(find "$storekit_export" -type f -name '*.dmg' -print -quit)
  if test -n "$storekit_image"; then xcodebuild -importPlatform "$storekit_image" || return 1; fi
}
storekit_runtime_id=$(select_runtime)
if test -z "$storekit_runtime_id"; then
  echo "Requesting iOS $storekit_version runtime for full StoreKit qualification"
  if ! download_runtime; then
    echo "::warning::Xcode could not download/import the required StoreKit runtime."
  fi
  storekit_runtime_id=$(select_runtime)
fi
if test -z "$storekit_runtime_id"; then
  echo "::error::iOS $storekit_version StoreKit runtime unavailable; refusing known-stalling iOS 18.6 and production-store fallback."
  exit 1
fi
echo "STOREKIT_TEST_RUNTIME=$storekit_runtime_id" >> "$GITHUB_ENV"
echo "Verified StoreKit simulator selection: $storekit_runtime_id"
