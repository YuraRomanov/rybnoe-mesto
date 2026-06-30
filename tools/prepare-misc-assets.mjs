import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SRC = 'c:/Users/User/Desktop/Иконки/Прочее';
const OUT = 'c:/Users/User/Desktop/Игра/public/assets';

const FISH_MAP = {
  'Вьюн.png': 'fish/fish-vyun.png',
  'Ерш.png': 'fish/fish-ersh.png',
  'Золотой карась.png': 'fish/fish-gold-karas.png',
  'Карась.png': 'fish/fish-karas.png',
  'Окунь.png': 'fish/fish-okun.png',
  'Плотва.png': 'fish/fish-plotva.png',
};

const ALLOWED_FISH_FILES = new Set(Object.values(FISH_MAP).map((p) => path.basename(p)));

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  if (r > 188 && g > 188 && b > 188 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18) return true;
  return false;
}

async function stripBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = data;
  for (let i = 0; i < px.length; i += 4) {
    if (isBackgroundPixel(px[i], px[i + 1], px[i + 2], px[i + 3])) {
      px[i + 3] = 0;
    }
  }

  return sharp(px, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

/** Удаляет только фон, связанный с краями — не вырезает светлую середину спрайта */
async function stripBackgroundFlood(input, isBg = isBackgroundPixel) {
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
    if (!isBg(px[i], px[i + 1], px[i + 2], px[i + 3])) return;
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

async function saveTrimmed(pipeline, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await pipeline.trim({ threshold: 12 }).png().toFile(dest);
}

async function processBobber(src, dest) {
  const meta = await sharp(src).metadata();
  const side = Math.min(meta.width, meta.height);
  const width = Math.floor(side * 0.42);
  const height = Math.floor(side * 0.62);
  const left = Math.floor((meta.width - width) / 2);
  const top = Math.floor((meta.height - height) * 0.18);
  const cropped = sharp(src).extract({ left, top, width, height });
  await saveTrimmed(await stripBackgroundFlood(await cropped.toBuffer()), dest);
}

async function processCastStrip(src, dest) {
  const buf = await stripBackground(src).then((p) => p.png().toBuffer());
  const meta = await sharp(buf).metadata();
  const { data } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = meta.width;
  const height = meta.height;

  const rowOpaque = (y) => {
    let n = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 40) n++;
    }
    return n;
  };

  const wideThreshold = width * 0.22;

  let top = 0;
  for (let y = 0; y < height; y++) {
    if (rowOpaque(y) >= wideThreshold) {
      top = Math.max(0, y - 4);
      break;
    }
  }

  let bottom = height - 1;
  for (let y = height - 1; y >= top; y--) {
    if (rowOpaque(y) >= wideThreshold) {
      bottom = Math.min(height - 1, y + 4);
      break;
    }
  }

  const cropH = Math.min(height - top, Math.max(1, bottom - top + 1));
  const cropped = await sharp(buf)
    .extract({ left: 0, top, width, height: cropH })
    .png()
    .toBuffer();
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await sharp(cropped).trim({ threshold: 12 }).png().toFile(dest);
}

async function processPanel(src, dest) {
  await saveTrimmed(await stripBackground(src), dest);
}

async function flipRod(src, dest) {
  await saveTrimmed(await stripBackground(src).then((p) => p.flop()), dest);
}

async function processFish(src, dest) {
  await saveTrimmed(await stripBackground(src), dest);
}

async function cleanupFishAssets() {
  const fishDir = path.join(OUT, 'fish');
  if (!fs.existsSync(fishDir)) return;
  for (const name of fs.readdirSync(fishDir)) {
    const full = path.join(fishDir, name);
    if (name.endsWith('.png') && !ALLOWED_FISH_FILES.has(name)) {
      fs.unlinkSync(full);
    }
    if (name === 'sheets' && fs.statSync(full).isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true });
    }
  }
}

async function main() {
  const hud = path.join(OUT, 'ui/hud');
  const rodDir = path.join(OUT, 'rod/frames');

  await processBobber(path.join(SRC, 'Поплавок.png'), path.join(hud, 'bobber.png'));
  await processPanel(path.join(SRC, 'Шкала.png'), path.join(hud, 'reel-bar-bg.png'));
  await processCastStrip(path.join(SRC, 'Заброс.png'), path.join(hud, 'cast-default.png'));
  await processCastStrip(path.join(SRC, 'Жди.png'), path.join(hud, 'cast-wait.png'));
  await processCastStrip(path.join(SRC, 'ТЯни.png'), path.join(hud, 'cast-pull.png'));

  for (let i = 1; i <= 6; i++) {
    await flipRod(
      path.join(SRC, 'Удочка', `${i}.png`),
      path.join(rodDir, `rod-${String(i).padStart(2, '0')}.png`),
    );
  }

  for (const [srcName, destRel] of Object.entries(FISH_MAP)) {
    await processFish(path.join(SRC, 'Рыба', srcName), path.join(OUT, destRel));
  }
  await cleanupFishAssets();

  await processBobber(path.join(SRC, 'Поплавок.png'), path.join(OUT, 'ui/icons/float.png'));

  console.log('Assets prepared with transparent backgrounds');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
