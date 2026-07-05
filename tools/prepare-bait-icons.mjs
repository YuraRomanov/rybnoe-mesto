import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS = 'C:/Users/User/.cursor/projects/c-Users-User-Desktop/assets';
const OUT = 'c:/Users/User/Desktop/Игра/public/assets/ui/icons';

const BAITS = [
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______-6e0f7838-433e-4d9a-a93a-d0e193344219.png', 'bait-worm'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_______-0f034e25-2361-4c5f-9b88-7d928874ad09.png', 'bait-maggot'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_______-0db85a20-5279-4efb-8755-a12170081f1d.png', 'bait-bloodworm'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_____-89b19942-93cf-49ce-bf59-aade859c661e.png', 'bait-bread'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______-fbafe994-61cb-4855-999f-a66dddbd0e2f.png', 'bait-dough'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_________-5b7c07de-0816-4cf7-a899-7df0347e5c07.png', 'bait-barley'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_3____._2026__.__18_23_48__1_-011f129a-e557-4c72-9bff-904bc13d3569.png', 'bait-corn'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_3____._2026__.__18_23_49__2_-d3e8db21-d8d4-4b71-99ae-e8c9e4d8ba89.png', 'bait-minnow'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_3____._2026__.__18_23_50__3_-066ac87a-9400-4574-a8a1-136b6313eda5.png', 'bait-caster'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_3____._2026__.__18_23_50__4_-3488aa27-c7ee-479a-8a9f-c51e8a14c800.png', 'bait-maybug'],
  ['c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_3____._2026__.__18_23_50__5_-88888b47-b8f0-497d-870c-69b7e24f64bb.png', 'bait-fly'],
];

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
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

async function processBait(srcFile, outName) {
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
for (const [src, name] of BAITS) {
  await processBait(src, name);
}
