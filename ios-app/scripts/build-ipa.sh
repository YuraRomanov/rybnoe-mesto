#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT/ios/App"
ARCHIVE="$ROOT/build/App.xcarchive"
IPA="$ROOT/build/rybnoe-mesto.ipa"

if [[ ! -d "$IOS_DIR/App.xcworkspace" ]]; then
  echo "Нет Xcode-проекта. Сначала: npm run sync && npx cap add ios && npx cap sync ios"
  exit 1
fi

rm -rf "$ROOT/build"
mkdir -p "$ROOT/build"

xcodebuild \
  -workspace "$IOS_DIR/App.xcworkspace" \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  archive \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="-" \
  DEVELOPMENT_TEAM=""

APP_PATH="$(find "$ARCHIVE/Products/Applications" -maxdepth 1 -name '*.app' -type d | head -1)"
if [[ -z "$APP_PATH" || ! -d "$APP_PATH" ]]; then
  echo "Не найден .app в архиве"
  ls -la "$ARCHIVE/Products/Applications" || true
  exit 1
fi

PAYLOAD="$ROOT/build/Payload"
mkdir -p "$PAYLOAD"
cp -R "$APP_PATH" "$PAYLOAD/"

cd "$ROOT/build"
rm -f "$IPA"
zip -qr "$IPA" Payload

echo "Готово: $IPA"
ls -lh "$IPA"
