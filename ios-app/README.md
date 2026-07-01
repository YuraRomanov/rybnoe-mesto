# Рыбное место — iOS (Capacitor)

Отдельная сборка игры как нативного iOS-приложения. Внутри — тот же клиент из `../public`, без Node.js-сервера. Сохранения в `localStorage` на устройстве.

## Что нужно

| Требование | Зачем |
|------------|--------|
| **Mac** с Xcode 15+ | Собрать и запустить на iPhone / отправить в App Store |
| Apple ID (бесплатный) | Запуск на своём телефоне |
| Apple Developer ($99/год) | Публикация в App Store |

На Windows можно подготовить проект (`npm run sync`), но **собрать .ipa только на Mac**.

## Быстрый старт (на Mac)

```bash
cd ios-app
npm install
npm run cap:add-ios    # один раз — создаёт папку ios/
npm run cap:sync       # копирует public → www и синхронизирует с Xcode
npm run cap:open-ios   # открыть в Xcode
```

В Xcode:

1. Слева выберите проект **App** → **Signing & Capabilities**
2. Укажите свою **Team** (Apple ID)
3. Подключите iPhone или выберите симулятор
4. **Product → Run** (▶)

## Обновление после правок в игре

После изменений в `public/`:

```bash
cd ios-app
npm run cap:sync
```

Потом снова Run в Xcode.

## Иконка и splash

1. Положите квадратную PNG **1024×1024** в `ios-app/resources/icon.png`
2. На Mac:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --ios
npm run cap:sync
```

## App Store (кратко)

1. В [App Store Connect](https://appstoreconnect.apple.com) создайте приложение с bundle id `com.yuraromanov.rybnoemesto`
2. В Xcode: **Product → Archive** → **Distribute App**
3. Заполните скриншоты, описание, возрастной рейтинг

## Сборка без своего Mac

Облачные Mac-сервисы: [Codemagic](https://codemagic.io), [GitHub Actions](https://docs.github.com/en/actions) (runner `macos-latest`), [MacStadium](https://www.macstadium.com).

Пример шагов в CI:

```bash
cd ios-app
npm ci
npm run cap:add-ios   # если папки ios/ ещё нет
npm run cap:sync
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release
```

## Структура

```
ios-app/
  capacitor.config.json   — id приложения, имя
  scripts/sync-web.mjs    — копирует ../public в www/
  overrides/              — стили только для iOS
  www/                    — генерируется (не коммитить)
  ios/                    — Xcode-проект (создаётся на Mac)
```

## Bundle ID

По умолчанию: `com.yuraromanov.rybnoemesto`. Чтобы сменить — отредактируйте `capacitor.config.json` **до** `cap add ios`.
