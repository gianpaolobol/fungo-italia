#!/usr/bin/env bash
set -euo pipefail
# Apple fixes the Simulator StoreKit session connection in iOS 26.6 (174738526).
# Older iOS 18.6 runners reproduced a hanging Transaction.currentEntitlements
# iterator in both iPhone and iPad, with or without Transaction.updates.
# Release verification must use the fixed runtime or fail closed.
storekit_list="$RUNNER_TEMP/storekit-runtimes.json"
select_runtime() {
  xcrun simctl list runtimes -j > "$storekit_list"
  node -e 'const a=require(process.argv[1]).runtimes.filter(r=>r.isAvailable&&r.identifier.includes(".iOS-"));const r=a.find(r=>/^26\.6(?:\.|$)/.test(r.version));if(r)process.stdout.write(r.identifier)' "$storekit_list"
}
download_runtime() {
  local storekit_export="$RUNNER_TEMP/storekit-runtime-26.6"
  mkdir -p "$storekit_export"
  xcodebuild -downloadPlatform iOS -buildVersion 26.6 -exportPath "$storekit_export" || return 1
  local storekit_image
  storekit_image=$(find "$storekit_export" -type f -name '*.dmg' -print -quit)
  if test -n "$storekit_image"; then xcodebuild -importPlatform "$storekit_image" || return 1; fi
}
storekit_runtime_id=$(select_runtime)
if test -z "$storekit_runtime_id"; then
  echo "Requesting iOS 26.6 runtime with Apple's StoreKit Simulator connection fix"
  download_runtime
  storekit_runtime_id=$(select_runtime)
fi
if test -z "$storekit_runtime_id"; then
  echo "::error::iOS 26.6 StoreKit runtime unavailable; refusing known-stalling iOS 18.6 and production-store fallback."
  exit 1
fi
echo "STOREKIT_TEST_RUNTIME=$storekit_runtime_id" >> "$GITHUB_ENV"
echo "Verified StoreKit simulator selection: $storekit_runtime_id"
