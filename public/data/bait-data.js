/**
 * Наживки и привлекательность для рыб (по реальной рыбалке).
 * Множитель > 1 — рыба клюёт чаще на эту наживку.
 */
const BAIT_PREFERENCES = {
  bait1: {
    plotva: 1.1,
    karas: 1.1,
    gold_karas: 1.0,
    okun: 1.5,
    ersh: 1.0,
    vyun: 1.3,
  },
  bait2: {
    plotva: 1.35,
    karas: 1.0,
    gold_karas: 0.95,
    okun: 1.25,
    ersh: 1.25,
    vyun: 1.1,
  },
  bait3: {
    plotva: 1.2,
    karas: 1.35,
    gold_karas: 1.2,
    okun: 0.55,
    ersh: 1.05,
    vyun: 0.85,
  },
  bait4: {
    plotva: 1.45,
    karas: 1.25,
    gold_karas: 1.1,
    okun: 0.65,
    ersh: 1.35,
    vyun: 0.9,
  },
  bait5: {
    plotva: 1.15,
    karas: 1.55,
    gold_karas: 1.35,
    okun: 0.45,
    ersh: 0.75,
    vyun: 0.8,
  },
  bait6: {
    plotva: 1.1,
    karas: 1.45,
    gold_karas: 1.3,
    okun: 0.5,
    ersh: 0.7,
    vyun: 0.85,
  },
};

const BAIT_HINTS = {
  bait1: 'Окунь, вьюн, плотва',
  bait2: 'Плотва, окунь, ёрш',
  bait3: 'Карась, плотва, ёрш',
  bait4: 'Плотва, ёрш, карась',
  bait5: 'Карась, золотой карась',
  bait6: 'Карась, плотва',
};

function baitFishMultiplier(baitId, fishId) {
  const prefs = BAIT_PREFERENCES[baitId];
  if (!prefs) return 1;
  return prefs[fishId] ?? 1;
}
