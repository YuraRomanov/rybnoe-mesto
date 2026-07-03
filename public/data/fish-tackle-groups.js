/**
 * Группы рыб для подбора наживки/снастей.
 * У рыбы может быть несколько тегов — берётся лучший множитель от наживки.
 */
const FISH_TACKLE_TAGS = {
  plotva: ['carp', 'omnivore'],
  karas: ['carp', 'herbivore', 'small'],
  gold_karas: ['carp', 'herbivore'],
  okun: ['predator', 'perch'],
  ersh: ['bottom', 'small'],
  vyun: ['bottom'],
  lesh: ['carp', 'bottom_feeder', 'large_carp'],
  peskari: ['carp', 'small', 'bottom'],
  lin: ['carp', 'herbivore', 'bottom_feeder'],
  rotan: ['predator', 'perch'],
  shchuka: ['predator', 'large_predator', 'pike'],
};

/** Минимальный шанс «случайного» улова нецелевой рыбы */
const TACKLE_WRONG_BITE_FLOOR = 0.04;
