/** Подсказки при вываживании */
const FishBehavior = (() => {
  function start(ctx) {
    ctx.fight.pattern = 'steady';
  }

  function update(ctx) {
    ctx.fight.pattern = 'steady';
  }

  function label(_pattern, ctx) {
    const f = ctx?.fight;
    const stress = f?.lineStress || 0;
    const tier = f?.weightTier ?? 0;
    if (f?.holding) {
      if (stress > 78) return 'Отпусти! Леска порвётся';
      if (stress > 55) return tier > 0.5 ? 'Тяжёлая — отпускай чаще' : 'Осторожно — отпусти';
      return 'Тяни к берегу';
    }
    if (stress > 25) return 'Леска ослабевает…';
    return tier > 0.5 ? 'Короткими рывками — жми и отпускай' : 'Жми «Вытащить» и тяни';
  }

  return { start, update, label };
})();
