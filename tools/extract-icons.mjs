/**
 * Вырезает UI-иконки из кадров видео и спрайтов APK.
 * Запуск: node tools/extract-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'assets', 'ui');
const framesDir = 'C:/Users/User/Desktop/fishing_temp/frames';
const apkDir = join(root, 'apk_extracted', 'assets');

mkdirSync(outDir, { recursive: true });

async function cropFromFrame(frameName, regions) {
  const src = join(framesDir, frameName);
  if (!existsSync(src)) {
    console.warn('skip missing frame', frameName);
    return;
  }
  const meta = await sharp(src).metadata();
  const W = meta.width;
  const H = meta.height;
  for (const [nx, ny, nw, nh, name] of regions) {
    let x = Math.round(nx * W);
    let y = Math.round(ny * H);
    let w = Math.round(nw * W);
    let h = Math.round(nh * H);
    if (x + w > W) w = W - x;
    if (y + h > H) h = H - y;
    if (w <= 0 || h <= 0) continue;
    const out = join(outDir, `${name}.png`);
    await sharp(src)
      .extract({ left: x, top: y, width: w, height: h })
      .png()
      .toFile(out);
    console.log('crop', name, `${w}x${h}`, 'from', frameName);
  }
}

function parsePlistFrame(plist, key) {
  const block = plist.match(new RegExp(`<key>${key}</key>\\s*<dict>([\\s\\S]*?)</dict>`));
  if (!block) return null;
  const frame = block[1].match(/<string>\{\{(\d+),(\d+),\{(\d+),(\d+)\}\}\}<\/string>/);
  if (!frame) return null;
  const rotated = /<key>rotated<\/key>\s*<true\/>/.test(block[1]);
  return {
    x: +frame[1], y: +frame[2], w: +frame[3], h: +frame[4], rotated,
  };
}

async function extractFromAtlas(pngPath, plistPath, frameKey, outName) {
  if (!existsSync(pngPath) || !existsSync(plistPath)) return;
  const plist = readFileSync(plistPath, 'utf8');
  const f = parsePlistFrame(plist, frameKey);
  if (!f) return;
  let img = sharp(pngPath).extract({ left: f.x, top: f.y, width: f.w, height: f.h });
  if (f.rotated) img = img.rotate(90);
  await img.png().toFile(join(outDir, outName));
  console.log('atlas', outName, 'from', frameKey);
}

async function copyAsset(rel, outName) {
  const src = join(apkDir, rel);
  if (!existsSync(src)) return;
  await sharp(src).png().toFile(join(outDir, outName));
  console.log('copy', outName);
}

// Нормализованные координаты (0–1) для кадра 538×360
const gearFrame = 'frame_0010.jpg';
const gearSlots = [
  [0.068, 0.828, 0.082, 0.128, 'rod'],
  [0.150, 0.828, 0.082, 0.128, 'hook'],
  [0.232, 0.828, 0.082, 0.128, 'bait'],
  [0.314, 0.828, 0.082, 0.128, 'groundbait'],
  [0.396, 0.828, 0.082, 0.128, 'net'],
  [0.478, 0.828, 0.082, 0.128, 'catch'],
];

const hudFrame = 'frame_0003.jpg';
const hudIcons = [
  [0.018, 0.022, 0.055, 0.075, 'energy'],
  [0.018, 0.095, 0.055, 0.075, 'silver'],
  [0.018, 0.168, 0.075, 0.105, 'fish-menu'],
  [0.075, 0.022, 0.38, 0.055, 'bar-energy'],
  [0.075, 0.095, 0.38, 0.055, 'bar-silver'],
];

const navFrame = 'frame_0001.jpg';
const navIcons = [
  [0.86, 0.80, 0.065, 0.095, 'mail'],
  [0.93, 0.80, 0.065, 0.095, 'home'],
  [0.86, 0.895, 0.065, 0.095, 'shop'],
  [0.93, 0.895, 0.065, 0.095, 'backpack'],
  [0.02, 0.02, 0.065, 0.09, 'map'],
];

const fishFrame = 'frame_0002.jpg';
const fishUi = [
  [0.48, 0.55, 0.19, 0.14, 'pull-btn'],
  [0.56, 0.48, 0.12, 0.16, 'hook-shield'],
  [0.36, 0.72, 0.28, 0.045, 'tension-bar'],
  [0.42, 0.695, 0.05, 0.06, 'tension-fish'],
  [0.88, 0.42, 0.11, 0.28, 'cast-tab'],
  [0.82, 0.828, 0.075, 0.11, 'slot-bg-sample'],
];

await cropFromFrame(gearFrame, gearSlots);
await cropFromFrame(hudFrame, hudIcons);
await cropFromFrame(navFrame, navIcons);
await cropFromFrame(fishFrame, fishUi);

await extractFromAtlas(
  join(apkDir, 'rod', 'rodOut1.png'),
  join(apkDir, 'rod', 'rodOut1.plist'),
  'FishingRode_51.png',
  'rod-sprite.png',
);
await extractFromAtlas(
  join(apkDir, 'rod', 'rodKlev1.png'),
  join(apkDir, 'rod', 'rodKlev1.plist'),
  'FishingRode_51.png',
  'rod-bite.png',
);

await copyAsset('loading/preloader_icon_bg.png', 'slot-bg.png');

const manifest = {
  source: 'video frames + apk atlases',
  frame: '538x360',
  icons: [
    'rod', 'hook', 'bait', 'groundbait', 'net', 'catch',
    'energy', 'silver', 'fish-menu', 'bar-energy', 'bar-silver',
    'mail', 'home', 'shop', 'backpack', 'map',
    'pull-btn', 'hook-shield', 'tension-bar', 'tension-fish',     'cast-tab', 'slot-bg.png',
  ],
};
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Done ->', outDir);
