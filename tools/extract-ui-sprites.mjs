/**
 * Нарезка 4×4 спрайт-листов UI-иконок (1024×1024 → 64 иконки 256×256)
 * Запуск: node tools/extract-ui-sprites.mjs
 */
import sharp from 'sharp';
import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'assets', 'ui', 'icons');
const sheetsDir = join(root, 'public', 'assets', 'ui', 'sheets');

const CURSOR_ASSETS = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets';

const SHEETS = [
  {
    file: 'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4-ad0619ef-03f7-4436-9a68-d92330f2a255.png',
    saveAs: 'sheet-baits.png',
    icons: [
      ['bait-worm', 'bait-maggot', 'bait-minnow', 'bait-dough'],
      ['bait-corn', 'bait-shrimp', 'lure-soft', 'lure-crank'],
      ['lure-spoon-silver', 'lure-spoon-green', 'lure-spoon-purple', 'lure-spinner'],
      ['lure-jig', 'lure-neon', 'lure-fly', 'ui-tackle-box'],
    ],
  },
  {
    file: 'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2-36e4a348-1feb-419c-a250-efa2e4202df0.png',
    saveAs: 'sheet-loot.png',
    icons: [
      ['chest-common', 'chest-rare', 'chest-epic', 'chest-legendary'],
      ['curr-silver', 'curr-gold', 'curr-crystal', 'ticket-event'],
      ['potion-energy', 'orb-power', 'canteen', 'pack-bait'],
      ['ui-map', 'ticket-vip', 'medal-fish', 'trophy-master'],
    ],
  },
  {
    file: 'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3-3e34fe2c-dc42-403b-bdd6-8b6461a8a9fa.png',
    saveAs: 'sheet-tackle.png',
    icons: [
      ['hook-single', 'hook-heavy', 'hook-double', 'hook-treble'],
      ['hook-gold', 'weight-split', 'weight-pear', 'weight-bullet'],
      ['weight-pyramid', 'weight-150', 'feeder-cage', 'feeder-method'],
      ['feeder-spring', 'net-keep', 'bucket-bait', 'rig-terminal'],
    ],
  },
  {
    file: 'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_1-2c90947a-8330-4020-b237-b8701d5da1c0.png',
    saveAs: 'sheet-rods.png',
    icons: [
      ['rod-bamboo', 'rod-modern', 'gear-reel', 'gear-line'],
      ['float-basic', 'float-neon', 'rod-tier-1', 'rod-tier-2'],
      ['rod-tier-3', 'rod-tier-4', 'rod-tier-5', 'upgrade-tackle'],
      ['upgrade-rod-part', 'upgrade-reel', 'upgrade-line', 'rank-master'],
    ],
  },
];

mkdirSync(outDir, { recursive: true });
mkdirSync(sheetsDir, { recursive: true });

async function sliceSheet(sheet) {
  const src = join(CURSOR_ASSETS, sheet.file);
  if (!existsSync(src)) {
    console.warn('missing', src);
    return 0;
  }
  const destSheet = join(sheetsDir, sheet.saveAs);
  copyFileSync(src, destSheet);

  const meta = await sharp(src).metadata();
  const cols = 4;
  const rows = 4;
  const cellW = Math.floor(meta.width / cols);
  const cellH = Math.floor(meta.height / rows);
  let count = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const name = sheet.icons[row][col];
      const out = join(outDir, `${name}.png`);
      await sharp(src)
        .extract({ left: col * cellW, top: row * cellH, width: cellW, height: cellH })
        .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out);
      count++;
      console.log('✓', name);
    }
  }
  return count;
}

let total = 0;
for (const sheet of SHEETS) {
  total += await sliceSheet(sheet);
}
console.log(`\nГотово: ${total} иконок → public/assets/ui/icons/`);
