import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CURSOR_ASSETS = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets';
const SRC_MISC = 'c:/Users/User/Desktop/Иконки/Прочее';
const OUT = 'c:/Users/User/Desktop/Игра/public/assets';

const FISH_FROM_MISC = {
  'Вьюн.png': 'fish/fish-vyun.png',
  'Ерш.png': 'fish/fish-ersh.png',
  'Золотой карась.png': 'fish/fish-gold-karas.png',
  'Карась.png': 'fish/fish-karas.png',
  'Окунь.png': 'fish/fish-okun.png',
};

const FISH_FROM_UPLOAD = [
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images____-8329005a-42fc-45bf-8c58-61ecd072ab86.png', 'fish/fish-lesh.png'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images________-88050f45-30ec-4283-b080-b701aa170031.png', 'fish/fish-peskari.png'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_____-351243d2-cf57-4ff9-b1ed-8e0487f85570.png', 'fish/fish-lin.png'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______-c809ddad-daf9-4aeb-bd4e-162f568ab88b.png', 'fish/fish-rotan.png'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_____-f684360f-fe55-4d83-8677-54ff2b22032f.png', 'fish/fish-shchuka.png'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images____-6c578176-83d3-47f4-a9fa-96f018374fa3.png', 'fish/fish-plotva.png'],
];

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
  if (r < 28 && g < 28 && b < 28) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  if (r > 188 && g > 188 && b > 188 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18) return true;
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

async function saveFish(src, destRel) {
  if (!fs.existsSync(src)) {
    console.warn('skip missing', src);
    return;
  }
  const dest = path.join(OUT, destRel);
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await stripBackgroundFlood(src)
    .then((p) => p.trim({ threshold: 12 }).png().toFile(dest));
  console.log('ok', destRel);
}

for (const [srcName, destRel] of Object.entries(FISH_FROM_MISC)) {
  await saveFish(path.join(SRC_MISC, 'Рыба', srcName), destRel);
}

for (const [srcName, destRel] of FISH_FROM_UPLOAD) {
  await saveFish(path.join(CURSOR_ASSETS, srcName), destRel);
}

console.log('Fish sprites ready');
