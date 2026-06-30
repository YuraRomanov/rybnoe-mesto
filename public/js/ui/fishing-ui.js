/** UI рыбалки — шкала вываживания как в референсе */
const FishingUI = (() => {
  const CAST_BTN_SRC = {
    cast: 'assets/ui/hud/cast-default.png?v=6',
    wait: 'assets/ui/hud/cast-wait.png?v=6',
    pull: 'assets/ui/hud/cast-pull.png?v=6',
  };

  const FIGHT_MARKER_HTML = '<span class="fight-fish-marker" title="Рыба"></span>';

  function castImageForLabel(label) {
    if (!label) return CAST_BTN_SRC.cast;
    const t = label.toLowerCase();
    if (t.includes('тяни')) return CAST_BTN_SRC.pull;
    if (t.includes('жди')) return CAST_BTN_SRC.wait;
    return CAST_BTN_SRC.cast;
  }

  function setStatus() {}

  function showFight(show) {
    document.getElementById('fight-ui')?.classList.toggle('hidden', !show);
    document.body.classList.toggle('fight-active', show);
    if (show) {
      const emoji = document.getElementById('fight-fish-icon');
      if (emoji) emoji.innerHTML = FIGHT_MARKER_HTML;
    }
  }

  function updateFight(ctx) {
    const f = ctx.fight;
    if (!f) return;

    const marker = document.getElementById('fish-marker');
    const progress = document.getElementById('reel-progress');
    const barFill = document.getElementById('reel-bar-fill');
    const bar = document.getElementById('reel-bar');
    const hint = document.getElementById('fight-hint');
    const emoji = document.getElementById('fight-fish-icon');

    // Рыба: 0 = берег (слева), 100 = в воде (справа)
    const fishPos = Math.max(0, Math.min(100, f.displayFishPos ?? f.fishPos));
    const stressPct = Math.max(0, Math.min(100, f.lineStress || 0));

    if (marker) marker.style.left = `${fishPos}%`;
    if (barFill) {
      barFill.style.width = '100%';
      barFill.classList.toggle('reel-bar-fill--danger', stressPct > 78);
      barFill.classList.toggle('reel-bar-fill--stress', stressPct > 55 && stressPct <= 78);
    }
    if (progress) {
      progress.style.width = `${stressPct}%`;
      progress.classList.toggle('reel-progress--stress', stressPct > 55);
      progress.classList.toggle('reel-progress--danger', stressPct > 78);
    }
    if (bar) {
      bar.classList.toggle('reel-bar--danger', Boolean(f.dangerReel));
      bar.style.setProperty('--stress', `${stressPct}%`);
    }
    if (hint) {
      if (typeof FishBehavior !== 'undefined' && f.pattern) {
        hint.textContent = FishBehavior.label(f.pattern);
      } else {
        hint.textContent = f.holding
          ? (f.dangerReel ? 'Рывок! Отпусти' : 'Тяни к берегу!')
          : 'Жми и держи «Тяни»';
      }
    }
    if (emoji && !emoji.querySelector('.fight-fish-marker')) {
      emoji.innerHTML = FIGHT_MARKER_HTML;
    }
  }

  function setCastBtn(active, label) {
    const btn = document.getElementById('cast-btn');
    const img = document.getElementById('cast-btn-img');
    btn?.classList.toggle('active', active);
    if (img) img.src = castImageForLabel(label);
    if (btn && label) btn.setAttribute('aria-label', label);
  }

  return {
    setStatus, showFight, updateFight, setCastBtn,
  };
})();
