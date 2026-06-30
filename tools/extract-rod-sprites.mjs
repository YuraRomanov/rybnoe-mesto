/**
 * Вырезает кадры удочки из атласов APK → public/assets/rod/
 * Запуск: node tools/extract-rod-sprites.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apkRod = join(root, 'apk_extracted', 'assets', 'rod');
const outDir = join(root, 'public', 'assets', 'rod');
const framesDir = join(outDir, 'frames');

mkdirSync(framesDir, { recursive: true });

function parseFrameRect(block) {
  const tag = '<key>frame</key>';
  const i = block.indexOf(tag);
  if (i < 0) return null;
  const s = block.indexOf('<string>', i);
  const e = block.indexOf('</string>', s);
  if (s < 0 || e < 0) return null;
  const nums = block.slice(s + 8, e).match(/\d+/g);
  if (!nums || nums.length < 4) return null;
  return { x: +nums[0], y: +nums[1], w: +nums[2], h: +nums[3] };
}

function parseAllFrames(plist) {
  const frames = [];
  const parts = plist.split(/<key>FishingRode_(\d+)\.png<\/key>/);
  for (let i = 1; i < parts.length; i += 2) {
    const id = +parts[i];
    const block = parts[i + 1];
    const rect = parseFrameRect(block);
    if (!rect) continue;
    const size = block.match(/<key>sourceSize<\/key>\s*<string>\{(\d+),(\d+)\}<\/string>/);
    frames.push({
      id,
      ...rect,
      rotated: /<key>rotated<\/key>\s*<true\/>/.test(block),
      sw: size ? +size[1] : rect.w,
      sh: size ? +size[2] : rect.h,
    });
  }
  return frames.sort((a, b) => a.id - b.id);
}

async function extractAtlas(name) {
  const png = join(apkRod, `${name}.png`);
  const plist = join(apkRod, `${name}.plist`);
  console.log('check', name, existsSync(png), existsSync(plist));
  if (!existsSync(png) || !existsSync(plist)) {
    console.warn('skip', name);
    return [];
  }

  copyFileSync(png, join(outDir, `${name}.png`));
  const frames = parseAllFrames(readFileSync(plist, 'utf8'));

  for (const f of frames) {
    let { x, y, w, h } = f;
    const meta = await sharp(png).metadata();
    if (x + w > meta.width) w = meta.width - x;
    if (y + h > meta.height) h = meta.height - y;
    if (w <= 0 || h <= 0) {
      console.warn('skip bad frame', name, f.id);
      continue;
    }
    let img = sharp(png).extract({ left: x, top: y, width: w, height: h });
    if (f.rotated) img = img.rotate(90);
    const outName = `${name}_${String(f.id).padStart(3, '0')}.png`;
    await img.png().toFile(join(framesDir, outName));
    console.log('frame', outName, f.sw, 'x', f.sh);
  }

  return frames;
}

const klev = await extractAtlas('rodKlev2');
const out = await extractAtlas('rodOut1');

const manifest = {
  klev: {
    src: 'assets/rod/rodKlev2.png',
    ids: klev.map((f) => f.id),
    frames: klev,
  },
  out: {
    src: 'assets/rod/rodOut1.png',
    ids: out.map((f) => f.id),
    frames: out,
  },
};

writeFileSync(join(root, 'public', 'rod-sprites.js'), `// Автогенерация: node tools/extract-rod-sprites.mjs
const ROD_SPRITES = ${JSON.stringify(manifest, null, 2)};
`);

console.log('Done:', klev.length, 'klev +', out.length, 'out frames');
