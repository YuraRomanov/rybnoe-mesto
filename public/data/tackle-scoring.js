/**
 * Итоговый вес рыбы в таблице улова.
 * Наживка — главный фактор; крючок и леска слегка подстраивают.
 */
function tackleCatchMultiplier(baitId, hookId, lineId, fishId) {
  const bait = typeof baitFishMultiplier === 'function' ? baitFishMultiplier(baitId, fishId) : 1;
  const hook = typeof hookFishMultiplier === 'function' ? hookFishMultiplier(hookId, fishId) : 1;
  const line = typeof lineFishMultiplier === 'function' ? lineFishMultiplier(lineId, fishId) : 1;

  const baitPow = 1.55;
  const hookPow = 0.45;
  const linePow = 0.35;

  return Math.pow(Math.max(0.02, bait), baitPow)
    * Math.pow(Math.max(0.5, hook), hookPow)
    * Math.pow(Math.max(0.5, line), linePow);
}
