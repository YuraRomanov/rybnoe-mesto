/** RNG Pipeline — детерминированные расчёты шансов */
const GameRNG = (() => {
  let seed = Date.now() % 2147483647;

  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function range(min, max) {
    return min + random() * (max - min);
  }

  function rangeInt(min, max) {
    return Math.floor(range(min, max + 1));
  }

  function pickWeighted(table) {
    const total = table.reduce((s, e) => s + e.weight, 0);
    let roll = random() * total;
    for (const entry of table) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return table[table.length - 1];
  }

  function rollRarity(baseRarity, bonuses = {}) {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    let idx = order.indexOf(baseRarity);
    if (idx < 0) idx = 0;
    const boost = (bonuses.rareBonus || 0) + (bonuses.hookRarityBonus || 0) + (bonuses.luck || 0) * 0.02;
    if (random() < boost) idx = Math.min(order.length - 1, idx + 1);
    if (random() < boost * 0.35) idx = Math.min(order.length - 1, idx + 1);
    return order[idx];
  }

  function biteWaitSec(modifiers) {
    const t = GAME_CONFIG.timing;
    let min = t.biteWaitMinSec;
    let max = t.biteWaitMaxSec;
    const biteBonus = modifiers.biteBonus || 0;
    max -= biteBonus * 8;
    min -= biteBonus * 2;
    return range(Math.max(2, min), Math.max(min + 1, max));
  }

  function buildFishTable(location, baitId, baitBonus, locFish) {
    const pool = locFish || FISH;
    return (location.fishIds || []).map((id, i) => {
      const fish = pool[id] || pool[String(id)];
      if (!fish) return null;
      const ver = (location.fishVer || [])[i] ?? 1;
      const cat = fish.category || 1;
      const rarity = GAME_CONFIG.rarityByCategory[cat] || 'common';
      const baitMul = typeof baitFishMultiplier === 'function'
        ? baitFishMultiplier(baitId, fish.id)
        : 1;
      return {
        id: String(id),
        fish,
        weight: ver * (1 + (baitBonus || 0)) * baitMul,
        rarity,
      };
    }).filter(Boolean);
  }

  return {
    random, range, rangeInt, pickWeighted, rollRarity, biteWaitSec, buildFishTable,
    setSeed(s) { seed = s; },
  };
})();
