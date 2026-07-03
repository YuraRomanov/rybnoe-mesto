/** Иконки игры — PNG из public/assets/ui/icons/ */
const GAME_ICONS = (() => {
  const BASE = 'assets/ui/icons';

  const FILES = {
    energy: 'energy',
    silver: 'silver',
    gold: 'gold',
    map: 'map',
    line: 'line',
    float: 'float',
    'rod-bamboo': 'rod-bamboo',
    'rod-spark': 'rod-spark',
    'reel-tier-1': 'reel-tier-1',
    hook: 'hook',
    'bait-worm': 'bait-worm',
    'bait-maggot': 'bait-maggot',
    'bait-bloodworm': 'bait-bloodworm',
    'bait-bread': 'bait-bread',
    'bait-barley': 'bait-barley',
    'bait-corn': 'bait-corn',
    'bait-minnow': 'bait-minnow',
    'bait-peas': 'bait-peas',
    'bait-caster': 'bait-caster',
    'bait-maybug': 'bait-maybug',
    'bait-dough': 'bait-dough',
    net: 'net',
  };

  const MAP = {
    rod: 'rod-bamboo',
    rod_0: 'rod-bamboo',
    rod_spark: 'rod-spark',
    'rod-spark': 'rod-spark',
    'rod-modern': 'reel-tier-1',
    hook: 'hook',
    hook1: 'hook',
    hook2: 'hook',
    hook7: 'hook',
    line1: 'line',
    line2: 'line',
    line3: 'line',
    line4: 'line',
    line5: 'line',
    'hook-single': 'hook',
    'hook-heavy': 'hook',
    'hook-treble': 'hook',
    bait: 'bait-worm',
    bait1: 'bait-worm',
    bait2: 'bait-bloodworm',
    bait3: 'bait-barley',
    bait4: 'bait-maggot',
    bait5: 'bait-bread',
    bait6: 'bait-dough',
    bait7: 'bait-corn',
    bait8: 'bait-minnow',
    bait9: 'bait-peas',
    bait10: 'bait-caster',
    bait12: 'bait-maybug',
    'bait-worm': 'bait-worm',
    'bait-maggot': 'bait-maggot',
    'bait-bloodworm': 'bait-bloodworm',
    'bait-bread': 'bait-bread',
    'bait-corn': 'bait-corn',
    'bait-minnow': 'bait-minnow',
    'bait-peas': 'bait-peas',
    'bait-caster': 'bait-caster',
    'bait-maybug': 'bait-maybug',
    'bait-barley': 'bait-barley',
    'bait-dough': 'bait-dough',
    groundbait: 'bait-dough',
    gb1: 'bait-dough',
    gb2: 'bait-dough',
    net: 'net',
    net1: 'net',
    net2: 'net',
    'net-keep': 'net',
    energy: 'energy',
    silver: 'silver',
    gold: 'gold',
    map: 'map',
    shop: 'reel-tier-1',
    backpack: 'net',
    home: 'map',
    cast: 'rod-bamboo',
    float: 'float',
    'float-basic': 'float',
    'float-neon': 'float',
    trophy: 'gold',
    medal: 'float',
    water: 'line',
    club: 'float',
    cook: 'bait-dough',
    boost: 'gold',
    lure: 'bait-minnow',
    canteen: 'bait-dough',
    'potion-energy': 'energy',
    'feeder-cage': 'bait-dough',
    'feeder-method': 'bait-dough',
    soup: 'energy',
    soup1: 'energy',
    soup2: 'energy',
  };

  const SHOP_TABS = {
    rods: 'rod-bamboo',
    hooks: 'hook',
    lines: 'line',
    bait: 'bait-worm',
    net: 'net',
    soup: 'energy',
  };

  const MODAL_ICONS = {
    shop: 'reel-tier-1',
    map: 'map',
    location: 'float',
    tutorial: 'float',
    backpack: 'net',
    sadok: 'net',
    rods: 'rod-bamboo',
    bait: 'bait-worm',
    hooks: 'hook',
    lines: 'line',
    catch: 'net',
  };

  const HUD = {
    energy: 'energy',
    silver: 'silver',
    gold: 'gold',
    map: 'map',
    water: 'line',
    club: 'float',
    hook: 'hook',
    bait: 'bait-worm',
    cook: 'bait-dough',
    net: 'net',
    boost: 'gold',
    shop: 'reel-tier-1',
    backpack: 'net',
    home: 'map',
    mail: null,
  };

  const ROD_TIERS = ['rod-bamboo', 'reel-tier-1'];

  function resolve(key) {
    if (!key) return 'rod-bamboo';
    if (FILES[key]) return key;
    if (MAP[key]) return MAP[key];
    if (key.startsWith('rod-tier-') || key.startsWith('rod_')) {
      const n = parseInt(String(key).replace(/\D/g, ''), 10) || 0;
      return n <= 0 ? 'rod-bamboo' : 'reel-tier-1';
    }
    if (key.startsWith('bait')) return MAP[key] || 'bait-worm';
    if (key.startsWith('hook')) return 'hook';
    if (key.startsWith('line')) return 'line';
    return MAP[key] || key;
  }

  function url(key) {
    const file = resolve(key);
    let v = '';
    if (file.startsWith('bait-')) v = '?v=2';
    else if (file === 'rod-spark') v = '?v=2';
    return `${BASE}/${file}.png${v}`;
  }

  function img(key, className = 'game-icon', alt = '') {
    return `<img class="${className}" src="${url(key)}" alt="${alt}" loading="lazy" draggable="false">`;
  }

  function rodIconForLevel(level = 1) {
    return level <= 1 ? 'rod-bamboo' : 'reel-tier-1';
  }

  function rodIconForItem(rod) {
    if (!rod) return 'rod-bamboo';
    if (rod.iconKey) return resolve(rod.iconKey);
    if (rod.id === 'rod_spark') return 'rod-spark';
    if (rod.id === 'rod_0' || rod.price === 0) return 'rod-bamboo';
    return rodIconForLevel(rod.level || 1);
  }

  function applyHud(imgEl, key) {
    const file = HUD[key];
    if (!file) {
      imgEl.style.display = 'none';
      imgEl.removeAttribute('src');
      imgEl.closest('[data-hud-icon]')?.classList.add('hud-icon--text');
      return;
    }
    imgEl.style.display = '';
    imgEl.closest('.hud-icon--text')?.classList.remove('hud-icon--text');
    imgEl.src = `${BASE}/${file}.png`;
  }

  function applyHudAll(root = document) {
    root.querySelectorAll('[data-hud-icon]').forEach((el) => {
      if (el.id && el.id.startsWith('dock-icon-')) return;
      applyHud(el, el.dataset.hudIcon);
    });
    root.querySelectorAll('[data-game-icon]').forEach((el) => {
      if (el.id && el.id.startsWith('dock-icon-')) return;
      el.src = url(el.dataset.gameIcon);
    });
  }

  function shopTabIcon(tab) {
    return SHOP_TABS[tab] || 'reel-tier-1';
  }

  function applyMenuIcons(root = document) {
    root.querySelectorAll('[data-shop-tab-icon]').forEach((el) => {
      const tab = el.dataset.shopTabIcon;
      el.src = url(shopTabIcon(tab));
      el.alt = '';
    });
    root.querySelectorAll('[data-modal-icon]').forEach((el) => {
      const key = el.dataset.modalIcon;
      el.src = url(MODAL_ICONS[key] || resolve(key));
      el.alt = '';
    });
    root.querySelectorAll('[data-btn-icon]').forEach((el) => {
      el.src = url(resolve(el.dataset.btnIcon));
      el.alt = '';
    });
  }

  return {
    url, img, resolve, rodIconForLevel, rodIconForItem, shopTabIcon,
    applyHud, applyHudAll, applyMenuIcons, MAP, HUD, FILES, ROD_TIERS, SHOP_TABS, MODAL_ICONS,
  };
})();
