import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets';
const ICON_OUT = 'c:/Users/User/Desktop/Игра/public/assets/ui/icons';
const ROD_OUT = 'c:/Users/User/Desktop/Игра/public/assets/rod';

/** Рамочные иконки для магазина / дока */
const SHOP_ICONS = [
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3000-edb2908d-c4d6-4026-90e9-5babd5c29286.png', 'rod-wave'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4000-3545c50a-abf6-4653-a8db-27f12176252b.png', 'rod-titan'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5000-db98618f-7854-4f10-8b05-eaff97ef92fe.png', 'rod-phantom'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_6000-98f21daf-3200-4dba-97d9-bc17c65acdd4.png', 'rod-dragon'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_7000-2f24c045-5d37-4377-a19b-2413b8e63b17.png', 'rod-legend'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_9000-0294bb26-df7f-453d-8321-49684553413c.png', 'rod-kraken'],
];

/** Спрайты удочки на экране рыбалки (без рамки) */
const ROD_SPRITES = [
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Wave_3000-f99f7549-fba7-43cd-aa5d-0d80cbcca06e.png', 'wave-3000'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_TItan_4000-154e9b4c-5a7b-491a-ac53-65d976b2f41e.png', 'titan-4000'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Phantom_5000-6c891b52-9488-4c1c-8656-54749664e1fc.png', 'phantom-5000'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Dragon_6000-9fb6fdc3-caa3-4741-9825-197d99b4aa4e.png', 'dragon-6000'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Legend_7000-9eb2d36a-c438-4efb-8928-0b0cc56c4234.png', 'legend-7000'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Kraken_9000-669961a1-2c09-4d9e-81db-bfae811b9565.png', 'kraken-9000'],
];

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
  if (r < 28 && g < 28 && b < 28) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  if (r > 235 && g > 235 && b > 235) return true;
  return false;
}

async function stripBackgroundFlood(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const px = data;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const idx = (x, y) => (y * width + x) * 4;
  const pi = (x, y) => y * width + x;

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = pi(x, y);
    if (visited[p]) return;
    visited[p] = 1;
    const i = idx(x, y);
    if (!isBackgroundPixel(px[i], px[i + 1], px[i + 2], px[i + 3])) return;
    px[i + 3] = 0;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.shift();
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  return sharp(px, {
    raw: { width, height, channels: 4 },
  });
}

async function exportShopIcon(srcFile, iconName) {
  const src = path.join(ASSETS, srcFile);
  if (!fs.existsSync(src)) {
    console.warn('skip icon (missing):', src);
    return;
  }
  await sharp(src)
    .ensureAlpha()
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ICON_OUT, `${iconName}.png`));
  console.log('icon', iconName);
}

async function exportRodSprite(srcFile, spriteName) {
  const src = path.join(ASSETS, srcFile);
  if (!fs.existsSync(src)) {
    console.warn('skip sprite (missing):', src);
    return;
  }
  const img = await stripBackgroundFlood(src);
  await img
    .resize(550, 728, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROD_OUT, `${spriteName}.png`));
  console.log('sprite', spriteName);
}

fs.mkdirSync(ICON_OUT, { recursive: true });
fs.mkdirSync(ROD_OUT, { recursive: true });

for (const [src, name] of SHOP_ICONS) {
  await exportShopIcon(src, name);
}
for (const [src, name] of ROD_SPRITES) {
  await exportRodSprite(src, name);
}
