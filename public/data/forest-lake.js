/** Локация «Лесное Озеро» — только рыбы из Прочее/Рыба */
const FOREST_LAKE = {
  id: '0',
  name: 'Левый берег',
  description: 'Тихий берег у соснового леса. Плотва, лещ, линь, щука и другая местная рыба.',
  fishIds: [
    'plotva', 'karas', 'gold_karas', 'okun', 'ersh', 'vyun',
    'lesh', 'peskari', 'lin', 'rotan', 'shchuka',
  ],
  fishVer: [2.5, 2.4, 0.4, 1.8, 1.2, 0.7, 1.6, 2.0, 0.9, 0.6, 0.35],
};

const FISH_SPRITE_MAP = Object.fromEntries(
  Object.values(GAME_FISH).map((fish) => [fish.id, fish.sprite]),
);

const FishSprites = (() => {
  const BASE = 'assets/fish';

  function url(spriteKey) {
    if (!spriteKey) return null;
    return `${BASE}/${spriteKey}.png`;
  }

  function forFish(fishOrId) {
    const fish = typeof fishOrId === 'object' ? fishOrId : null;
    const id = fish ? fish.id : fishOrId;
    const key = fish?.sprite || FISH_SPRITE_MAP[id];
    return key ? url(key) : null;
  }

  function img(fishOrId, className = 'fish-sprite', alt = '') {
    const src = forFish(fishOrId);
    if (!src) return null;
    const fish = typeof fishOrId === 'object' ? fishOrId : null;
    const name = alt || fish?.name || '';
    return `<img class="${className}" src="${src}" alt="${name}" loading="lazy" draggable="false">`;
  }

  function renderHtml(fishOrId, size = 'md') {
    const fish = typeof fishOrId === 'object' ? fishOrId : FISH?.[fishOrId];
    if (!fish) return '<span class="fish-emoji-fallback">🐟</span>';
    const src = forFish(fish);
    const cls = `fish-sprite fish-sprite--${size}`;
    if (src) {
      return `<img class="${cls}" src="${src}" alt="${fish.name}" title="${fish.name}" loading="lazy" draggable="false">`;
    }
    return `<span class="${cls} fish-emoji-fallback" title="${fish.name}">${fish.emoji || '🐟'}</span>`;
  }

  return { url, forFish, img, renderHtml, map: FISH_SPRITE_MAP };
})();
