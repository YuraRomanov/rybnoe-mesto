/** Удочки: шанс крупной рыбы и подсказки в магазине */
const ROD_DATA = {
  rod_0: { largeFishHelp: 0, catchBias: 0 },
  rod_spark: { largeFishHelp: 0.22, catchBias: 0.22 },
  rod_wave: { largeFishHelp: 0.30, catchBias: 0.30 },
  rod_titan: { largeFishHelp: 0.38, catchBias: 0.38 },
  rod_phantom: { largeFishHelp: 0.48, catchBias: 0.48 },
  rod_dragon: { largeFishHelp: 0.58, catchBias: 0.58 },
  rod_legend: { largeFishHelp: 0.68, catchBias: 0.68 },
  rod_kraken: { largeFishHelp: 0.80, catchBias: 0.80 },
};

function getRodData(rodId) {
  return ROD_DATA[rodId] || { largeFishHelp: 0, catchBias: 0 };
}

/** Тяжёлая рыба чаще попадается в таблицу улова */
function rodCatchMultiplier(rodId, fish) {
  const rod = typeof SHOP !== 'undefined'
    ? SHOP.rods?.find((r) => r.id === rodId)
    : null;
  const help = rod?.largeFishHelp ?? getRodData(rodId).largeFishHelp ?? 0;
  if (help <= 0) return 1;

  const maxW = fish?.maxW || 0.3;
  const minW = fish?.minW || 0.05;
  const span = Math.max(0.05, maxW - minW);
  const heaviness = Math.min(1, maxW / 1.8);
  const trophy = Math.min(1, ((fish?.category || 1) - 1) / 4);
  const sizeFactor = heaviness * 0.65 + trophy * 0.35;

  return 1 + help * 0.55 * sizeFactor;
}

/** Смещение веса к верхней границе вида */
function rodWeightBias(rodId) {
  const rod = typeof SHOP !== 'undefined'
    ? SHOP.rods?.find((r) => r.id === rodId)
    : null;
  return rod?.catchBias ?? rod?.largeFishHelp ?? getRodData(rodId).catchBias ?? 0;
}

function rollFishWeightWithRod(fish, rodId, rng = Math.random) {
  const minW = fish.minW;
  const maxW = Math.max(minW + 0.02, fish.maxW);
  const bias = rodWeightBias(rodId);
  const t = Math.pow(rng(), 1 / (1 + bias * 2.2));
  const w = minW + t * (maxW - minW);
  return Math.round(w * 1000) / 1000;
}

function rodShopHint(rod) {
  if (!rod) return '';
  const catchPct = Math.round((rod.largeFishHelp || 0) * 100);
  const reelPct = Math.round((rod.tensionControl || 0) * 100);
  const parts = [];
  if (catchPct > 0) parts.push(`крупная +${catchPct}%`);
  if (reelPct > 0) parts.push(`вываживание +${reelPct}%`);
  return parts.join(' · ');
}
