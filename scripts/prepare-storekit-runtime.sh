#!/usr/bin/env bash
set -euo pipefail
# Use the supported Xcode 26.4.1 / iOS 26.4 pair installed on the runner.
# Compare a matched pair with the earlier 26.6-client / 18.6-runtime experiments.
# This is a compatibility experiment; successful purchase assertions remain required.
xcodebuild -version
storekit_sdk_version=$(xcrun --sdk iphonesimulator --show-sdk-version)
if test "$storekit_sdk_version" != "26.4"; then
  echo "Expected the iOS 26.4 SDK for StoreKit integration tests, got $storekit_sdk_version"
  exit 1
fi
storekit_list="$RUNNER_TEMP/storekit-runtimes.json"
select_runtime() {
  xcrun simctl list runtimes -j > "$storekit_list"
  node -e 'const r=require(process.argv[1]).runtimes.find(r=>r.isAvailable&&r.identifier.includes(".iOS-")&&r.version.split(".").slice(0,2).join(".")==="26.4");if(r)process.stdout.write(r.identifier)' "$storekit_list"
}
storekit_runtime_id=$(select_runtime)
if test -z "$storekit_runtime_id"; then
  storekit_export="$RUNNER_TEMP/storekit-runtime-26.4"
  mkdir -p "$storekit_export"
  xcodebuild -downloadPlatform iOS -buildVersion 26.4 -exportPath "$storekit_export"
  storekit_image=$(find "$storekit_export" -type f -name '*.dmg' -print -quit)
  if test -n "$storekit_image"; then xcodebuild -importPlatform "$storekit_image"; fi
  storekit_runtime_id=$(select_runtime)
fi
if test -z "$storekit_runtime_id"; then
  echo "No matching iOS 26.4 StoreKit test runtime; refusing another runtime or the production store."
  exit 1
fi
echo "STOREKIT_TEST_RUNTIME=$storekit_runtime_id" >> "$GITHUB_ENV"
echo "Verified StoreKit simulator selection: $storekit_runtime_id"
