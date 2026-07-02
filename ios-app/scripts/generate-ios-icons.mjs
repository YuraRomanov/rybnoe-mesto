import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iosDir = join(root, 'ios', 'App');
const iconSrc = join(root, 'assets', 'icon-only.png');

if (!existsSync(iconSrc)) {
  console.error('Нет исходника иконки:', iconSrc);
  process.exit(1);
}

if (!existsSync(iosDir)) {
  console.error('Нет iOS-проекта. Сначала: npx cap add ios');
  process.exit(1);
}

execFileSync(
  'npx',
  ['capacitor-assets', 'generate', '--ios', '--assetPath', 'assets', '--iosProject', 'ios/App'],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
);

console.log('iOS-иконки сгенерированы');
