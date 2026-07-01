# IPA на Windows (без Mac)

На Windows **нельзя** собрать `.ipa` локально — нужен Mac с Xcode.  
В этом репозитории IPA собирается **автоматически в GitHub** (бесплатный облачный Mac).

## 1. Залить код на GitHub

```powershell
cd "c:\Users\User\Desktop\Игра"
git add .
git commit -m "iOS build via GitHub Actions"
git push
```

## 2. Запустить сборку

1. Откройте репозиторий на GitHub: https://github.com/YuraRomanov/rybnoe-mesto  
2. Вкладка **Actions**  
3. Слева **Build iOS IPA**  
4. **Run workflow** → **Run workflow**

Через 5–15 минут появится зелёная галочка.

## 3. Скачать IPA

1. Откройте завершённый workflow run  
2. Внизу **Artifacts** → **rybnoe-mesto-ipa**  
3. Скачается zip с файлом `rybnoe-mesto.ipa`

## 4. Установить на iPhone с Windows

IPA **без подписи Apple** — подпишите и поставьте сами:

| Программа | Сайт |
|-----------|------|
| **Sideloadly** | https://sideloadly.io |
| **AltStore** | https://altstore.io (нужен AltServer на ПК) |
| **3uTools** | https://www.3u.com |

Обычно: подключить iPhone по USB → открыть Sideloadly → выбрать `.ipa` → ввести Apple ID → Install.

С бесплатным Apple ID приложение работает **~7 дней**, потом переустановить.

## Если сборка в Actions упала

Откройте failed run → красный шаг → скопируйте лог и пришлите.

Частые причины:
- не запушен `ios-app/package-lock.json`
- первый запуск Actions в репо — нужно нажать **I understand my workflows, go ahead and enable them**

## Локально (только Mac)

```bash
cd ios-app
npm ci
npm run sync
npx cap add ios
npx cap sync ios
bash scripts/build-ipa.sh
```

Файл: `ios-app/build/rybnoe-mesto.ipa`
