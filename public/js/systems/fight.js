/** Вываживание: натяжение на шкале, рыба по верхнему краю едет к берегу */
const FightSystem = (() => {
  const cfg = () => GAME_CONFIG.fight;

  function weightKg(fish) {
    return Math.max(0.02, fish?.weight || 0.1);
  }

  function weightTier(fish) {
    const w = weightKg(fish);
    const min = cfg().weightMinKg ?? 0.04;
    const max = cfg().weightMaxKg ?? 1.3;
    if (max <= min) return 0;
    return Math.max(0, Math.min(1, (w - min) / (max - min)));
  }

  /** Лёгкая рыба быстро идёт к берегу */
  function reelPace(fish) {
    const t = weightTier(fish);
    return 2.1 - t * 1.25;
  }

  function tensionPace(fish) {
    const t = weightTier(fish);
    return 0.32 + t * 2.0;
  }

  function driftPace(fish) {
    const t = weightTier(fish);
    return 0.05 + t * 0.1;
  }

  function startFishPos(fish, stability = 0) {
    const t = weightTier(fish);
    return 78 + t * 5 - (stability || 0) * 2;
  }

  function start(ctx, hookGrade) {
    const grade = GAME_CONFIG.hookGrades[hookGrade] || GAME_CONFIG.hookGrades.good;
    const mods = ctx.modifiers || {};
    const fish = ctx.fish;
    const pace = reelPace(fish);
    const largeHelp = mods.largeFishHelp || 0;
    const tier = weightTier(fish);

    ctx.fight = {
      ...ctx.fight,
      fishPos: startFishPos(fish, mods.stability),
      lineStress: 0,
      holding: false,
      hookGrade,
      catchBonus: grade.catchBonus,
      reelPower: (0.55 + mods.tensionControl * 0.16) * (pace + largeHelp * tier * 0.48),
      reelPace: pace,
      tensionPace: tensionPace(fish) * (1 - largeHelp * tier * 0.32),
      driftPace: driftPace(fish) * (1 - (mods.stability || 0) * 0.4),
      weightTier: weightTier(fish),
      winAt: 3,
      loseAt: 98,
      haul: 0,
      displayFishPos: null,
    };

    FishBehavior.start(ctx);
  }

  function update(ctx, dt, holding) {
    const f = ctx.fight;
    const c = cfg();
    const fish = ctx.fish;
    const tier = f.weightTier ?? weightTier(fish);
    const scale = dt * 0.5;
    const tensionMul = f.tensionPace ?? tensionPace(fish);
    const largeHelp = ctx.modifiers?.largeFishHelp || 0;
    const stability = ctx.modifiers?.stability || 0;
    const tensionControl = (1 - (ctx.modifiers?.tensionControl || 0) * 0.32) * (1 - largeHelp * tier * 0.28);
    const lineStressMul = typeof lineStressMultiplier === 'function'
      ? lineStressMultiplier(ctx.modifiers?.lineId, tier)
      : 1;

    f.holding = holding;
    FishBehavior.update(ctx, dt);

    if (holding) {
      f.fishPos -= f.reelPower * scale * (f.catchBonus || 1) * (1 + largeHelp * tier * 0.32);
      f.lineStress += c.holdTensionRate * scale * tensionMul * tensionControl * lineStressMul;
    } else {
      f.fishPos += (f.driftPace ?? driftPace(fish)) * scale * (1 - stability * 0.45);
      f.lineStress -= c.stressIdleRecover * scale * (1.85 + tier * 0.35 + stability * 0.25);
    }

    f.fishPos = Math.max(0, Math.min(100, f.fishPos));
    f.lineStress = Math.max(0, Math.min(c.lineStressMax, f.lineStress));

    if (f.displayFishPos == null) f.displayFishPos = f.fishPos;
    const smooth = holding ? 0.42 : 0.16;
    f.displayFishPos += (f.fishPos - f.displayFishPos) * Math.min(1, dt * smooth);
    f.haul = 1 - f.displayFishPos / 100;

    if (f.lineStress >= c.lineStressMax) return 'break';
    if (f.fishPos >= f.loseAt) return 'escape';
    if (f.fishPos <= f.winAt) return 'win';
    return 'ongoing';
  }

  return {
    start, update, weightTier, weightKg, reelPace, tensionPace, driftPace,
  };
})();
