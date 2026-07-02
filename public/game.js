const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');

const bgImage = new Image();
let currentSceneSrc = 'assets/locations/lake.png';
let bgReady = false;

function applyLocationScene(loc) {
  const src = loc?.sceneBg || 'assets/locations/lake.png';
  if (src === currentSceneSrc) return;
  currentSceneSrc = src;
  bgReady = false;
  bgImage.onload = () => { bgReady = true; };
  bgImage.onerror = () => { bgReady = false; };
  bgImage.src = src;
}

bgImage.onload = () => { bgReady = true; };
bgImage.onerror = () => { bgReady = false; };
bgImage.src = currentSceneSrc;

const rodImg = new Image();
let rodImgReady = false;
rodImg.onload = () => { rodImgReady = rodImg.naturalWidth > 0; };
rodImg.onerror = () => { rodImgReady = false; };
rodImg.src = 'assets/rod/rod.png?v=1';

const ROD_SPRITE_SRC = {
  rod_0: 'assets/rod/rod.png?v=1',
  rod_spark: 'assets/rod/spark-2000.png?v=2',
};

function applyRodSprite(rodId) {
  const src = ROD_SPRITE_SRC[rodId] || ROD_SPRITE_SRC.rod_0;
  const base = src.split('?')[0];
  if (rodImg.src.includes(base)) return;
  rodImgReady = false;
  rodImg.onload = () => { rodImgReady = rodImg.naturalWidth > 0; };
  rodImg.onerror = () => { rodImgReady = false; };
  rodImg.src = src;
}

const ROD_SPRITE = {
  anchorX: 0.92,
  anchorY: 0.98,
  tipX: 0.04,
  tipY: 0.03,
  heightRatio: 0.5,
  leftOfBtn: 38,
  belowBtn: 54,
  clockwiseBias: 0.16,
};

function getCastBtnLayout() {
  const btn = document.getElementById('cast-btn');
  const canvasRect = canvas.getBoundingClientRect();
  if (!btn || canvasRect.width <= 0) return null;
  const r = btn.getBoundingClientRect();
  const sx = canvas.width / canvasRect.width;
  const sy = canvas.height / canvasRect.height;
  return {
    left: (r.left - canvasRect.left) * sx,
    top: (r.top - canvasRect.top) * sy,
    right: (r.right - canvasRect.left) * sx,
    bottom: (r.bottom - canvasRect.top) * sy,
  };
}

function getRodHandlePos(w, h, dock) {
  const btn = getCastBtnLayout();
  if (btn) {
    return {
      x: btn.left - Math.max(ROD_SPRITE.leftOfBtn, w * 0.028),
      y: btn.bottom + Math.max(ROD_SPRITE.belowBtn, h * 0.022),
    };
  }
  return {
    x: w - Math.max(96, w * 0.1),
    y: h - dock * 0.28,
  };
}

function getRodTargetAngle(vs, fctx, handle, bob) {
  const dh = canvas.height * ROD_SPRITE.heightRatio;
  const aspect = rodImgReady ? rodImg.naturalWidth / rodImg.naturalHeight : 550 / 728;
  const dw = dh * aspect;
  const naturalAngle = Math.atan2(
    (ROD_SPRITE.tipY - ROD_SPRITE.anchorY) * dh,
    (ROD_SPRITE.tipX - ROD_SPRITE.anchorX) * dw,
  );

  let angle = -0.52;
  const aimPoint = bob?.lineAttach || bob;
  if (aimPoint) {
    const aim = Math.atan2(aimPoint.y - handle.y, aimPoint.x - handle.x);
    angle = aim - naturalAngle;
  }

  const t = game.time;
  if (vs === STATES.IDLE) {
    angle += Math.sin(t * 0.026) * 0.035;
  } else if (vs === STATES.WAITING) {
    angle += Math.sin(t * 0.03) * 0.055;
  } else if (vs === STATES.CASTING) {
    if (fctx?.castPhase === 'windup') angle += (fctx.castSwing || 0) * 0.2;
    else angle -= Math.min(1, fctx?.castFlight || 0) * 0.1;
  } else if (vs === STATES.BITE) {
    angle += Math.sin(t * 0.42) * 0.09;
  } else if (vs === STATES.FIGHT) {
    const tension = game.lineTension / 100;
    angle += tension * 0.24 + (fctx?.fight?.holding ? 0.07 : 0);
    angle += Math.sin(t * 0.14) * tension * 0.04;
  }
  angle += ROD_SPRITE.clockwiseBias;
  return angle;
}

function updateRodAnim() {
  const w = canvas.width;
  const h = canvas.height;
  const dock = getDockInset();
  const handle = getRodHandlePos(w, h, dock);
  const vs = typeof FishingController !== 'undefined' ? getVisualState() : STATES.IDLE;
  const fctx = typeof FishingController !== 'undefined' ? FishingController.getContext() : null;
  const bob = getBobberWorldPos();
  const target = getRodTargetAngle(vs, fctx, handle, bob);
  const rate = vs === STATES.FIGHT ? 0.15
    : vs === STATES.CASTING ? 0.13
      : vs === STATES.BITE ? 0.12
        : 0.085;
  game.rodAngle += (target - game.rodAngle) * rate;
}

function getRodLayout() {
  const w = canvas.width;
  const h = canvas.height;
  const dock = getDockInset();
  const handle = getRodHandlePos(w, h, dock);
  const angle = game.rodAngle || -0.52;
  const dh = h * ROD_SPRITE.heightRatio;
  const aspect = rodImgReady ? rodImg.naturalWidth / rodImg.naturalHeight : 550 / 728;
  const dw = dh * aspect;
  const tipLocalX = dw * (ROD_SPRITE.tipX - ROD_SPRITE.anchorX);
  const tipLocalY = dh * (ROD_SPRITE.tipY - ROD_SPRITE.anchorY);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tip = {
    x: handle.x + tipLocalX * cos - tipLocalY * sin,
    y: handle.y + tipLocalX * sin + tipLocalY * cos,
  };

  return {
    base: handle,
    tip,
    angle,
    dw,
    dh,
    ready: rodImgReady,
  };
}

const defaultPlayer = () => ({
  name: 'Рыбак',
  level: 1,
  exp: 0,
  expMax: 500,
  energy: 150,
  energyMax: 150,
  silver: 100,
  gold: 10,
  luck: 5,
  tournamentWeight: 0,
  locationId: '0',
  gear: { rod: 'rod_0', hook: 'hook1', bait: 'bait1', net: null },
  owned: ['rod_0', 'hook1'],
  inventory: { bait1: 20, hook1: 5 },
  sadok: [],
});

let player = defaultPlayer();
let gameLoopRunning = false;
const SAVE_KEY = 'rybnoe-mesto-save';
let pendingCatch = null;

let game = {
  state: STATES.IDLE,
  time: 0,
  regionIndex: 0,
  bobber: { x: 0, y: 0, bob: 0 },
  castT: 0,
  haulProgress: 0,
  shoreNorm: { x: 0.38, y: 0.57 },
  castNorm: { x: 0.50, y: 0.56 },
  rodAngle: -0.52,
  currentFish: null,
  biteTimer: 0,
  biteWindow: 0,
  biteRing: 1,
  lineTension: 0,
  fishDir: 0,
  dirTimer: 0,
  ripples: [],
  waterGlints: [],
  particles: [],
  selectedLocation: null,
  shopTab: 'rods',
  backpackTab: 'tackle',
};

function getVisualState() {
  if (typeof FishingController === 'undefined') return game.state;
  const s = FishingController.getState();
  const F = FishingController.FSM;
  if (s === F.IDLE) return STATES.IDLE;
  if (s === F.CAST_FLIGHT) return STATES.CASTING;
  if (s === F.REEL_IN) return STATES.CASTING;
  if (s === F.WAITING) return STATES.WAITING;
  if (s === F.BITE) return STATES.BITE;
  if (s === F.FIGHT_FISH) return STATES.FIGHT;
  return STATES.IDLE;
}

function getDockInset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--dock-h');
  const dockH = parseFloat(raw) || 72;
  return Math.max(56, dockH);
}

function getSceneLayout() {
  const w = canvas.width;
  const h = canvas.height;
  const bob = getBobberWorldPos();
  const rod = getRodLayout();
  return {
    waterY: h * 0.48,
    bobberFixed: bob ? { ...bob } : null,
    castPoint: { x: w * game.castNorm.x, y: h * game.castNorm.y },
    shorePoint: { x: w * game.shoreNorm.x, y: h * game.shoreNorm.y },
    rodBase: rod.base,
    rodTip: game.rodTip || rod.tip,
  };
}

function getBobberCanvasLayout() {
  const bobber = document.getElementById('bobber');
  const canvasRect = canvas.getBoundingClientRect();
  if (!bobber || bobber.classList.contains('hidden') || canvasRect.width <= 0) return null;

  const clip = bobber.querySelector('.bobber-clip') || bobber;
  const r = clip.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;

  const sx = canvas.width / canvasRect.width;
  const sy = canvas.height / canvasRect.height;
  const centerX = (r.left + r.width / 2 - canvasRect.left) * sx;
  const topY = (r.top - canvasRect.top) * sy;
  const waterY = (r.bottom - canvasRect.top) * sy;

  return {
    x: centerX,
    y: waterY,
    lineAttach: { x: centerX, y: topY + 1 },
  };
}

function getBobberWorldPos() {
  const vs = getVisualState();
  if (vs === STATES.IDLE) return null;

  const dom = getBobberCanvasLayout();
  if (dom) return dom;

  const w = canvas.width;
  const h = canvas.height;
  const spot = typeof BobberUI !== 'undefined' ? BobberUI.WATER_SPOT : { x: 50, y: 56 };
  const fctx = typeof FishingController !== 'undefined' ? FishingController.getContext() : null;
  const pct = (typeof BobberUI !== 'undefined' && BobberUI.getDisplayPct)
    ? BobberUI.getDisplayPct()
    : (fctx?.bobberPct || spot);

  const x = w * (pct.x / 100);
  const y = h * (pct.y / 100);
  const bobberH = Math.max(36, h * 0.055);
  return {
    x,
    y,
    lineAttach: { x, y: y - bobberH },
  };
}

function updateRodTip() {
  game.rodTip = getRodLayout().tip;
}

function getViewportSize() {
  const vv = window.visualViewport;
  let width = Math.round(vv?.width ?? window.innerWidth);
  let height = Math.round(vv?.height ?? window.innerHeight);
  const mobile = document.documentElement.classList.contains('is-mobile');
  if (mobile && height > width) {
    [width, height] = [height, width];
  }
  return { width, height };
}

function resizeCanvas() {
  const { width, height } = getViewportSize();
  canvas.width = width;
  canvas.height = height;
  updateRodAnim();
  updateRodTip();
}

function syncViewportVars() {
  const { width, height } = getViewportSize();
  document.documentElement.style.setProperty('--app-h', `${height}px`);
  document.documentElement.style.setProperty('--app-w', `${width}px`);
  const dock = document.querySelector('.dock-bar');
  if (dock) {
    const dockH = Math.ceil(dock.getBoundingClientRect().height + 14);
    document.documentElement.style.setProperty('--dock-h', `${dockH}px`);
  }
  resizeCanvas();
}

function bindViewport() {
  const sync = () => syncViewportVars();
  window.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('scroll', sync);
  window.addEventListener('orientationchange', () => setTimeout(sync, 150));
  sync();
}

function bindMobileUi() {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const touch = coarse || narrow;
  if (touch) document.documentElement.classList.add('is-mobile');

  const updateOrientation = () => {
    const portrait = window.innerHeight > window.innerWidth;
    document.documentElement.classList.toggle('is-portrait', portrait);
    document.documentElement.classList.toggle('is-landscape', !portrait);
    syncViewportVars();
  };

  const tryLockLandscape = () => {
    if (!touch) return;
    const o = screen.orientation;
    if (!o?.lock) return;
    o.lock('landscape').catch(() => {});
  };

  updateOrientation();
  window.addEventListener('resize', updateOrientation);
  window.addEventListener('orientationchange', () => setTimeout(updateOrientation, 120));
  document.addEventListener('pointerdown', tryLockLandscape, { once: true, passive: true });
}

function bindCastControls() {
  const castBtn = document.getElementById('cast-btn');
  if (!castBtn) return;
  let castHeld = false;

  const onDown = (e) => {
    if (e.cancelable) e.preventDefault();
    if (castHeld) return;
    castHeld = true;
    if (e.pointerId != null && castBtn.setPointerCapture) {
      try { castBtn.setPointerCapture(e.pointerId); } catch (_) {}
    }
    FishingController.onCastDown();
  };

  const onUp = () => {
    if (!castHeld) return;
    castHeld = false;
    FishingController.onCastUp();
  };

  castBtn.addEventListener('pointerdown', onDown);
  castBtn.addEventListener('pointerup', onUp);
  castBtn.addEventListener('pointercancel', onUp);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);

  document.addEventListener('touchmove', (e) => {
    if (!castHeld) return;
    if (typeof FishingController !== 'undefined'
      && FishingController.getState() === FishingController.FSM.FIGHT_FISH) {
      e.preventDefault();
    }
  }, { passive: false });
}

let saveTimer = null;
let tutorialSeen = false;

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ player, tutorialSeen }));
    } catch (_) {}
  }, 400);
}

function loadPlayerData() {
  player = defaultPlayer();
  tutorialSeen = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data?.player) return;
    Object.assign(player, data.player);
    if (!player.sadok) {
      player.sadok = (player.catches || []).map((item) => ({
        uid: `${item.time || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...item,
        caughtAt: item.time || Date.now(),
      }));
    }
    delete player.catches;
    tutorialSeen = Boolean(data.tutorialSeen);
  } catch (_) {}
  normalizeBaitGear();
  normalizeRodGear();
}

function normalizeRodGear() {
  const rods = SHOP?.rods || [];
  const known = new Set(rods.map((r) => r.id));
  if (!player.owned.includes('rod_0')) player.owned.push('rod_0');
  if (!known.has(player.gear.rod) || !player.owned.includes(player.gear.rod)) {
    player.gear.rod = 'rod_0';
  }
}

function normalizeBaitGear() {
  const baits = SHOP?.bait || [];
  const known = new Set(baits.map((b) => b.id));
  if (!known.has(player.gear.bait)) player.gear.bait = 'bait1';
  if ((player.inventory[player.gear.bait] || 0) <= 0) {
    const fallback = baits.find((b) => (player.inventory[b.id] || 0) > 0);
    if (fallback) player.gear.bait = fallback.id;
  }
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2500);
}

function getMapLocations() {
  if (typeof MAP_LOCATIONS !== 'undefined') return MAP_LOCATIONS;
  return LOCATIONS.filter((l) => l.region === REGIONS[game.regionIndex] || (game.regionIndex === 0 && Number(l.id) < 9));
}

function getLocation() {
  const pool = typeof MAP_LOCATIONS !== 'undefined' ? MAP_LOCATIONS : LOCATIONS;
  return pool.find((l) => l.id === player.locationId) || pool[0] || LOCATIONS[0];
}

function expForLevel(lv) {
  return 300 + lv * 200;
}

function addExp(amount) {
  player.exp += amount;
  while (player.exp >= player.expMax) {
    player.exp -= player.expMax;
    player.level++;
    player.expMax = expForLevel(player.level);
    player.energyMax = 150 + player.level * 10;
    player.energy = player.energyMax;
    toast(`Уровень ${player.level}!`);
  }
  updateHUD();
}

function spendEnergy(n) {
  if (player.energy < n) {
    toast('Мало энергии!');
    return false;
  }
  player.energy -= n;
  updateHUD();
  return true;
}

function addSilver(n) { player.silver += n; updateHUD(); }

function shopItemIcon(item, tab) {
  if (item.iconKey) return GAME_ICONS.url(item.iconKey);
  if (tab === 'rods') return GAME_ICONS.url(GAME_ICONS.rodIconForItem(item));
  return GAME_ICONS.url(GAME_ICONS.resolve(item.id));
}

function shopPriceHtml(item) {
  if (item.price === 0) return 'Бесплатно';
  const icon = item.currency === 'gold' ? 'gold' : 'silver';
  return `<span class="price-tag"><img src="${GAME_ICONS.url(icon)}" alt="">${item.price}</span>`;
}

function findShopItem(id, tab) {
  return (SHOP[tab] || SHOP.rods || []).find((i) => i.id === id)
    || SHOP.hooks?.find((i) => i.id === id)
    || SHOP.bait?.find((i) => i.id === id);
}

function updateEquipmentHud() {
  const rod = findShopItem(player.gear.rod, 'rods') || { name: 'Удочка', level: 1, id: 'rod_0' };
  const hook = findShopItem(player.gear.hook, 'hooks') || { name: 'Крючок', id: 'hook1' };
  const bait = findShopItem(player.gear.bait, 'bait') || { name: 'Наживка', id: 'bait1' };

  applyRodSprite(player.gear.rod || 'rod_0');

  const setImg = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.src = GAME_ICONS.url(key);
  };

  setImg('dock-icon-rod', GAME_ICONS.rodIconForItem(rod));
  setImg('dock-icon-hook', hook.iconKey || GAME_ICONS.resolve(hook.id));
  setImg('dock-icon-bait', bait.iconKey || GAME_ICONS.resolve(bait.id));

  const rodSlot = document.querySelector('.dock-slot[title^="Удочка"]');
  if (rodSlot) rodSlot.title = `Удочка: ${rod.name}`;
}

function updateHUD() {
  document.getElementById('player-name').textContent = player.name;
  document.getElementById('player-level').textContent = player.level;
  document.getElementById('silver-top').textContent = player.silver;
  const goldTop = document.getElementById('gold-top');
  if (goldTop) goldTop.textContent = player.gold;
  document.getElementById('location-name').textContent = getLocation().name;
  document.getElementById('energy-text').textContent = `${player.energy} / ${player.energyMax}`;
  document.getElementById('energy-bar').style.width = `${(player.energy / player.energyMax) * 100}%`;
  const expBar = document.getElementById('exp-bar');
  const expText = document.getElementById('exp-text');
  if (expBar) expBar.style.width = `${(player.exp / player.expMax) * 100}%`;
  if (expText) expText.textContent = `${player.exp} / ${player.expMax}`;
  const silverBar = document.getElementById('silver-bar');
  if (silverBar) silverBar.style.width = `${Math.min(100, (player.silver / 500) * 100)}%`;
  document.getElementById('qty-bait').textContent = player.inventory[player.gear.bait] || 0;
  document.getElementById('qty-hook').textContent = player.inventory.hook1 || 5;
  const sadokQty = document.getElementById('qty-sadok');
  if (sadokQty) {
    const count = player.sadok?.length || 0;
    sadokQty.textContent = count;
    sadokQty.classList.toggle('hidden', count === 0);
  }
  document.getElementById('shop-silver').textContent = player.silver;
  document.getElementById('shop-gold').textContent = player.gold;
  updateEquipmentHud();
  updateDockLocks();
}


function isFishingActive() {
  return typeof FishingController !== 'undefined' && FishingController.isFishing();
}

function tryOpenShop(tab) {
  if (isFishingActive()) {
    toast('Сначала вытащи удочку');
    return;
  }
  if (tab) {
    game.shopTab = tab;
    document.querySelectorAll('#shop-tabs .tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
  }
  renderShop();
  openModal('modal-shop');
}

function updateDockLocks() {
  const locked = isFishingActive();
  document.querySelectorAll('[data-lock-while-fishing]').forEach((el) => {
    el.classList.toggle('dock-slot--disabled', locked);
    el.setAttribute('aria-disabled', locked ? 'true' : 'false');
  });
  const goldBtn = document.getElementById('btn-gold-plus');
  if (goldBtn) {
    goldBtn.classList.toggle('is-disabled', locked);
    goldBtn.disabled = locked;
  }
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function initFishingController() {
  if (typeof FishingController === 'undefined') return;
  FishingController.init({
    getLocation,
    getPlayer: () => player,
    spendEnergy(n) { return spendEnergy(n); },
    refundEnergy(n) {
      player.energy = Math.min(player.energyMax, player.energy + n);
      updateHUD();
    },
    consumeBait() {
      const bait = player.inventory[player.gear.bait] || 0;
      if (bait <= 0) {
        toast('Купи наживку в магазине!');
        return false;
      }
      player.inventory[player.gear.bait] = bait - 1;
      if ((player.inventory[player.gear.bait] || 0) <= 0) normalizeBaitGear();
      updateHUD();
      return true;
    },
    onHookResult(grade) {
      const labels = {
        perfect: 'Идеальная подсечка!',
        good: 'Хорошая подсечка',
        fail: 'Рыба уплыла...',
      };
      toast(labels[grade] || 'Промах!');
      if (grade === 'fail') {
        const l = getSceneLayout();
        spawnSplash(l.bobberFixed.x, l.bobberFixed.y, 6);
      } else {
        const l = getSceneLayout();
        spawnSplash(l.bobberFixed.x, l.bobberFixed.y, 10);
      }
    },
    onFightWin(fctx) {
      catchFishFromFsm(fctx);
    },
    onFightLose(reason) {
      toast(reason === 'break' ? 'Леска не выдержала!' : 'Рыба сорвалась!');
      const l = getSceneLayout();
      spawnSplash(l.bobberFixed.x, l.bobberFixed.y, 8);
      resetFishingVisuals();
    },
    onReelIn() {
      toast('Удочка вытащена');
      resetFishingVisuals();
    },
    onCastSplash() {
      const l = getSceneLayout();
      if (l.bobberFixed) spawnSplash(l.bobberFixed.x, l.bobberFixed.y, 10);
      addRipple(l.bobberFixed?.x || canvas.width * 0.5, l.bobberFixed?.y || canvas.height * 0.56);
      if (typeof AmbientAudio !== 'undefined') AmbientAudio.playSplash();
    },
    onBobberNibble() {
      const l = getSceneLayout();
      if (l.bobberFixed) addRipple(l.bobberFixed.x, l.bobberFixed.y);
    },
  });

  GameEvents.on(EV.STATE_ENTER, ({ state }) => {
    updateEquipmentHud();
  });

  GameEvents.on(EV.STATE_CHANGE, ({ to }) => {
    document.body.classList.toggle('fishing-active', to !== FishingController.FSM.IDLE);
    updateEquipmentHud();
    updateDockLocks();
  });
}

function resetFishingVisuals() {
  game.haulProgress = 0;
  game.lineTension = 0;
  game.currentFish = null;
  updateRodTip();
}

function spawnSplash(x, y, n = 8) {
  for (let i = 0; i < n; i++) {
    game.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: -1.5 - Math.random() * 2.5,
      life: 25 + Math.random() * 20,
      size: 1.5 + Math.random() * 2.5,
      color: 'rgba(200,230,255,0.9)',
    });
  }
  addRipple(x, y);
}

function renderFishIcon(fish, size = 'md') {
  if (typeof FishSprites !== 'undefined') return FishSprites.renderHtml(fish, size);
  return `<span class="fish-emoji-fallback">${fish?.emoji || '🐟'}</span>`;
}

function calcFishPricePerKg(fish, rarityId) {
  const rCfg = GAME_CONFIG.rarities[rarityId] || GAME_CONFIG.rarities.common;
  return Math.round((fish.price || 10) * 4 * rCfg.rewardMul);
}

function formatFishWeight(weightKg) {
  if (weightKg >= 1) return `вес: ${weightKg.toFixed(3)} кг.`;
  return `вес: ${Math.round(weightKg * 1000)} г.`;
}

function buildCatchPayload(fctx) {
  const fish = fctx.fish;
  const hookGrade = fctx.fight?.hookGrade || 'good';
  const rarityId = fctx.fight?.rarity || 'common';
  const rewards = EconomySystem.calcCatchReward(fish, hookGrade, rarityId);
  return { fish, hookGrade, rarityId, rewards, fctx };
}

function spawnCatchParticles() {
  for (let i = 0; i < 12; i++) {
    const l = getSceneLayout();
    if (!l.bobberFixed) break;
    game.particles.push({
      x: l.bobberFixed.x, y: l.bobberFixed.y,
      vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3,
      life: 40 + Math.random() * 30, size: 2 + Math.random() * 3, color: '#FFD700',
    });
  }
}

function showCatchModal(fctx) {
  const payload = buildCatchPayload(fctx);
  pendingCatch = payload;
  const { fish, rarityId, rewards } = payload;

  const fishImg = document.getElementById('catch-fish-img');
  const nameEl = document.getElementById('catch-name');
  const weightEl = document.getElementById('catch-weight');
  const priceKgEl = document.getElementById('catch-price-kg-val');
  const silverEl = document.getElementById('catch-total-silver');
  const expEl = document.getElementById('catch-exp');

  if (fishImg) fishImg.innerHTML = renderFishIcon(fish, 'lg');
  if (nameEl) nameEl.textContent = fish.name;
  if (weightEl) weightEl.textContent = formatFishWeight(fish.weight);
  if (priceKgEl) priceKgEl.textContent = String(calcFishPricePerKg(fish, rarityId));
  if (silverEl) silverEl.textContent = String(rewards.silver);
  if (expEl) expEl.textContent = String(rewards.exp);

  resetFishingVisuals();
  openModal('modal-catch');
}

function finalizeCatch(toSadok) {
  if (!pendingCatch) return;
  const { fish, hookGrade, rarityId, rewards, fctx } = pendingCatch;
  pendingCatch = null;
  closeModal('modal-catch');

  addExp(rewards.exp);
  player.tournamentWeight += fish.weight;

  if (toSadok) {
    if (!player.sadok) player.sadok = [];
    player.sadok.unshift({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...fish,
      rarity: rarityId,
      hookGrade,
      caughtAt: Date.now(),
    });
    toast('Рыба в садке!');
  } else {
    addSilver(rewards.silver);
    toast(`Продано: ${fish.name} (+${rewards.silver} серебра)`);
  }

  spawnCatchParticles();
  GameEvents.emit(EV.CATCH, { fish, rewards, ctx: fctx, sold: !toSadok });
  updateHUD();
  save();
}

function calcFishSellPrice(item) {
  return EconomySystem.calcCatchReward(item, item.hookGrade || 'good', item.rarity || 'common').silver;
}

function catchFishFromFsm(fctx) {
  showCatchModal(fctx);
}

function sellSadokItem(uid) {
  const idx = (player.sadok || []).findIndex((item) => item.uid === uid);
  if (idx < 0) return;
  const item = player.sadok[idx];
  const silver = calcFishSellPrice(item);
  player.sadok.splice(idx, 1);
  addSilver(silver);
  toast(`Продано: ${item.name} (+${silver} серебра)`);
  renderSadok();
  save();
}

function sellAllSadok() {
  if (!player.sadok?.length) return;
  let total = 0;
  for (const item of player.sadok) total += calcFishSellPrice(item);
  const count = player.sadok.length;
  player.sadok = [];
  addSilver(total);
  toast(`Продано ${count} шт. (+${total} серебра)`);
  renderSadok();
  save();
}

function renderSadok() {
  const list = document.getElementById('sadok-list');
  const totalEl = document.getElementById('sadok-total');
  const sellAllBtn = document.getElementById('sadok-sell-all');
  if (!list) return;

  const items = player.sadok || [];
  if (!items.length) {
    list.innerHTML = '<div class="sadok-empty">Садок пуст — поймайте рыбу!</div>';
    if (totalEl) totalEl.textContent = '';
    if (sellAllBtn) sellAllBtn.disabled = true;
    updateHUD();
    return;
  }

  let totalSilver = 0;
  list.innerHTML = items.map((item) => {
    const grams = Math.round(item.weight * 1000);
    const price = calcFishSellPrice(item);
    totalSilver += price;
    const rarity = GAME_CONFIG.rarities[item.rarity];
  return `<div class="sadok-item">
      <div class="sadok-item-icon">${renderFishIcon(item, 'sm')}</div>
      <div class="sadok-item-info">
        <div class="sadok-item-name">${item.name}</div>
        <div class="sadok-item-meta">${grams} г${rarity?.label ? ` · ${rarity.label}` : ''}</div>
      </div>
      <div class="sadok-item-price">
        <img src="${GAME_ICONS.url('silver')}" alt="">
        <span>${price}</span>
      </div>
      <button type="button" class="sadok-sell-btn" data-uid="${item.uid}">Продать</button>
    </div>`;
  }).join('');

  list.querySelectorAll('.sadok-sell-btn').forEach((btn) => {
    btn.onclick = () => sellSadokItem(btn.dataset.uid);
  });

  if (totalEl) totalEl.textContent = `Всего в садке: ${items.length} · ${totalSilver} серебра`;
  if (sellAllBtn) sellAllBtn.disabled = false;
  updateHUD();
}

function initWaterAmbient() {
  if (game.waterGlints.length) return;
  for (let i = 0; i < 12; i++) {
    game.waterGlints.push({
      x: 0.08 + Math.random() * 0.84,
      y: 0.46 + Math.random() * 0.14,
      phase: Math.random() * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.02,
      len: 0.04 + Math.random() * 0.1,
      drift: 0.0006 + Math.random() * 0.0012,
    });
  }
}

function addRipple(x, y) {
  game.ripples.push({ x, y, r: 3, life: 1 });
}

function drawWaterAmbient() {
  initWaterAmbient();
  const w = canvas.width;
  const h = canvas.height;
  const waterTop = h * 0.44;
  const t = game.time;

  ctx.save();

  const pulse = 0.5 + Math.sin(t * 0.024) * 0.5;
  const waterGrad = ctx.createLinearGradient(0, waterTop - 8, 0, h);
  waterGrad.addColorStop(0, `rgba(140, 220, 255, ${0.05 + pulse * 0.025})`);
  waterGrad.addColorStop(0.25, `rgba(90, 180, 230, ${0.035 + pulse * 0.015})`);
  waterGrad.addColorStop(1, 'rgba(40, 120, 180, 0.02)');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterTop - 6, w, h - waterTop + 6);

  for (let i = 0; i < 5; i++) {
    const yBase = waterTop + 10 + i * 26 + Math.sin(t * 0.02 + i * 1.15) * 7;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 7) {
      const waveA = Math.sin(x * 0.0075 + t * 0.034 + i * 1.6) * (3.2 + i * 0.85);
      const waveB = Math.sin(x * 0.017 + t * 0.052 + i * 0.45) * (1.4 + i * 0.25);
      const y = yBase + waveA + waveB;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const waveAlpha = 0.028 + i * 0.012 + Math.sin(t * 0.028 + i * 0.9) * 0.01;
    ctx.strokeStyle = `rgba(255,255,255,${waveAlpha})`;
    ctx.lineWidth = i === 0 ? 1.5 : 1;
    ctx.stroke();
  }

  for (let i = 0; i < 4; i++) {
    const cx = w * (0.18 + i * 0.2 + Math.sin(t * 0.016 + i * 1.4) * 0.035);
    const cy = waterTop + 32 + i * 38 + Math.cos(t * 0.02 + i * 2.1) * 10;
    const rx = 24 + Math.sin(t * 0.035 + i) * 8;
    ctx.strokeStyle = `rgba(190, 235, 255, ${0.035 + Math.sin(t * 0.045 + i) * 0.018})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, rx * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const g of game.waterGlints) {
    const gx = ((g.x + t * g.drift) % 1) * w;
    const gy = g.y * h + Math.sin(t * g.speed * 2.2 + g.phase) * 8;
    const glen = g.len * w;
    const alpha = 0.06 + Math.sin(t * 0.05 + g.phase) * 0.035;
    const grad = ctx.createLinearGradient(gx - glen / 2, gy, gx + glen / 2, gy);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.45, `rgba(220,245,255,${alpha})`);
    grad.addColorStop(0.55, `rgba(255,255,255,${alpha * 1.15})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(gx - glen / 2, gy - 1.2, glen, 2.4);
  }

  ctx.restore();
}

function update() {
  game.time++;

  if (game.time % 300 === 0 && player.energy < player.energyMax) {
    player.energy = Math.min(player.energyMax, player.energy + 1);
    updateHUD();
  }

  if (typeof FishingController !== 'undefined') {
    FishingController.update(1);
    if (typeof BobberUI !== 'undefined') BobberUI.tick();
    if (typeof RodLineUI !== 'undefined') RodLineUI.update(game);
    const fctx = FishingController.getContext();
    const vs = getVisualState();
    if (fctx?.fight) {
      game.lineTension = fctx.fight.lineStress ?? fctx.fight.tension ?? game.lineTension;
      game.haulProgress = fctx.fight.haul ?? game.haulProgress;
    }
    if (vs === STATES.FIGHT) game.currentFish = null;
    else if (fctx?.fish) game.currentFish = fctx.fish;
    if (vs === STATES.WAITING && game.time % 140 === 0) {
      const l = getSceneLayout();
      addRipple(l.bobberFixed.x, l.bobberFixed.y);
    }
    updateRodAnim();
    updateRodTip();
    updateDockLocks();
  } else {
    updateRodAnim();
    updateRodTip();
  }

  game.particles = game.particles.filter((p) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
    return p.life > 0;
  });
  game.ripples = game.ripples.filter((r) => {
    r.r += 0.55;
    r.life -= 0.022;
    return r.life > 0;
  });

  if (game.time % 160 === 0) {
    const w = canvas.width;
    const h = canvas.height;
    addRipple(
      w * (0.25 + Math.random() * 0.5),
      h * (0.5 + Math.random() * 0.06),
    );
  }
}

function drawBackground() {
  if (bgReady) {
    const iw = bgImage.width;
    const ih = bgImage.height;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    ctx.drawImage(bgImage, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#87CEEB');
    g.addColorStop(0.5, '#4A90A4');
    g.addColorStop(1, '#2E6B4F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawRod() {
  const rod = getRodLayout();
  if (rod.ready) {
    ctx.save();
    ctx.translate(rod.base.x, rod.base.y);
    ctx.rotate(rod.angle);
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.drawImage(
      rodImg,
      -rod.dw * ROD_SPRITE.anchorX,
      -rod.dh * ROD_SPRITE.anchorY,
      rod.dw,
      rod.dh,
    );
    ctx.restore();
    return;
  }

  if (typeof RodLineUI !== 'undefined') {
    RodLineUI.drawRod(ctx, rod.base, rod.tip);
  }
}

function drawFishingLine(tip, bob, opts = {}) {
  if (typeof RodLineUI !== 'undefined') {
    RodLineUI.drawLine(ctx, tip, bob, opts, game.time);
    return;
  }
  const { fighting = false, waiting = false, bite = false, tension = 0 } = opts;
  const dx = bob.x - tip.x;
  const dy = bob.y - tip.y;
  const dist = Math.hypot(dx, dy) || 1;
  const tensionT = fighting ? tension : 0;
  const tight = fighting && tensionT > 0.35;
  const slack = waiting || bite
    ? 1
    : fighting
      ? Math.max(0.12, 1 - tensionT * 0.92)
      : 0.85;
  const sagRatio = waiting ? 0.28 : bite ? 0.18 : fighting ? 0.06 + (1 - tensionT) * 0.1 : 0.22;
  const sagMin = waiting ? 22 : bite ? 14 : tight ? 6 : 10;
  const sag = tight ? sagMin * 0.35 : Math.min(dist * sagRatio * slack + sagMin, dist * 0.42);

  const c1x = tip.x + dx * 0.28;
  const c1y = tip.y + dy * 0.2 + sag * 0.45;
  const c2x = tip.x + dx * 0.72;
  const c2y = tip.y + dy * 0.78 + sag;

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.bezierCurveTo(c1x, c1y, c2x, c2y, bob.x, bob.y);
  ctx.stroke();
}

function drawLineAndBobber() {
  const bob = getBobberWorldPos();
  if (!bob?.lineAttach) return;

  const vs = getVisualState();
  const attach = bob.lineAttach;
  const bx = bob.x;
  const by = bob.y;
  const tip = getRodLayout().tip;
  const bite = vs === STATES.BITE;
  const fighting = vs === STATES.FIGHT;
  const fctx = typeof FishingController !== 'undefined' ? FishingController.getContext() : null;
  const castFlying = vs === STATES.CASTING && fctx?.castPhase === 'flight';
  const reelIn = typeof FishingController !== 'undefined'
    && FishingController.getState() === FishingController.FSM.REEL_IN;
  const waiting = vs === STATES.WAITING || (vs === STATES.CASTING && !castFlying);
  const tension = game.lineTension / 100;

  ctx.save();
  drawFishingLine(tip, attach, { fighting, waiting, bite, tension, reelIn });

  if (waiting || bite || fighting) {
    ctx.strokeStyle = bite ? 'rgba(255,80,60,0.75)' : fighting ? 'rgba(120,210,255,0.42)' : 'rgba(100,200,255,0.32)';
    ctx.lineWidth = bite ? 2.2 : fighting ? 1.4 : 1;
    const rr = bite ? 20 + Math.sin(game.time * 0.55) * 10 : fighting ? 9 + Math.sin(game.time * 0.2) * 3 : 8 + Math.sin(game.time * 0.04) * 2;
    ctx.beginPath();
    ctx.ellipse(bx, by + 2, rr, rr * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (waiting && !bite) {
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + Math.sin(game.time * 0.05) * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(bx, by + 2, rr * 1.4, rr * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawRipples() {
  for (const r of game.ripples) {
    const a = r.life * 0.48;
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.r, r.r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (r.life > 0.45) {
      ctx.strokeStyle = `rgba(200,230,255,${r.life * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r * 1.3, r.r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (r.life > 0.7) {
      ctx.strokeStyle = `rgba(255,255,255,${r.life * 0.12})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r * 0.55, r.r * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawParticles() {
  for (const p of game.particles) {
    ctx.globalAlpha = p.life / 60;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawWaterAmbient();
  drawRipples();
  drawRod();
  drawLineAndBobber();
  drawParticles();
}

function gameLoop() {
  update();
  drawScene();
  requestAnimationFrame(gameLoop);
}

/* === Магазин / карта (сокращённо) === */
function openMap() {
  renderMap();
  openModal('modal-map');
}

function renderMap() {
  const map = typeof WORLD_MAP !== 'undefined' ? WORLD_MAP : { title: REGIONS[game.regionIndex], image: 'assets/locations/lake.png' };
  document.getElementById('map-region').textContent = map.title;
  const area = document.getElementById('map-area');
  area.style.backgroundImage = `url('${map.image}')`;
  area.style.backgroundSize = 'cover';
  area.style.backgroundPosition = 'center';
  area.innerHTML = '';
  document.querySelectorAll('.map-arrow').forEach((el) => {
    el.style.visibility = typeof WORLD_MAP !== 'undefined' ? 'hidden' : 'visible';
  });
  getMapLocations().forEach((loc) => {
    const locked = Boolean(loc.comingSoon);
    const m = document.createElement('button');
    m.type = 'button';
    m.className = 'map-marker' + (locked ? ' locked' : '') + (player.locationId === loc.id ? ' map-marker--active' : '');
    m.style.left = `${loc.x}%`;
    m.style.top = `${loc.y}%`;
    m.innerHTML = `
      <span class="marker-pin" aria-hidden="true"></span>
      <span class="marker-label">${loc.name}</span>
    `;
    if (!locked) {
      m.onclick = () => { game.selectedLocation = loc; showLocationPreview(loc); };
    }
    area.appendChild(m);
  });
}

function showLocationPreview(loc) {
  document.getElementById('loc-preview-name').textContent = loc.name;
  const desc = document.getElementById('loc-preview-desc');
  if (desc) desc.textContent = loc.description || '';
  const prev = document.getElementById('loc-preview-img');
  const bg = loc.sceneBg || loc.bg || 'assets/locations/lake.png';
  prev.style.backgroundImage = `url('${bg}')`;
  prev.style.backgroundSize = 'cover';
  document.getElementById('loc-fish-icons').innerHTML = (loc.fishIds || [])
    .map((id) => {
      const f = FISH[id];
      return f ? renderFishIcon(f, 'sm') : '';
    }).join('');
  openModal('modal-location');
}

function renderShop() {
  const items = SHOP[game.shopTab] || [];
  const box = document.getElementById('shop-items');
  const isBait = game.shopTab === 'bait';
  const isRod = game.shopTab === 'rods';
  box.innerHTML = items.map((item) => {
    const owned = player.owned.includes(item.id);
    const locked = isBait ? false : player.level < item.level;
    const afford = item.currency === 'gold' ? player.gold >= item.price : player.silver >= item.price;
    const price = shopPriceHtml(item);
    const iconSrc = shopItemIcon(item, game.shopTab);
    const stock = player.inventory[item.id] || 0;
    const pack = item.qty || 10;
    const equipped = isBait
      ? player.gear.bait === item.id
      : isRod && player.gear.rod === item.id;
    const hint = isBait && typeof BAIT_HINTS !== 'undefined' ? BAIT_HINTS[item.id] : '';
    const lockNote = locked ? `<div class="item-lock">нужен ур. ${item.level}</div>` : '';
    const poorNote = !locked && !afford ? '<div class="item-lock">не хватает монет</div>' : '';
    let action = '';
    if (isBait) {
      const selectBtn = stock > 0
        ? `<button type="button" class="select-btn ${equipped ? 'active' : ''}" data-select="${item.id}">${equipped ? '✓ На крючке' : 'Выбрать'}</button>`
        : '';
      action = `<div class="item-stock">У вас: ${stock} шт.</div>
        ${hint ? `<div class="item-hint">Ловит: ${hint}</div>` : ''}
        ${poorNote}
        ${selectBtn}
        <button class="buy-btn" data-id="${item.id}" ${!afford ? 'disabled' : ''}>Купить ×${pack} — ${price}</button>`;
    } else if (owned) {
      if (isRod) {
        action = `<button type="button" class="select-btn ${equipped ? 'active' : ''}" data-select-rod="${item.id}">${equipped ? '✓ Выбрана' : 'Выбрать'}</button>`;
      } else {
        action = '<div class="owned-label">✓ Есть</div>';
      }
    } else {
      action = `${lockNote}${poorNote}<button class="buy-btn" data-id="${item.id}" ${locked || !afford ? 'disabled' : ''}>${price}</button>`;
    }
    return `<div class="shop-item ${owned && !isBait && !isRod ? 'owned' : ''} ${equipped && (isBait || isRod) ? 'equipped' : ''} ${locked ? 'locked' : ''}">
      <div class="item-icon"><img src="${iconSrc}" alt=""></div>
      <div class="item-name">${item.name}</div>
      <div class="item-level">уровень: ${item.level}</div>
      ${action}
    </div>`;
  }).join('');
  box.querySelectorAll('.buy-btn').forEach((btn) => {
    btn.onclick = () => buyItem(items.find((i) => i.id === btn.dataset.id));
  });
  box.querySelectorAll('.select-btn').forEach((btn) => {
    btn.onclick = () => equipBait(btn.dataset.select);
  });
  box.querySelectorAll('[data-select-rod]').forEach((btn) => {
    btn.onclick = () => equipRod(btn.dataset.selectRod);
  });
}

function openGearPicker(kind) {
  if (isFishingActive()) {
    toast('Сначала вытащи удочку');
    return;
  }
  game.gearPickerKind = kind;
  renderGearPicker(kind);
  openModal('modal-gear-picker');
}

function renderGearPicker(kind) {
  const title = document.getElementById('gear-picker-title');
  const list = document.getElementById('gear-picker-list');
  const shopBtn = document.getElementById('gear-picker-shop');
  if (!list) return;

  if (kind === 'rods') {
    if (title) title.textContent = 'Удочки';
    if (shopBtn) shopBtn.dataset.tab = 'rods';
    const items = (SHOP.rods || []).filter((r) => player.owned.includes(r.id));
    list.innerHTML = items.length
      ? items.map((rod) => {
        const active = player.gear.rod === rod.id;
        const icon = GAME_ICONS.url(GAME_ICONS.rodIconForItem(rod));
        return `<button type="button" class="gear-picker-row${active ? ' gear-picker-row--active' : ''}" data-rod-id="${rod.id}">
          <img src="${icon}" alt="">
          <span>${rod.name}</span>
          ${active ? '<em>✓</em>' : ''}
        </button>`;
      }).join('')
      : '<div class="gear-picker-empty">Нет удочек</div>';
    list.querySelectorAll('[data-rod-id]').forEach((btn) => {
      btn.onclick = () => {
        equipRod(btn.dataset.rodId);
        closeModal('modal-gear-picker');
      };
    });
    return;
  }

  if (title) title.textContent = 'Наживка';
  if (shopBtn) shopBtn.dataset.tab = 'bait';
  const items = (SHOP.bait || []).filter((b) => (player.inventory[b.id] || 0) > 0);
  list.innerHTML = items.length
    ? items.map((bait) => {
      const active = player.gear.bait === bait.id;
      const stock = player.inventory[bait.id] || 0;
      const icon = GAME_ICONS.url(bait.iconKey || GAME_ICONS.resolve(bait.id));
      return `<button type="button" class="gear-picker-row${active ? ' gear-picker-row--active' : ''}" data-bait-id="${bait.id}">
        <img src="${icon}" alt="">
        <span>${bait.name}</span>
        <em>${active ? '✓' : `×${stock}`}</em>
      </button>`;
    }).join('')
    : '<div class="gear-picker-empty">Нет наживки — загляни в магазин</div>';
  list.querySelectorAll('[data-bait-id]').forEach((btn) => {
    btn.onclick = () => {
      equipBait(btn.dataset.baitId);
      closeModal('modal-gear-picker');
    };
  });
}

function equipRod(rodId) {
  if (!player.owned.includes(rodId)) return;
  const rod = findShopItem(rodId, 'rods');
  if (!rod) return;
  player.gear.rod = rodId;
  updateHUD();
  renderShop();
  save();
  toast(`Удочка: ${rod.name}`);
}

function equipBait(baitId) {
  const bait = findShopItem(baitId, 'bait');
  if (!bait) return;
  const stock = player.inventory[baitId] || 0;
  if (stock <= 0) {
    toast('Сначала купите наживку');
    return;
  }
  player.gear.bait = baitId;
  updateHUD();
  renderShop();
  save();
  toast(`Наживка: ${bait.name}`);
}

function buyItem(item) {
  if (!item) return;
  const isBait = game.shopTab === 'bait';
  if (!isBait && player.level < item.level) {
    toast(`Нужен ${item.level} уровень`);
    return;
  }
  if (item.currency === 'gold') {
    if (player.gold < item.price) { toast('Не хватает золота'); return; }
    player.gold -= item.price;
  } else {
    if (player.silver < item.price) { toast('Не хватает серебра'); return; }
    player.silver -= item.price;
  }
  if (game.shopTab === 'bait') {
    const qty = item.qty || 10;
    player.inventory[item.id] = (player.inventory[item.id] || 0) + qty;
    if (!player.gear.bait || (player.inventory[player.gear.bait] || 0) <= 0) {
      player.gear.bait = item.id;
    }
    toast(`Куплено: ${item.name} ×${qty}`);
  } else if (game.shopTab === 'rods') {
    if (!player.owned.includes(item.id)) player.owned.push(item.id);
    player.gear.rod = item.id;
    toast(`Куплено: ${item.name}`);
  } else if (!player.owned.includes(item.id)) {
    player.owned.push(item.id);
    toast(`Куплено: ${item.name}`);
  }
  updateHUD();
  renderShop();
  save();
}

function renderBackpack() {
  const rows = [];
  const add = (iconKey, name, qty, baitId) => {
    if (!qty) return;
    const equipped = baitId && player.gear.bait === baitId;
    const cls = baitId ? 'bp-row bp-row--bait' : 'bp-row';
    const tag = equipped ? ' <em class="bp-equipped">на крючке</em>' : '';
    const data = baitId ? ` data-bait-id="${baitId}"` : '';
    rows.push(`<div class="${cls}"${data}><img src="${GAME_ICONS.url(iconKey)}" alt=""><span>${name}${tag}</span><b>×${qty}</b></div>`);
  };
  (SHOP.bait || []).forEach((b) => add(b.iconKey || b.id, b.name, player.inventory[b.id], b.id));
  add('hook', 'Крючки', player.inventory.hook1);
  const rod = findShopItem(player.gear.rod, 'rods');
  if (rod) rows.push(`<div class="bp-row"><img src="${GAME_ICONS.url(GAME_ICONS.rodIconForItem(rod))}" alt=""><span>${rod.name}</span><b>✓</b></div>`);
  const box = document.getElementById('backpack-content');
  box.innerHTML = rows.length
    ? rows.join('')
    : '<div class="backpack-empty">Пусто — загляни в магазин</div>';
  box.querySelectorAll('.bp-row--bait').forEach((row) => {
    row.onclick = () => equipBait(row.dataset.baitId);
  });
}

function startGame() {
  loadPlayerData();
  applyLocationScene(getLocation());
  const hud = document.getElementById('hud');
  if (hud) hud.classList.remove('is-hidden');
  if (typeof GAME_ICONS !== 'undefined') GAME_ICONS.applyHudAll();
  updateHUD();
  syncViewportVars();
  updateRodTip();
  if (!tutorialSeen) openModal('modal-tutorial');
}

const LOADING_MIN_MS = 3500;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  });
}

async function runLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  document.body.classList.add('is-loading');
  const started = Date.now();

  const assets = [
    'assets/icon.png',
    'assets/locations/lake.png',
    'assets/locations/world-map.png?v=1',
    'assets/locations/kamyshi.png',
    'assets/locations/na-kamnyakh.png',
    'assets/ui/hud/bobber.png?v=10',
    'assets/ui/hud/cast-default.png?v=8',
    'assets/ui/hud/cast-wait.png?v=8',
    'assets/ui/hud/cast-pull.png?v=8',
    'assets/ui/hud/reel-bar-bg.png?v=5',
    'assets/rod/rod.png?v=1',
    'assets/rod/spark-2000.png?v=2',
    'assets/ui/icons/rod-spark.png?v=2',
  ];

  await Promise.all(assets.map(preloadImage));

  const waitLeft = LOADING_MIN_MS - (Date.now() - started);
  if (waitLeft > 0) await new Promise((r) => setTimeout(r, waitLeft));

  screen.classList.add('loading-screen--hide');
  document.body.classList.remove('is-loading');
  await new Promise((r) => setTimeout(r, 520));
  screen.remove();
}

async function init() {
  if (typeof AmbientAudio !== 'undefined') {
    AmbientAudio.init();
    AmbientAudio.bindUnlock();
  }

  await runLoadingScreen();
  bindViewport();
  bindMobileUi();
  initFishingController();
  startGame();

  document.getElementById('tutorial-start').onclick = () => {
    closeModal('modal-tutorial');
    tutorialSeen = true;
    save();
  };

  bindCastControls();

  if (typeof AmbientAudio !== 'undefined') {
    const castBtn = document.getElementById('cast-btn');
    castBtn?.addEventListener('pointerdown', () => AmbientAudio.start(), { once: true, passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      FishingController.onCastDown();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      FishingController.onCastUp();
    }
  });

  document.getElementById('btn-map').onclick = () => openMap();
  const locationBanner = document.getElementById('btn-location-banner');
  if (locationBanner) locationBanner.onclick = () => openMap();
  const btnShop = document.getElementById('btn-shop-quick');
  if (btnShop) btnShop.onclick = () => tryOpenShop();
  const baitSlot = document.querySelector('.dock-slot[title="Наживка"]');
  if (baitSlot) baitSlot.onclick = () => openGearPicker('bait');
  const rodSlot = document.querySelector('.dock-slot[title^="Удочка"]');
  if (rodSlot) {
    rodSlot.onclick = () => openGearPicker('rods');
    rodSlot.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGearPicker('rods');
      }
    };
  }
  const gearPickerShop = document.getElementById('gear-picker-shop');
  if (gearPickerShop) {
    gearPickerShop.onclick = () => {
      const tab = gearPickerShop.dataset.tab || 'rods';
      closeModal('modal-gear-picker');
      tryOpenShop(tab);
    };
  }
  const sadokBtn = document.getElementById('btn-sadok');
  if (sadokBtn) {
    const openSadok = () => { renderSadok(); openModal('modal-sadok'); };
    sadokBtn.onclick = openSadok;
    sadokBtn.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSadok();
      }
    };
  }
  document.getElementById('sadok-sell-all')?.addEventListener('click', sellAllSadok);
  document.getElementById('catch-to-sadok')?.addEventListener('click', () => finalizeCatch(true));
  document.getElementById('catch-sell')?.addEventListener('click', () => finalizeCatch(false));
  document.getElementById('catch-close')?.addEventListener('click', () => finalizeCatch(true));
  const btnGold = document.getElementById('btn-gold-plus');
  if (btnGold) btnGold.onclick = () => tryOpenShop();
  const btnWeather = document.getElementById('btn-weather');
  if (btnWeather) btnWeather.onclick = () => {
    const loc = getLocation();
    toast(loc.description || loc.name);
  };
  document.getElementById('btn-enter-location').onclick = () => {
    if (game.selectedLocation && !game.selectedLocation.comingSoon) {
      player.locationId = game.selectedLocation.id;
      applyLocationScene(game.selectedLocation);
      updateHUD();
      closeModal('modal-location');
      closeModal('modal-map');
      save();
    }
  };

  document.querySelectorAll('.modal-close').forEach((b) => {
    b.onclick = () => closeModal(b.dataset.close);
  });
  document.querySelectorAll('#shop-tabs .tab').forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll('#shop-tabs .tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      game.shopTab = tab.dataset.tab;
      renderShop();
    };
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.onclick = (e) => { if (e.target === m) closeModal(m.id); };
  });

  if (!gameLoopRunning) { gameLoopRunning = true; gameLoop(); }
}

init().catch((err) => console.error(err));
