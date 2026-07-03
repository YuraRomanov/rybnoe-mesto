/** Фоновые звуки природы и короткие SFX */
const AmbientAudio = (() => {
  const SRC = 'assets/sounds/ambient/les.mp3?v=1';
  const SPLASH_SRC = 'assets/sounds/splash-cast.mp3?v=1';
  const VOLUME = 0.42;
  const SPLASH_VOLUME = 0.62;

  let audio = null;
  let splashAudio = null;
  let started = false;
  let pausedByHide = false;
  let lifecycleBound = false;
  let ambientVolume = VOLUME;
  let splashVolume = SPLASH_VOLUME;

  function init() {
    if (!audio) {
      audio = new Audio(SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = ambientVolume;
    }
    if (!splashAudio) {
      splashAudio = new Audio(SPLASH_SRC);
      splashAudio.preload = 'auto';
      splashAudio.volume = splashVolume;
    }
  }

  function pause() {
    init();
    if (audio && started && !audio.paused) {
      audio.pause();
      pausedByHide = true;
    }
  }

  function resume() {
    if (!document.hidden && audio && pausedByHide && started) {
      audio.play().catch(() => {});
      pausedByHide = false;
    }
  }

  async function start() {
    init();
    if (started || !audio || document.hidden) return;
    try {
      await audio.play();
      started = true;
      pausedByHide = false;
    } catch (_) {
      /* браузер ждёт жест пользователя */
    }
  }

  function playSplash() {
    if (document.hidden) return;
    init();
    if (!splashAudio) return;
    const clip = splashAudio.cloneNode();
    clip.volume = splashVolume;
    clip.play().catch(() => {});
  }

  function bindUnlock() {
    const unlock = () => { start(); };
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  function bindLifecycle() {
    if (lifecycleBound) return;
    lifecycleBound = true;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else resume();
    });
    window.addEventListener('pagehide', pause);
    window.addEventListener('blur', pause);
    window.addEventListener('focus', resume);

    const cap = window.Capacitor;
    const app = cap?.Plugins?.App;
    if (app?.addListener) {
      app.addListener('appStateChange', ({ isActive }) => {
        if (isActive) resume();
        else pause();
      }).catch(() => {});
    }
  }

  function setVolume(v) {
    ambientVolume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = ambientVolume;
  }

  function setSplashVolume(v) {
    splashVolume = Math.max(0, Math.min(1, v));
    if (splashAudio) splashAudio.volume = splashVolume;
  }

  function getVolume() { return ambientVolume; }
  function getSplashVolume() { return splashVolume; }

  return {
    init, start, pause, resume, playSplash, bindUnlock, bindLifecycle,
    setVolume, setSplashVolume, getVolume, getSplashVolume,
  };
})();
