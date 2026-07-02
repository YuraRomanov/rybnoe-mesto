/** Фоновые звуки природы и короткие SFX */
const AmbientAudio = (() => {
  const SRC = 'assets/sounds/ambient/les.mp3?v=1';
  const SPLASH_SRC = 'assets/sounds/splash-cast.mp3?v=1';
  const VOLUME = 0.42;
  const SPLASH_VOLUME = 0.62;

  let audio = null;
  let splashAudio = null;
  let started = false;

  function init() {
    if (!audio) {
      audio = new Audio(SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = VOLUME;
    }
    if (!splashAudio) {
      splashAudio = new Audio(SPLASH_SRC);
      splashAudio.preload = 'auto';
      splashAudio.volume = SPLASH_VOLUME;
    }
  }

  async function start() {
    init();
    if (started || !audio) return;
    try {
      await audio.play();
      started = true;
    } catch (_) {
      /* браузер ждёт жест пользователя */
    }
  }

  function playSplash() {
    init();
    if (!splashAudio) return;
    const clip = splashAudio.cloneNode();
    clip.volume = SPLASH_VOLUME;
    clip.play().catch(() => {});
  }

  function bindUnlock() {
    const unlock = () => { start(); };
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  function setVolume(v) {
    if (audio) audio.volume = Math.max(0, Math.min(1, v));
  }

  return { init, start, playSplash, bindUnlock, setVolume };
})();
