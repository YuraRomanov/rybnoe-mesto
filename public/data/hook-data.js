/**
 * Крючки — лёгкая подстройка под размер рыбы (основной выбор даёт наживка).
 */
const HOOK_PREFERENCES = {
  hook1: {
    plotva: 1.08, karas: 1.05, gold_karas: 1.0, okun: 1.12, ersh: 1.1, vyun: 1.05,
    lesh: 1.0, peskari: 1.12, lin: 1.05, rotan: 0.92, shchuka: 0.88,
  },
  hook2: {
    plotva: 0.95, karas: 0.9, gold_karas: 0.88, okun: 1.2, ersh: 0.95, vyun: 0.9,
    lesh: 1.15, peskari: 0.85, lin: 1.12, rotan: 1.15, shchuka: 1.2,
  },
  hook3: {
    plotva: 0.72, karas: 0.68, gold_karas: 0.65, okun: 1.35, ersh: 0.75, vyun: 0.7,
    lesh: 0.8, peskari: 0.7, lin: 0.78, rotan: 1.3, shchuka: 1.4,
  },
  hook4: {
    plotva: 1.25, karas: 1.2, gold_karas: 1.1, okun: 0.7, ersh: 1.25, vyun: 1.15,
    lesh: 0.82, peskari: 1.35, lin: 0.88, rotan: 0.6, shchuka: 0.45,
  },
  hook5: {
    plotva: 1.12, karas: 1.08, gold_karas: 1.05, okun: 1.05, ersh: 1.1, vyun: 1.05,
    lesh: 1.05, peskari: 1.18, lin: 1.02, rotan: 0.88, shchuka: 0.75,
  },
  hook6: {
    plotva: 1.0, karas: 1.25, gold_karas: 1.2, okun: 0.82, ersh: 0.92, vyun: 0.85,
    lesh: 1.0, peskari: 0.95, lin: 1.28, rotan: 0.72, shchuka: 0.55,
  },
  hook7: {
    plotva: 0.98, karas: 1.3, gold_karas: 1.25, okun: 0.75, ersh: 0.88, vyun: 0.82,
    lesh: 0.92, peskari: 0.9, lin: 1.2, rotan: 0.68, shchuka: 0.5,
  },
};

const HOOK_HINTS = {
  hook1: 'Универсальный №8',
  hook2: 'Крупная рыба, хищник',
  hook3: 'Щука, окунь, тройник',
  hook4: 'Мелочь: пескарь, ёрш',
  hook5: 'Средний №10',
  hook6: 'Карась, линь',
  hook7: 'Круглый — карась',
};

function hookFishMultiplier(hookId, fishId) {
  const prefs = HOOK_PREFERENCES[hookId];
  if (!prefs) return 1;
  return prefs[fishId] ?? 1;
}
