/** Локация «Лесное Озеро» — только рыбы из Прочее/Рыба */
const FOREST_LAKE = {
  id: '0',
  name: 'Лесное Озеро',
  description: 'Тихое озеро среди соснового леса. Плотва, карась, окунь и другая местная рыба.',
  fishIds: ['plotva', 'karas', 'gold_karas', 'okun', 'ersh', 'vyun'],
  fishVer: [2.8, 2.6, 0.45, 2.2, 1.4, 0.85],
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
