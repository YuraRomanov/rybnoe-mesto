/**
 * Наживки: привязка к группам рыб.
 * Число — насколько наживка тянет эту группу (не перемножается с fishVer напрямую).
 */
const BAIT_GROUP_WEIGHTS = {
  bait1: {
    carp: 1.25, omnivore: 1.2, bottom: 1.1, predator: 1.1, small: 1.15,
  },
  bait2: {
    bottom: 1.7, small: 1.55, carp: 1.2, predator: 0.55,
  },
  bait3: {
    carp: 1.55, herbivore: 1.45, bottom_feeder: 1.35, predator: 0.22, perch: 0.3,
  },
  bait4: {
    carp: 1.5, bottom: 1.45, small: 1.5, predator: 0.35,
  },
  bait5: {
    herbivore: 1.85, carp: 1.5, bottom_feeder: 1.2, predator: 0.15, perch: 0.2,
  },
  bait6: {
    herbivore: 1.75, carp: 1.45, bottom_feeder: 1.3, predator: 0.18,
  },
  bait7: {
    herbivore: 1.9, carp: 1.35, bottom_feeder: 1.4, predator: 0.12, perch: 0.15,
  },
  bait8: {
    predator: 3.2, pike: 3.5, large_predator: 3.4, perch: 2.6,
    carp: 0.05, herbivore: 0.04, small: 0.05, bottom: 0.1, bottom_feeder: 0.08, omnivore: 0.12,
  },
  bait9: {
    herbivore: 1.65, carp: 1.4, bottom_feeder: 1.25, predator: 0.16,
  },
  bait10: {
    carp: 1.6, herbivore: 1.5, bottom: 1.25, predator: 0.2,
  },
  bait11: {
    predator: 1.75, perch: 1.65, pike: 1.7, carp: 0.4, small: 0.45, bottom: 0.55, omnivore: 0.5,
  },
  bait12: {
    predator: 2.5, perch: 2.2, pike: 2.8, carp: 0.2, bottom: 0.35, small: 0.25,
  },
};

const BAIT_HINTS = {
  bait1: 'Универсал: линь, окунь, плотва',
  bait2: 'Пескарь, ёрш, плотва',
  bait3: 'Лещ, карась, плотва',
  bait4: 'Плотва, пескарь, ёрш',
  bait5: 'Карась, линь, лещ',
  bait6: 'Карась, линь, лещ',
  bait7: 'Лещ, карась, кукуруза',
  bait8: 'Щука, окунь, ротан — хищники',
  bait9: 'Лещ, карась, горох',
  bait10: 'Плотва, карась, крупная мирная',
  bait11: 'Окунь, плотва, щука',
  bait12: 'Щука, окунь, хищники',
};

function baitFishMultiplier(baitId, fishId) {
  const profile = BAIT_GROUP_WEIGHTS[baitId];
  if (!profile) return 1;
  const tags = FISH_TACKLE_TAGS[fishId];
  if (!tags?.length) return 1;

  const floor = typeof TACKLE_WRONG_BITE_FLOOR === 'number' ? TACKLE_WRONG_BITE_FLOOR : 0.04;
  let best = floor;
  for (const tag of tags) {
    if (profile[tag] != null) best = Math.max(best, profile[tag]);
  }
  return best;
}
