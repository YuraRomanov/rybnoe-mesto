/**
 * Сутки и погода — синхронно по реальному времени (UTC).
 * Полный цикл: 30 минут = 24 игровых часа.
 */
const WorldTime = (() => {
  const cfg = () => GAME_CONFIG.worldTime || {};
  const MS_PER_DAY = () => (cfg().dayCycleMinutes || 30) * 60 * 1000;
  const WEATHER_SLOT_H = () => cfg().weatherSlotHours || 6;

  const PHASES = [
    { id: 'night', label: 'Ночь', biteBonus: -0.04, hint: 'Клёв слабее, зато трофеи реже клюют днём' },
    { id: 'dawn', label: 'Рассвет', biteBonus: 0.06, hint: 'Рыба просыпается — хорошее время' },
    { id: 'morning', label: 'Утро', biteBonus: 0.04, hint: 'Активный клёв у берега' },
    { id: 'day', label: 'День', biteBonus: 0, hint: 'Обычный клёв' },
    { id: 'dusk', label: 'Закат', biteBonus: 0.05, hint: 'Вечерний жор перед темнотой' },
    { id: 'night', label: 'Ночь', biteBonus: -0.02, hint: 'Тихая ночная рыбалка' },
  ];

  const SKY_KEYS = [
    { h: 0, top: [12, 18, 42], bottom: [8, 12, 28], alpha: 0.58, warm: 0 },
    { h: 5, top: [48, 36, 72], bottom: [120, 52, 48], alpha: 0.38, warm: 0.55 },
    { h: 7, top: [118, 168, 220], bottom: [72, 120, 88], alpha: 0.14, warm: 0.22 },
    { h: 11, top: [255, 255, 255], bottom: [255, 255, 255], alpha: 0, warm: 0 },
    { h: 17, top: [255, 196, 120], bottom: [196, 96, 48], alpha: 0.16, warm: 0.42 },
    { h: 20, top: [36, 28, 72], bottom: [18, 14, 36], alpha: 0.48, warm: 0.12 },
    { h: 24, top: [12, 18, 42], bottom: [8, 12, 28], alpha: 0.58, warm: 0 },
  ];

  const WEATHER_TYPES = [
    { id: 'clear', label: 'Ясно', emoji: '☀️', biteBonus: 0, desc: 'Спокойная вода' },
    { id: 'cloudy', label: 'Облачно', emoji: '⛅', biteBonus: 0.02, desc: 'Рыба чуть активнее' },
    { id: 'overcast', label: 'Пасмурно', emoji: '☁️', biteBonus: 0.04, desc: 'Хороший клёв в пасмурину' },
    { id: 'rain', label: 'Дождь', emoji: '🌧️', biteBonus: 0.07, desc: 'Дождь будит рыбу' },
    { id: 'fog', label: 'Туман', emoji: '🌫️', biteBonus: 0.03, desc: 'Тихо, осторожный клёв' },
  ];

  function cycleProgress(ts = Date.now()) {
    return (ts % MS_PER_DAY()) / MS_PER_DAY();
  }

  function gameHour(ts = Date.now()) {
    return cycleProgress(ts) * 24;
  }

  function formatClock(hour) {
    const h = Math.floor(hour) % 24;
    const m = Math.floor((hour % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function getPhase(hour = gameHour()) {
    if (hour < 5) return PHASES[0];
    if (hour < 7) return PHASES[1];
    if (hour < 11) return PHASES[2];
    if (hour < 17) return PHASES[3];
    if (hour < 20) return PHASES[4];
    return PHASES[5];
  }

  function nextPhaseInfo(hour = gameHour(), ts = Date.now()) {
    const edges = [5, 7, 11, 17, 20, 24];
    let nextH = 5;
    for (const e of edges) {
      if (hour < e) { nextH = e; break; }
    }
    const realMsLeft = ((nextH - hour) / 24) * MS_PER_DAY();
    const phase = getPhase(nextH === 24 ? 0 : nextH);
    return { phase, realMsLeft, nextHour: nextH };
  }

  function hashSeed(n) {
    let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35) >>> 0;
    return x >>> 0;
  }

  function getWeather(ts = Date.now()) {
    const dayIndex = Math.floor(ts / MS_PER_DAY());
    const slot = Math.floor(gameHour(ts) / WEATHER_SLOT_H());
    const seed = hashSeed(dayIndex * 17 + slot * 31);
    let pool = WEATHER_TYPES;
    const hour = gameHour(ts);
    if (hour >= 5 && hour < 9) {
      pool = WEATHER_TYPES.filter((w) => w.id !== 'rain' || seed % 3 === 0);
    }
    if (hour >= 21 || hour < 4) {
      pool = WEATHER_TYPES.filter((w) => w.id === 'clear' || w.id === 'fog' || w.id === 'cloudy');
    }
    if (!pool.length) pool = WEATHER_TYPES;
    return pool[seed % pool.length];
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpRgb(a, b, t) {
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t)),
    ];
  }

  function skyAtHour(hour) {
    let a = SKY_KEYS[0];
    let b = SKY_KEYS[SKY_KEYS.length - 1];
    for (let i = 0; i < SKY_KEYS.length - 1; i++) {
      if (hour >= SKY_KEYS[i].h && hour < SKY_KEYS[i + 1].h) {
        a = SKY_KEYS[i];
        b = SKY_KEYS[i + 1];
        break;
      }
    }
    const span = b.h - a.h || 1;
    const t = Math.max(0, Math.min(1, (hour - a.h) / span));
    return {
      top: lerpRgb(a.top, b.top, t),
      bottom: lerpRgb(a.bottom, b.bottom, t),
      alpha: lerp(a.alpha, b.alpha, t),
      warm: lerp(a.warm, b.warm, t),
    };
  }

  function getState(ts = Date.now()) {
    const hour = gameHour(ts);
    const phase = getPhase(hour);
    const weather = getWeather(ts);
    const sky = skyAtHour(hour);
    const next = nextPhaseInfo(hour, ts);
    return {
      ts,
      hour,
      clock: formatClock(hour),
      progress: cycleProgress(ts),
      phase,
      weather,
      sky,
      next,
      dayIndex: Math.floor(ts / MS_PER_DAY()),
    };
  }

  function getBiteBonus(ts = Date.now()) {
    const s = getState(ts);
    return (s.phase.biteBonus || 0) + (s.weather.biteBonus || 0);
  }

  function formatDuration(ms) {
    const sec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m <= 0) return `${s} сек`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function drawOverlay(ctx, w, h, state = getState()) {
    const { sky, weather, hour } = state;
    const [tr, tg, tb] = sky.top;
    const [br, bg, bb] = sky.bottom;

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgba(${tr},${tg},${tb},${sky.alpha})`);
    grad.addColorStop(0.55, `rgba(${br},${bg},${bb},${sky.alpha * 0.85})`);
    grad.addColorStop(1, `rgba(${br},${bg},${bb},${sky.alpha * 0.55})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (sky.warm > 0.05) {
      const warm = ctx.createRadialGradient(w * 0.72, h * 0.18, 0, w * 0.72, h * 0.18, w * 0.45);
      warm.addColorStop(0, `rgba(255, 170, 70, ${sky.warm * 0.35})`);
      warm.addColorStop(1, 'rgba(255, 120, 40, 0)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, w, h);
    }

    if (hour < 5 || hour >= 20) {
      ctx.fillStyle = 'rgba(255,255,220,0.75)';
      const seed = state.dayIndex * 997;
      for (let i = 0; i < 28; i++) {
        const sx = ((seed + i * 73) % 1000) / 1000 * w;
        const sy = ((seed + i * 131) % 700) / 1000 * h * 0.55;
        const r = 0.6 + ((seed + i) % 3) * 0.35;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (weather.id === 'fog') {
      const fog = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.75);
      fog.addColorStop(0, 'rgba(220,228,236,0)');
      fog.addColorStop(0.5, 'rgba(200,210,220,0.28)');
      fog.addColorStop(1, 'rgba(180,190,200,0.12)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);
    }

    if (weather.id === 'rain') {
      ctx.strokeStyle = 'rgba(180,210,255,0.22)';
      ctx.lineWidth = 1;
      const t = state.ts * 0.001;
      for (let i = 0; i < 48; i++) {
        const rx = ((i * 97 + state.dayIndex * 13) % 1000) / 1000 * w;
        const ry = ((i * 53 + Math.floor(t * 120 + i * 7)) % 1000) / 1000 * h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 12);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  return {
    getState,
    getBiteBonus,
    getPhase,
    getWeather,
    formatClock,
    formatDuration,
    drawOverlay,
    MS_PER_DAY,
  };
})();
