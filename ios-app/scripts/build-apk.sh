#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT/android"
APK_OUT="$ROOT/build/rybalka-bolshaya-voda.apk"

if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "Нет Android-проекта. Сначала: npm run sync && npx cap add android && npx cap sync android"
  exit 1
fi

rm -rf "$ROOT/build"
mkdir -p "$ROOT/build"

cd "$ANDROID_DIR"
chmod +x gradlew
./gradlew assembleDebug --no-daemon

DEBUG_APK="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "$DEBUG_APK" ]]; then
  echo "Не найден APK: $DEBUG_APK"
  find "$ANDROID_DIR/app/build/outputs" -name '*.apk' || true
  exit 1
fi

cp "$DEBUG_APK" "$APK_OUT"
echo "Готово: $APK_OUT"
ls -lh "$APK_OUT"
