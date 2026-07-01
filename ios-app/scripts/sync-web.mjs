import { execFileSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, '..', 'public');
const wwwDir = join(root, 'www');
const overridesDir = join(root, 'overrides');
const iosShellCss = 'css/ios-shell.css';
const iosShellLink = '<link rel="stylesheet" href="css/ios-shell.css">';

function shellQuote(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function removeDir(dir) {
  if (!existsSync(dir)) return;
  if (process.platform === 'win32') {
    execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `Remove-Item -LiteralPath ${shellQuote(dir)} -Recurse -Force`,
    ], { stdio: 'inherit' });
    return;
  }
  execFileSync('rm', ['-rf', dir], { stdio: 'inherit' });
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  if (process.platform === 'win32') {
    execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `Get-ChildItem -LiteralPath ${shellQuote(src)} | Copy-Item -Destination ${shellQuote(dest)} -Recurse -Force`,
    ], { stdio: 'inherit' });
    return;
  }
  execFileSync('cp', ['-R', `${src}/.`, dest], { stdio: 'inherit' });
}

if (!existsSync(publicDir)) {
  console.error('Не найдена папка public:', publicDir);
  process.exit(1);
}

removeDir(wwwDir);
copyDir(publicDir, wwwDir);

mkdirSync(join(wwwDir, 'css'), { recursive: true });
copyFileSync(join(overridesDir, iosShellCss), join(wwwDir, iosShellCss));

const indexPath = join(wwwDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (!html.includes(iosShellLink)) {
  html = html.replace('</head>', `  ${iosShellLink}\n</head>`);
  writeFileSync(indexPath, html);
}

console.log('Скопировано public → ios-app/www');
