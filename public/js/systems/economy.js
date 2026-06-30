/** Награды и экономика */
const EconomySystem = (() => {
  function calcCatchReward(fish, hookGrade, rarityId) {
    const e = GAME_CONFIG.economy;
    const rCfg = GAME_CONFIG.rarities[rarityId] || GAME_CONFIG.rarities.common;
    const grade = GAME_CONFIG.hookGrades[hookGrade] || GAME_CONFIG.hookGrades.good;
    const priceKg = (fish.price || 10) * 4 * rCfg.rewardMul;
    const silver = Math.max(1, Math.round(fish.weight * priceKg * grade.catchBonus));
    const exp = Math.max(1, Math.floor(e.expBase * fish.weight * 10 * grade.catchBonus * (hookGrade === 'perfect' ? e.perfectHookExpBonus : 1)));
    return { silver, exp, rarityId, label: rCfg.label };
  }

  function upgradeCost(base, level) {
    return Math.round(base * Math.pow(GAME_CONFIG.economy.upgradeCostCurve, level - 1));
  }

  return { calcCatchReward, upgradeCost };
})();
