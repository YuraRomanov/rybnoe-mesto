/** Вываживание: чем тяжелее рыба — тем сложнее вытащить */
const FightSystem = (() => {
  const cfg = () => GAME_CONFIG.fight;

  function weightKg(fish) {
    return Math.max(0.02, fish?.weight || 0.1);
  }

  /** 0 = мелочь, 1 = крупная рыба */
  function weightTier(fish) {
    const w = weightKg(fish);
    const min = cfg().weightMinKg ?? 0.04;
    const max = cfg().weightMaxKg ?? 1.3;
    if (max <= min) return 0;
    return Math.max(0, Math.min(1, (w - min) / (max - min)));
  }

  function fishFightPace(fish) {
    const t = weightTier(fish);
    return 5.8 - t * 4.4;
  }

  function startFishPos(fish, stability = 0) {
    const t = weightTier(fish);
    return 44 + t * 42 - (stability || 0) * 5;
  }

  function winThreshold(fish) {
    const t = weightTier(fish);
    return 18 - t * 8;
  }

  function pullMultiplier(fish) {
    const t = weightTier(fish);
    return 0.55 + t * 1.15;
  }

  function start(ctx, hookGrade) {
    const grade = GAME_CONFIG.hookGrades[hookGrade] || GAME_CONFIG.hookGrades.good;
    const mods = ctx.modifiers || {};
    const fish = ctx.fish;
    const pace = fishFightPace(fish);

    ctx.fight = {
      ...ctx.fight,
      fishPos: startFishPos(fish, mods.stability),
      lineStress: 4 + weightTier(fish) * 5,
      holding: false,
      hookGrade,
      catchBonus: grade.catchBonus,
      reelPower: (0.68 + mods.tensionControl * 0.24) * pace,
      fightPace: pace,
      weightTier: weightTier(fish),
      winAt: winThreshold(fish),
      haul: 0,
      displayFishPos: null,
      lunge: 0,
      swayPhase: GameRNG.random() * Math.PI * 2,
    };

    FishBehavior.start(ctx);
  }

  function update(ctx, dt, holding) {
    const f = ctx.fight;
    const c = cfg();
    const fish = ctx.fish;
    const pace = f.fightPace || fishFightPace(fish);
    const tier = f.weightTier ?? weightTier(fish);
    const scale = dt * 0.34;

    f.holding = holding;
    FishBehavior.update(ctx, dt);

    const lungeMul = 1 + (f.lunge || 0) * 1.8;
    const pullAway = (f.pullForce || 0.18) * pullMultiplier(fish) * lungeMul / Math.max(0.9, pace * 0.6);
    const sway = Math.sin(f.swayPhase) * (0.04 + tier * 0.12 + (f.pullForce || 0) * 0.1) * lungeMul;

    f.swayPhase += dt * (0.08 + tier * 0.14 + (f.pullForce || 0) * 0.18);

    if (holding) {
      const reelMul = f.dangerReel ? 0.55 : 1;
      f.fishPos -= f.reelPower * scale * (f.catchBonus || 1) * (f.reelRate || 1) * reelMul;
      f.lineStress += c.holdTensionRate * scale * (f.dangerReel ? 1.5 : 1) * (0.75 + tier * 0.45) / Math.max(0.85, pace * 0.55);
    } else {
      f.fishPos += (pullAway + sway) * scale;
      f.lineStress -= c.stressIdleRecover * scale * (1.15 - tier * 0.25);
    }

    if (f.lunge > 0) f.lunge = Math.max(0, f.lunge - dt * 0.045);

    f.fishPos = Math.max(0, Math.min(100, f.fishPos));
    f.lineStress = Math.max(0, Math.min(c.lineStressMax, f.lineStress));
    if (f.displayFishPos == null) f.displayFishPos = f.fishPos;
    f.displayFishPos += (f.fishPos - f.displayFishPos) * Math.min(1, dt * 0.38);
    f.haul = 1 - f.displayFishPos / 100;

    if (f.lineStress >= c.lineStressMax) return 'break';
    if (f.fishPos >= 86 + tier * 2) return 'escape';
    if (f.fishPos <= (f.winAt ?? 10)) return 'win';
    return 'ongoing';
  }

  return {
    start, update, fishFightPace, weightTier, weightKg, pullMultiplier,
  };
})();
