import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets';
const OUT = 'c:/Users/User/Desktop/Игра/public/assets/ui/icons';

const COINS = [
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images__________________-ccb21c3d-0021-43a7-a117-e0faae61d69f.png', 'silver'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_______________-2005d914-f7aa-4462-9f7c-714b257f8236.png', 'gold'],
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

async function processCoin(srcFile, outName) {
  const src = path.join(ASSETS, srcFile);
  const dest = path.join(OUT, `${outName}.png`);
  if (!fs.existsSync(src)) {
    console.warn('skip (missing):', src);
    return;
  }
  const img = await stripBackgroundFlood(src);
  await img
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log('ok', outName);
}

fs.mkdirSync(OUT, { recursive: true });
for (const [src, name] of COINS) {
  await processCoin(src, name);
}
