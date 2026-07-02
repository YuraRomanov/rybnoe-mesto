import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconSrc = join(root, 'assets', 'icon-only.png');
const iosDir = join(root, 'ios', 'App');
const androidDir = join(root, 'android');

if (!existsSync(iconSrc)) {
  console.error('Нет исходника иконки:', iconSrc);
  process.exit(1);
}

const args = ['capacitor-assets', 'generate', '--assetPath', 'assets'];
let targets = 0;

if (existsSync(iosDir)) {
  args.push('--ios', '--iosProject', 'ios/App');
  targets += 1;
}

if (existsSync(androidDir)) {
  args.push('--android', '--androidProject', 'android');
  targets += 1;
}

if (!targets) {
  console.error('Нет платформы ios/android. Сначала: npx cap add ios или npx cap add android');
  process.exit(1);
}

execFileSync('npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

console.log('Иконки сгенерированы для:', [
  existsSync(iosDir) ? 'iOS' : null,
  existsSync(androidDir) ? 'Android' : null,
].filter(Boolean).join(', '));
