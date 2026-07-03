/** Настройки игры: громкость, секретные коды */
const SettingsSystem = (() => {
  const STORAGE_KEY = 'rybnoe-mesto-settings';

  const DEFAULTS = {
    ambientVolume: 0.42,
    sfxVolume: 0.62,
  };

  let settings = { ...DEFAULTS };
  let onChange = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.ambientVolume === 'number') settings.ambientVolume = clamp01(data.ambientVolume);
      if (typeof data.sfxVolume === 'number') settings.sfxVolume = clamp01(data.sfxVolume);
    } catch (_) {}
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function applyAudio() {
    if (typeof AmbientAudio !== 'undefined') {
      AmbientAudio.setVolume(settings.ambientVolume);
      AmbientAudio.setSplashVolume(settings.sfxVolume);
    }
  }

  function setAmbientVolume(v) {
    settings.ambientVolume = clamp01(v);
    applyAudio();
    save();
    onChange?.(settings);
  }

  function setSfxVolume(v) {
    settings.sfxVolume = clamp01(v);
    applyAudio();
    save();
    onChange?.(settings);
  }

  function get() {
    return { ...settings };
  }

  function normalizeCode(raw) {
    return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  /** @returns {{ ok: boolean, message: string }} */
  function redeemCode(raw, hooks = {}) {
    const code = normalizeCode(raw);
    if (!code) return { ok: false, message: 'Введите код' };

    if (code === 'УРОВЕНЬПЛЮС' || code === 'UROVENPLUS' || code === 'LEVELPLUS') {
      if (typeof hooks.levelUp === 'function') hooks.levelUp(1);
      return { ok: true, message: 'Код принят! +1 уровень' };
    }

    return { ok: false, message: 'Неизвестный код' };
  }

  function init(opts = {}) {
    onChange = opts.onChange || null;
    load();
    applyAudio();
  }

  function bindUi(root = document) {
    const ambient = root.getElementById('settings-ambient-vol');
    const sfx = root.getElementById('settings-sfx-vol');
    const codeInput = root.getElementById('settings-code-input');
    const codeBtn = root.getElementById('settings-code-submit');
    const codeMsg = root.getElementById('settings-code-msg');

    const syncSliders = () => {
      if (ambient) ambient.value = String(Math.round(settings.ambientVolume * 100));
      if (sfx) sfx.value = String(Math.round(settings.sfxVolume * 100));
      updateValLabel('settings-ambient-val', settings.ambientVolume);
      updateValLabel('settings-sfx-val', settings.sfxVolume);
    };

    function updateValLabel(id, v) {
      const el = root.getElementById(id);
      if (el) el.textContent = `${Math.round(v * 100)}%`;
    }

    syncSliders();

    ambient?.addEventListener('input', () => {
      setAmbientVolume(Number(ambient.value) / 100);
      updateValLabel('settings-ambient-val', settings.ambientVolume);
    });
    sfx?.addEventListener('input', () => {
      setSfxVolume(Number(sfx.value) / 100);
      updateValLabel('settings-sfx-val', settings.sfxVolume);
    });

    const submitCode = () => {
      const result = redeemCode(codeInput?.value, {
        levelUp: typeof window.grantPlayerLevels === 'function' ? window.grantPlayerLevels : null,
      });
      if (codeMsg) {
        codeMsg.textContent = result.message;
        codeMsg.classList.toggle('settings-code-msg--ok', result.ok);
        codeMsg.classList.toggle('settings-code-msg--err', !result.ok);
      }
      if (result.ok && codeInput) codeInput.value = '';
    };

    codeBtn?.addEventListener('click', submitCode);
    codeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitCode();
      }
    });

    return { syncSliders };
  }

  return {
    init, bindUi, load, save, get,
    setAmbientVolume, setSfxVolume, redeemCode, normalizeCode,
  };
})();
