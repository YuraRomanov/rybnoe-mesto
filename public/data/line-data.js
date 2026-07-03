/**
 * Леска: лёгкая подстройка + прочность при вываживании.
 */
const LINE_STATS = {
  line1: { strength: 0.55, diameter: 0.10 },
  line2: { strength: 0.85, diameter: 0.14 },
  line3: { strength: 1.0, diameter: 0.18 },
  line4: { strength: 1.3, diameter: 0.22 },
  line5: { strength: 1.1, diameter: 0.12 },
};

const LINE_PREFERENCES = {
  line1: {
    plotva: 1.12, karas: 1.08, gold_karas: 1.02, okun: 0.88, ersh: 1.18, vyun: 1.1,
    lesh: 0.75, peskari: 1.22, lin: 0.92, rotan: 0.78, shchuka: 0.5,
  },
  line2: {
    plotva: 1.05, karas: 1.03, gold_karas: 1.0, okun: 1.02, ersh: 1.05, vyun: 1.02,
    lesh: 1.02, peskari: 1.04, lin: 1.02, rotan: 0.96, shchuka: 0.9,
  },
  line3: {
    plotva: 0.98, karas: 0.95, gold_karas: 0.92, okun: 1.12, ersh: 0.98, vyun: 0.98,
    lesh: 1.18, peskari: 0.92, lin: 1.15, rotan: 1.1, shchuka: 1.18,
  },
  line4: {
    plotva: 0.88, karas: 0.85, gold_karas: 0.8, okun: 1.2, ersh: 0.88, vyun: 0.85,
    lesh: 1.28, peskari: 0.82, lin: 1.12, rotan: 1.18, shchuka: 1.32,
  },
  line5: {
    plotva: 0.95, karas: 0.9, gold_karas: 0.88, okun: 1.22, ersh: 1.08, vyun: 1.15,
    lesh: 1.02, peskari: 0.95, lin: 0.98, rotan: 1.12, shchuka: 1.22,
  },
};

const LINE_HINTS = {
  line1: 'Мелочь: пескарь, ёрш',
  line2: 'Универсальная',
  line3: 'Лещ, щука',
  line4: 'Крупная рыба, щука',
  line5: 'Окунь, хищник',
};

function lineFishMultiplier(lineId, fishId) {
  const prefs = LINE_PREFERENCES[lineId];
  if (!prefs) return 1;
  return prefs[fishId] ?? 1;
}

function lineStressMultiplier(lineId, fishWeightTier) {
  const stats = LINE_STATS[lineId] || LINE_STATS.line2;
  const tier = Math.max(0, Math.min(1, fishWeightTier || 0));
  const str = stats.strength;
  if (tier > 0.45 && str < 1) {
    return 1 + tier * (1 - str) * 1.65;
  }
  if (tier < 0.35 && str > 1.05) {
    return 1 + (str - 1) * (1 - tier) * 0.35;
  }
  return 1;
}
