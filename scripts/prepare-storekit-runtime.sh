#!/usr/bin/env bash
set -euo pipefail
# Apple fixes Simulator StoreKit session connection in iOS 26.6 (174738526).
# iOS 18.6 is an earlier compatible runtime if 26.6 is not downloadable.
storekit_list="$RUNNER_TEMP/storekit-runtimes.json"
select_runtime() {
  xcrun simctl list runtimes -j > "$storekit_list"
  node -e 'const a=require(process.argv[1]).runtimes.filter(r=>r.isAvailable&&r.identifier.includes(".iOS-"));const r=a.find(r=>/^26\.6(?:\.|$)/.test(r.version))||a.find(r=>/^18\.6(?:\.|$)/.test(r.version));if(r)process.stdout.write(r.identifier)' "$storekit_list"
}
download_runtime() {
  local storekit_version="$1"
  local storekit_export="$RUNNER_TEMP/storekit-runtime-$storekit_version"
  mkdir -p "$storekit_export"
  if ! xcodebuild -downloadPlatform iOS -buildVersion "$storekit_version" -exportPath "$storekit_export"; then return 1; fi
  local storekit_image
  storekit_image=$(find "$storekit_export" -type f -name '*.dmg' -print -quit)
  if test -n "$storekit_image"; then xcodebuild -importPlatform "$storekit_image" || return 1; fi
}
storekit_runtime_id=$(select_runtime)
if test -z "$storekit_runtime_id"; then
  for storekit_version in 26.6 18.6; do
    echo "Requesting Apple StoreKit test runtime iOS $storekit_version"
    if download_runtime "$storekit_version"; then
      storekit_runtime_id=$(select_runtime)
      if test -n "$storekit_runtime_id"; then break; fi
    fi
  done
fi
if test -z "$storekit_runtime_id"; then
  echo "No compatible StoreKit test runtime available; refusing iOS 26.5 and production-store fallback."
  exit 1
fi
echo "STOREKIT_TEST_RUNTIME=$storekit_runtime_id" >> "$GITHUB_ENV"
echo "Verified StoreKit simulator selection: $storekit_runtime_id"
