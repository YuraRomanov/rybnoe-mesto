/** Игровой баланс и расширяемые таблицы — единый источник правды */
const GAME_CONFIG = {
  meta: { version: '2.0.0', title: 'Рыбалка: Большая Вода' },

  timing: {
    tickMs: 16,
    biteWaitMinSec: 3,
    biteWaitMaxSec: 25,
    biteWarningMinSec: 0.5,
    biteWarningMaxSec: 2,
    hookWindowMinSec: 0.8,
    hookWindowMaxSec: 1.4,
    castChargeMaxSec: 2.5,
    fakeBobberIntervalSec: [4, 9],
  },

  rarities: {
    common:    { id: 'common',    label: 'Обычная',   color: '#9e9e9e', weightMul: 1,   rewardMul: 1,   fightPhases: 1 },
    uncommon:  { id: 'uncommon',  label: 'Необычная', color: '#66bb6a', weightMul: 1.2, rewardMul: 1.3, fightPhases: 1 },
    rare:      { id: 'rare',      label: 'Редкая',    color: '#42a5f5', weightMul: 1.5, rewardMul: 1.8, fightPhases: 2 },
    epic:      { id: 'epic',      label: 'Эпическая', color: '#ab47bc', weightMul: 2,   rewardMul: 2.5, fightPhases: 3 },
    legendary: { id: 'legendary', label: 'Легенда',   color: '#ffd54f', weightMul: 3,   rewardMul: 4,   fightPhases: 4 },
  },

  hookGrades: {
    perfect: { label: 'Идеально!', windowPct: 0.12, catchBonus: 1.25, rarityBonus: 0.15 },
    good:    { label: 'Хорошо',    windowPct: 0.28, catchBonus: 1.0,  rarityBonus: 0.05 },
    fail:    { label: 'Мимо',      windowPct: 1.0,  catchBonus: 0,    rarityBonus: 0 },
  },

  fight: {
    /** Шкала: 0 слева (срыв), 100 справа (улов) */
    haulWinAt: 94,
    haulLoseAt: 5,
    reelWinThreshold: 100,
    reelEscapeThreshold: 0,
    lineStressMax: 100,
    stressRecoverRate: 0.35,
    stressDangerRate: 0.95,
    stressIdleRecover: 0.22,
    tensionMinEscape: 12,
    tensionMaxBreak: 100,
    greenZoneMin: 32,
    greenZoneMax: 72,
    holdTensionRate: 1.05,
    releaseTensionRate: 0.85,
    staminaDamageInZone: 0.55,
    staminaRegenOutZone: 0.08,
    lowTensionEscapeRate: 0.35,
    /** Диапазон веса для шкалы сложности (кг) */
    weightMinKg: 0.04,
    weightMaxKg: 1.3,
  },

  rodTiers: {
    1: { biteBonus: 0,    rareBonus: 0,    tensionControl: 0,    stability: 0 },
    2: { biteBonus: 0.05, rareBonus: 0.03, tensionControl: 0.05, stability: 0.05 },
    3: { biteBonus: 0.10, rareBonus: 0.06, tensionControl: 0.10, stability: 0.10 },
    4: { biteBonus: 0.16, rareBonus: 0.10, tensionControl: 0.15, stability: 0.14 },
    5: { biteBonus: 0.22, rareBonus: 0.15, tensionControl: 0.22, stability: 0.20 },
    6: { biteBonus: 0.26, rareBonus: 0.18, tensionControl: 0.26, stability: 0.24 },
    7: { biteBonus: 0.30, rareBonus: 0.22, tensionControl: 0.30, stability: 0.28 },
    8: { biteBonus: 0.35, rareBonus: 0.28, tensionControl: 0.36, stability: 0.34 },
  },

  fishPatterns: {
    idle:     { pullForce: 0.2,  reelRate: 1.0,  dangerReel: false, duration: [32, 52] },
    burst:    { pullForce: 0.58, reelRate: 0.32, dangerReel: true,  duration: [14, 26] },
    recovery: { pullForce: 0.07, reelRate: 1.2,  dangerReel: false, duration: [22, 38] },
    escape:   { pullForce: 0.72, reelRate: 0.22, dangerReel: true,  duration: [12, 22] },
    feint:    { pullForce: 0.16, reelRate: 0.82, dangerReel: false, duration: [18, 32] },
  },

  rarityByCategory: {
    1: 'common', 2: 'common', 3: 'uncommon', 4: 'rare', 5: 'epic', 6: 'legendary',
  },

  economy: {
    expBase: 18,
    silverPerKg: 4,
    perfectHookExpBonus: 1.5,
    comboSilverBonus: 0.1,
    upgradeCostCurve: 1.65,
  },

  /** Порог опыта для следующего уровня: expBase + level * expPerLevel */
  leveling: {
    expBase: 60,
    expPerLevel: 40,
  },

  /** 30 реальных минут = 24 игровых часа; время синхронно у всех игроков (UTC) */
  worldTime: {
    dayCycleMinutes: 30,
    weatherSlotHours: 6,
  },
};
