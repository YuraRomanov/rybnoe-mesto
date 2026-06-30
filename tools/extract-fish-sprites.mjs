/**
 * Нарезка спрайтов рыб для локации «Лесное Озеро»
 * Запуск: node tools/extract-fish-sprites.mjs
 */
import sharp from 'sharp';
import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'assets', 'fish');
const sheetsDir = join(root, 'public', 'assets', 'fish', 'sheets');

const SRC = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets/c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_1186aded-adbf-4da7-889d-3696cc1de97c-51ae8429-6015-44cf-944f-6d340c853980.png';

/** Слева направо, сверху вниз; последняя — по центру 5-го ряда */
const FISH_SPRITES = [
  { file: 'fish-karas', row: 0, col: 0 },
  { file: 'fish-gold-karas', row: 0, col: 1 },
  { file: 'fish-plotva', row: 0, col: 2 },
  { file: 'fish-ersh', row: 0, col: 3 },
  { file: 'fish-lesh', row: 1, col: 0 },
  { file: 'fish-podleshik', row: 1, col: 1 },
  { file: 'fish-vyun', row: 1, col: 2 },
  { file: 'fish-okun', row: 1, col: 3 },
  { file: 'fish-shuka', row: 2, col: 0 },
  { file: 'fish-beloglazka', row: 2, col: 1 },
  { file: 'fish-weed', row: 2, col: 2 },
  { file: 'fish-elec', row: 2, col: 3 },
  { file: 'fish-krasnoperka', row: 3, col: 0 },
  { file: 'fish-lin', row: 3, col: 1 },
  { file: 'fish-peskar', row: 3, col: 2 },
  { file: 'fish-rotan', row: 3, col: 3 },
  { file: 'fish-yaz', row: 4, col: 1.5 },
];

mkdirSync(outDir, { recursive: true });
mkdirSync(sheetsDir, { recursive: true });

if (!existsSync(SRC)) {
  console.error('Нет исходного файла:', SRC);
  process.exit(1);
}

copyFileSync(SRC, join(sheetsDir, 'forest-lake-fish.png'));

const meta = await sharp(SRC).metadata();
const cols = 4;
const cellW = Math.floor(meta.width / cols);
const cellH = Math.floor(meta.height / 5);

for (const fish of FISH_SPRITES) {
  const left = Math.round(fish.col * cellW);
  const top = Math.round(fish.row * cellH);
  const out = join(outDir, `${fish.file}.png`);
  await sharp(SRC)
    .extract({ left, top, width: cellW, height: cellH })
    .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log('✓', fish.file);
}

console.log(`\nГотово: ${FISH_SPRITES.length} рыб → public/assets/fish/`);
