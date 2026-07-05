import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SRC = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets/c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_______-da7de7bf-a9f8-493b-8ec2-043fdce5e850.png';
const OUT = 'c:/Users/User/Desktop/Игра/public/assets/ui/icons/levels';

const COLS = 6;
const ROWS = 5;
const COUNT = 30;
const OUT_SIZE = 128;

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
  if (r < 28 && g < 28 && b < 28) return true;
  return false;
}

async function stripBackgroundFlood(buffer, width, height) {
  const px = Buffer.from(buffer);
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

  return px;
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('missing:', SRC);
    process.exit(1);
  }

  const { width, height } = await sharp(SRC).metadata();
  fs.mkdirSync(OUT, { recursive: true });

  for (let n = 1; n <= COUNT; n++) {
    const row = Math.floor((n - 1) / COLS);
    const col = (n - 1) % COLS;
    const left = Math.round((col * width) / COLS);
    const top = Math.round((row * height) / ROWS);
    const right = Math.round(((col + 1) * width) / COLS);
    const bottom = Math.round(((row + 1) * height) / ROWS);
    const cropW = right - left;
    const cropH = bottom - top;

    const { data, info } = await sharp(SRC)
      .extract({ left, top, width: cropW, height: cropH })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const transparent = await stripBackgroundFlood(data, info.width, info.height);

    await sharp(transparent, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .resize(OUT_SIZE, OUT_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, `level-${n}.png`));

    console.log('ok', n);
  }
}

main();
