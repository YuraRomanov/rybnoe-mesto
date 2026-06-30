/** Поведение рыбы в бою — агрессия растёт с весом */
const FishBehavior = (() => {
  const patterns = GAME_CONFIG.fishPatterns;

  function tier(fish) {
    return typeof FightSystem !== 'undefined'
      ? FightSystem.weightTier(fish)
      : 0.3;
  }

  function phaseCountForRarity(rarityId) {
    return GAME_CONFIG.rarities[rarityId]?.fightPhases || 1;
  }

  function pickPattern(rarityId, phaseIndex, feintChance, fish) {
    const roll = GameRNG.random();
    const t = tier(fish);
    if (roll < 0.1 + t * 0.28) return 'burst';
    if (roll < 0.18 + t * 0.24) return 'escape';
    if (t < 0.25 && roll < feintChance * 0.3 && rarityId !== 'common') return 'feint';
    if (phaseIndex > 0 && roll < 0.12 + t * 0.14) return 'escape';
    if (roll < 0.35 + t * 0.1) return 'burst';
    if (roll < 0.62) return 'idle';
    return 'recovery';
  }

  function start(ctx) {
    const rarity = ctx.fight.rarity || 'common';
    ctx.fight.phasesTotal = phaseCountForRarity(rarity);
    ctx.fight.phaseIndex = 0;
    ctx.fight.pattern = 'idle';
    ctx.fight.patternTimer = 0;
    ctx.fight.patternDuration = 40;
    ctx.fight.feintChance = rarity === 'legendary' ? 0.22 : rarity === 'epic' ? 0.16 : 0.08;
    ctx.fight.smoothPull = 0.18;
    ctx.fight.smoothReelRate = 1;
    ctx.fight.lunge = 0;
    nextPattern(ctx, true);
  }

  function patternDurationMul(fish) {
    return 0.5 + tier(fish) * 0.75;
  }

  function lungeForPattern(pattern) {
    if (pattern === 'escape') return 1;
    if (pattern === 'burst') return 0.75;
    if (pattern === 'feint') return 0.35;
    return 0;
  }

  function nextPattern(ctx, initial = false) {
    const f = ctx.fight;
    const prev = f.pattern;
    f.pattern = pickPattern(f.rarity, f.phaseIndex, f.feintChance, ctx.fish);
    const p = patterns[f.pattern];
    const mul = patternDurationMul(ctx.fish);
    f.patternDuration = Math.max(8, Math.round(GameRNG.rangeInt(p.duration[0], p.duration[1]) * mul));
    f.patternTimer = f.patternDuration;
    if (!initial && f.pattern !== prev) {
      f.lunge = Math.max(f.lunge || 0, lungeForPattern(f.pattern));
    }
  }

  function update(ctx, dt) {
    const f = ctx.fight;
    f.patternTimer -= dt;
    const p = patterns[f.pattern] || patterns.idle;
    const t = tier(ctx.fish);
    const targetPull = (p.pullForce || 0.18) * (0.55 + t * 1.2);
    const targetReel = p.reelRate ?? 1;
    const blend = Math.min(1, dt * 0.32);

    if (f.smoothPull === undefined) f.smoothPull = targetPull;
    if (f.smoothReelRate === undefined) f.smoothReelRate = targetReel;
    f.smoothPull += (targetPull - f.smoothPull) * blend;
    f.smoothReelRate += (targetReel - f.smoothReelRate) * blend;

    f.pullForce = f.smoothPull;
    f.reelRate = f.smoothReelRate;
    f.dangerReel = Boolean(p.dangerReel) && f.smoothPull > targetPull * 0.65;

    if (f.patternTimer <= 0) {
      if (f.pattern === 'burst' || f.pattern === 'escape') {
        f.phaseIndex = Math.min(f.phasesTotal, f.phaseIndex + 1);
      }
      nextPattern(ctx);
    }
  }

  function label(pattern) {
    return ({
      idle: 'Подматывай — тяни к берегу',
      burst: 'Рывок! — отпусти кнопку',
      recovery: 'Затишье — тяни смелее',
      escape: 'Уходит! — не тяни',
      feint: 'Обманный ход',
    })[pattern] || '';
  }

  return { start, update, label, phaseCountForRarity };
})();
