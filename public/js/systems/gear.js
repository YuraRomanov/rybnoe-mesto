/** Модификаторы снастей игрока */
const GearSystem = (() => {
  function getRodItem(player) {
    return SHOP?.rods?.find((r) => r.id === (player.gear?.rod || 'rod_0'));
  }

  function rodTier(player) {
    const rod = getRodItem(player);
    if (rod?.rodTier) return rod.rodTier;
    const lvl = rod?.level || 1;
    return Math.min(5, Math.max(1, Math.ceil(lvl / 2)));
  }

  function getModifiers(player) {
    const rod = getRodItem(player);
    const tier = rodTier(player);
    const tierStats = GAME_CONFIG.rodTiers[tier] || GAME_CONFIG.rodTiers[1];
    const hook = SHOP?.hooks?.find((h) => h.id === player.gear?.hook);
    const bait = SHOP?.bait?.find((b) => b.id === player.gear?.bait);
    const luck = (player.luck || 0) + (player.level || 1) * 0.5;
    const tensionControl = rod?.tensionControl ?? tierStats.tensionControl;
    const stability = rod?.stability ?? tierStats.stability;
    return {
      tier,
      biteBonus: tierStats.biteBonus + (rod?.bonus || 0) + (bait?.bonus || 0) + (hook?.bonus || 0) * 0.5,
      rareBonus: tierStats.rareBonus + (hook?.bonus || 0),
      tensionControl,
      stability,
      largeFishHelp: rod?.largeFishHelp || 0,
      luck,
    };
  }

  return { rodTier, getModifiers, getRodItem };
})();
