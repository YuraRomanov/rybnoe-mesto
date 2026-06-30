import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'apk_extracted', 'assets');

function parseLocale(xml) {
  const map = {};
  const re = /<text id="([^"]+)"[^>]*>([^<]*)<\/text>/g;
  let m;
  while ((m = re.exec(xml))) map[m[1]] = m[2].trim();
  return map;
}

function parseAttr(block, name) {
  const m = block.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
}

function parseLocations(gamedata, locale) {
  const locs = [];
  const re = /<location\s+([^>]+)>/g;
  let m;
  while ((m = re.exec(gamedata))) {
    const a = m[1];
    const id = parseInt(parseAttr(a, 'id'), 10);
    const nameKey = parseAttr(a, 'name');
    const fishes = (parseAttr(a, 'fishes') || '').split(',').map(Number).filter((n) => !isNaN(n));
    const dayVer = (parseAttr(a, 'fishes_ver_day') || '').split(',').map(Number);
    const level = parseInt(parseAttr(a, 'level'), 10) || 0;
    const initEnabled = parseAttr(a, 'initEnabled') === 'true';
    const bg = parseAttr(a, 'bg') || '';
    const wx = parseInt(parseAttr(a, 'x') || '50', 10);
    const wy = parseInt(parseAttr(a, 'y') || '50', 10);
    const wm = gamedata.slice(m.index).match(/<world_map x="(\d+)" y="(\d+)"/);
    locs.push({
      id,
      nameKey,
      name: locale[nameKey] || nameKey,
      descriptionKey: parseAttr(a, 'description'),
      description: locale[parseAttr(a, 'description')] || '',
      fishes,
      dayVer,
      level,
      initEnabled,
      bg: bg.replace('locations/', '').replace('.jpg', ''),
      mapX: wm ? +wm[1] / 16 : 50,
      mapY: wm ? +wm[2] / 6 : 50,
    });
  }
  return locs;
}

function parseFish(gamedata, locale) {
  const fish = {};
  const re = /<fish\s+([^>]+)\/>/g;
  let m;
  while ((m = re.exec(gamedata))) {
    const a = m[1];
    const id = parseInt(parseAttr(a, 'id'), 10);
    const nameKey = parseAttr(a, 'name');
    fish[id] = {
      id,
      nameKey,
      name: locale[nameKey] || nameKey,
      minW: parseFloat(parseAttr(a, 'minWeight')),
      maxW: parseFloat(parseAttr(a, 'maxWeight')),
      bigW: parseFloat(parseAttr(a, 'bigWeight')),
      rareW: parseFloat(parseAttr(a, 'rareWeight')),
      category: parseInt(parseAttr(a, 'category'), 10) || 1,
    };
  }
  return fish;
}

function parseRods(gamedata, locale) {
  const rods = [];
  const re = /<udochka\s+([^>]+)\/>/g;
  let m;
  while ((m = re.exec(gamedata))) {
    const a = m[1];
    const nameKey = parseAttr(a, 'name');
    rods.push({
      id: `rod_${parseAttr(a, 'id')}`,
      gameId: parseInt(parseAttr(a, 'id'), 10),
      name: locale[nameKey] || nameKey,
      silver: parseInt(parseAttr(a, 'cost_v') || '0', 10),
      gold: parseInt(parseAttr(a, 'cost_r') || '0', 10),
      maxWeight: parseFloat(parseAttr(a, 'maxWeight')),
      unlockLoc: parseInt(parseAttr(a, 'unlock_loc') || '0', 10),
      isSpinning: parseAttr(a, 'isSpining') === 'true',
    });
  }
  return rods;
}

const gamedata = readFileSync(join(assets, 'gamedata.xml'), 'utf8');
const locale = parseLocale(readFileSync(join(assets, 'locale', 'ru_RU.xml'), 'utf8'));
const fishing = readFileSync(join(assets, 'fishing.xml'), 'utf8');

const locations = parseLocations(gamedata, locale).slice(0, 12);
const fish = parseFish(gamedata, locale);
const rods = parseRods(gamedata, locale).slice(0, 15);

const out = `// Auto-generated from ru.drimmi.fishing2 APK data
// Source: assets/gamedata.xml + locale/ru_RU.xml

export const APK_FISHING_PARAMS = ${JSON.stringify({
  beforeKlev: { checkTime: 2.0, probability: 0.65 },
  klevStart: { third: 0.85, second: 0.45 },
  maxTimeBefore: 10.0,
  maxTimeDuring: 5.0,
  weightCategories: { cat1: 0.87, cat2: 0.1, cat3: 0.03 },
}, null, 2)};

export const APK_LOCATIONS = ${JSON.stringify(locations, null, 2)};

export const APK_FISH = ${JSON.stringify(fish, null, 2)};

export const APK_RODS = ${JSON.stringify(rods, null, 2)};
`;

writeFileSync(join(root, 'apk-data.js'), out.replace(/export const/g, 'const').replace(/^/m, ''));
const js = out.replace(/export const/g, 'const');
writeFileSync(join(root, 'apk-data.js'), js);
console.log(`Locations: ${locations.length}, Fish: ${Object.keys(fish).length}, Rods: ${rods.length}`);
