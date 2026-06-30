/** Модификаторы снастей игрока */
const GearSystem = (() => {
  function rodTier(player) {
    const id = player.gear?.rod || 'rod_0';
    const rod = SHOP?.rods?.find((r) => r.id === id);
    if (!rod) return 1;
    const lvl = rod.level || 1;
    return Math.min(5, Math.max(1, Math.ceil(lvl / 2)));
  }

  function getModifiers(player) {
    const tier = rodTier(player);
    const rodStats = GAME_CONFIG.rodTiers[tier] || GAME_CONFIG.rodTiers[1];
    const hook = SHOP?.hooks?.find((h) => h.id === player.gear?.hook);
    const bait = SHOP?.bait?.find((b) => b.id === player.gear?.bait);
    const luck = (player.luck || 0) + (player.level || 1) * 0.5;
    return {
      tier,
      biteBonus: rodStats.biteBonus + (bait?.bonus || 0) + (hook?.bonus || 0) * 0.5,
      rareBonus: rodStats.rareBonus + (hook?.bonus || 0),
      tensionControl: rodStats.tensionControl,
      stability: rodStats.stability,
      luck,
    };
  }

  return { rodTier, getModifiers };
})();
