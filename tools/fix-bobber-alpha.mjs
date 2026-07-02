import sharp from 'sharp';
import { renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'assets', 'ui', 'hud', 'bobber.png');
const tmp = join(__dirname, '..', 'public', 'assets', 'ui', 'hud', 'bobber-alpha.png');

const BG = 34;

function isBg(r, g, b) {
  return r <= BG && g <= BG && b <= BG;
}

const { data, info } = await sharp(out)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const visited = new Uint8Array(width * height);
const queue = [];

const idx = (x, y) => (y * width + x) * 4;
const pi = (x, y) => y * width + x;

for (let x = 0; x < width; x++) {
  for (const y of [0, height - 1]) {
    const p = pi(x, y);
    if (visited[p]) continue;
    const i = idx(x, y);
    if (isBg(data[i], data[i + 1], data[i + 2])) {
      visited[p] = 1;
      queue.push([x, y]);
    }
  }
}
for (let y = 0; y < height; y++) {
  for (const x of [0, width - 1]) {
    const p = pi(x, y);
    if (visited[p]) continue;
    const i = idx(x, y);
    if (isBg(data[i], data[i + 1], data[i + 2])) {
      visited[p] = 1;
      queue.push([x, y]);
    }
  }
}

while (queue.length) {
  const [x, y] = queue.pop();
  const i = idx(x, y);
  data[i + 3] = 0;
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const np = pi(nx, ny);
    if (visited[np]) continue;
    const ni = idx(nx, ny);
    if (isBg(data[ni], data[ni + 1], data[ni + 2])) {
      visited[np] = 1;
      queue.push([nx, ny]);
    }
  }
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(tmp);

renameSync(tmp, out);

const meta = await sharp(out).metadata();
console.log('saved', out, meta.format, meta.width, meta.height, 'hasAlpha', meta.hasAlpha);
