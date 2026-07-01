// Builds game data from APK extract (apk-data.js)

const FISH_EMOJI = ['🐟','🐠','🐡','🦈','🐋','✨','🌟','🎣','🐊','🦐'];

function fishEmoji(id, category) {
  if (category >= 5) return '🐋';
  if (category >= 4) return '🦈';
  if (category >= 3) return '🐊';
  return FISH_EMOJI[id % FISH_EMOJI.length];
}

function buildLocationsFromApk() {
  if (typeof APK_LOCATIONS === 'undefined') return null;
  const previews = ['river', 'club', 'forest', 'reed', 'lake', 'night', 'valley', 'baikal', 'loch', 'tropical', 'amazon'];
  const locations = APK_LOCATIONS.map((loc) => ({
    id: String(loc.id),
    name: loc.name,
    description: loc.description,
    region: loc.id < 9 ? 'Центральная Россия' : 'Мир',
    level: Math.max(1, loc.level + 1),
    preview: previews[loc.id % previews.length],
    x: Math.min(90, Math.max(10, loc.mapX || 30 + loc.id * 7)),
    y: Math.min(85, Math.max(15, loc.mapY || 40 + loc.id * 4)),
    fishIds: loc.fishes,
    fishVer: loc.dayVer,
    initEnabled: loc.initEnabled,
    bg: loc.bg,
  }));

  const forest = locations.find((l) => l.id === '0');
  if (forest && typeof FOREST_LAKE !== 'undefined') {
    forest.name = FOREST_LAKE.name;
    forest.description = FOREST_LAKE.description;
    forest.fishIds = FOREST_LAKE.fishIds;
    forest.fishVer = FOREST_LAKE.fishVer;
    forest.preview = 'lake';
  }
  return locations;
}

function buildShopFromApk() {
  if (typeof APK_RODS === 'undefined') return null;
  return {
    rods: APK_RODS.map((r, i) => ({
      id: r.id,
      name: r.name,
      icon: '🎣',
      iconKey: i === 0 ? 'rod-bamboo' : i < 3 ? 'rod-modern' : `rod-tier-${Math.min(5, Math.ceil((r.unlockLoc + 2) / 2))}`,
      level: r.unlockLoc + 1,
      price: r.silver || r.gold,
      currency: r.gold > 0 && !r.silver ? 'gold' : 'silver',
      bonus: Math.min(0.4, r.maxWeight / 50),
      maxWeight: r.maxWeight,
      isSpinning: r.isSpinning,
    })),
    hooks: [
      { id: 'hook1', name: 'Крючок №8', icon: '🪝', iconKey: 'hook-single', level: 1, price: 10, currency: 'silver', bonus: 0 },
      { id: 'hook2', name: 'Крючок №6', icon: '🪝', iconKey: 'hook-heavy', level: 3, price: 50, currency: 'silver', bonus: 0.05 },
      { id: 'hook3', name: 'Тройник', icon: '🪝', iconKey: 'hook-treble', level: 6, price: 200, currency: 'silver', bonus: 0.15 },
    ],
    bait: [
      { id: 'bait1', name: 'Червь', iconKey: 'bait-worm', level: 1, price: 5, currency: 'silver', bonus: 0, qty: 10 },
      { id: 'bait2', name: 'Мотыль', iconKey: 'bait-bloodworm', level: 1, price: 15, currency: 'silver', bonus: 0.03, qty: 10 },
      { id: 'bait3', name: 'Перловка', iconKey: 'bait-barley', level: 1, price: 25, currency: 'silver', bonus: 0.05, qty: 10 },
      { id: 'bait4', name: 'Опарыш', iconKey: 'bait-maggot', level: 1, price: 12, currency: 'silver', bonus: 0.04, qty: 10 },
      { id: 'bait5', name: 'Хлеб', iconKey: 'bait-bread', level: 1, price: 20, currency: 'silver', bonus: 0.06, qty: 10 },
      { id: 'bait6', name: 'Тесто', iconKey: 'bait-dough', level: 1, price: 35, currency: 'silver', bonus: 0.08, qty: 10 },
    ],
    groundbait: [
      { id: 'gb1', name: 'Прикормка', icon: '🥣', iconKey: 'feeder-cage', level: 1, price: 20, currency: 'silver', bonus: 0.1, qty: 5 },
      { id: 'gb2', name: 'Супер-прикормка', icon: '🥣', iconKey: 'feeder-method', level: 5, price: 80, currency: 'silver', bonus: 0.25, qty: 3 },
    ],
    net: [
      { id: 'net1', name: 'Простой сачок', icon: '🥅', iconKey: 'net-keep', level: 1, price: 100, currency: 'silver', bonus: 0 },
      { id: 'net2', name: 'Профи-сачок', icon: '🥅', iconKey: 'net-keep', level: 7, price: 500, currency: 'silver', bonus: 0.2 },
    ],
    soup: [
      { id: 'soup1', name: 'Уха', icon: '🍲', iconKey: 'canteen', level: 1, price: 30, currency: 'silver', effect: 'energy+20' },
      { id: 'soup2', name: 'Бульон', icon: '🍲', iconKey: 'potion-energy', level: 3, price: 60, currency: 'silver', effect: 'energy+50' },
    ],
  };
}

const FISH = { ...GAME_FISH };

const LOCATIONS = (() => {
  const lake = {
    id: '0',
    name: FOREST_LAKE.name,
    description: FOREST_LAKE.description,
    region: 'Центральная Россия',
    level: 1,
    preview: 'lake',
    x: 50,
    y: 45,
    fishIds: FOREST_LAKE.fishIds,
    fishVer: FOREST_LAKE.fishVer,
    initEnabled: true,
  };
  const fromApk = buildLocationsFromApk();
  if (!fromApk) return [lake];
  const forest = fromApk.find((l) => l.id === '0');
  if (forest) {
    Object.assign(forest, {
      name: FOREST_LAKE.name,
      description: FOREST_LAKE.description,
      fishIds: FOREST_LAKE.fishIds,
      fishVer: FOREST_LAKE.fishVer,
      preview: 'lake',
    });
  } else {
    fromApk.unshift(lake);
  }
  for (const loc of fromApk) {
    if (loc.id === '0') continue;
    loc.fishIds = [...FOREST_LAKE.fishIds];
    loc.fishVer = [...FOREST_LAKE.fishVer];
  }
  return fromApk;
})();

const SHOP = buildShopFromApk() || {
  rods: [{ id: 'rod_0', name: 'Старая удочка', icon: '🎣', iconKey: 'rod-bamboo', level: 1, price: 0, currency: 'silver', bonus: 0 }],
};

const FISHING_PARAMS = typeof APK_FISHING_PARAMS !== 'undefined' ? APK_FISHING_PARAMS : {
  beforeKlev: { checkTime: 2, probability: 0.65 },
  maxTimeBefore: 10,
  maxTimeDuring: 5,
};

const TOURNAMENT_BOTS = [
  { name: 'Мастер_рыболов', weight: 88.666 },
  { name: 'Золотой_крючок', weight: 87.958 },
  { name: 'Щукарь', weight: 87.500 },
  { name: 'Карасиха', weight: 86.200 },
  { name: 'Окунь_Pro', weight: 85.100 },
  { name: 'Сомовод', weight: 84.300 },
  { name: 'Форелевый', weight: 83.800 },
  { name: 'Плотвичка', weight: 82.500 },
];

const REGIONS = ['Центральная Россия', 'Мир'];

const STATES = {
  IDLE: 'idle',
  CAST_CHARGING: 'cast_charging',
  CAST_FLIGHT: 'cast_flight',
  WAITING: 'waiting',
  BITE_WARNING: 'bite_warning',
  HOOK_WINDOW: 'hook_window',
  FIGHT_FISH: 'fight_fish',
  CASTING: 'casting',
  BITE: 'bite',
  FIGHT: 'fight',
};
