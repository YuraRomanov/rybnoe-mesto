/** UI вываживания — шкала натяжения */
const FishingUI = (() => {
  const CAST_BTN_SRC = {
    cast: 'assets/ui/hud/cast-default.png?v=8',
    wait: 'assets/ui/hud/cast-wait.png?v=8',
    pull: 'assets/ui/hud/cast-pull.png?v=8',
  };

  function castImageForLabel(label) {
    if (!label) return CAST_BTN_SRC.cast;
    const t = label.toLowerCase();
    if (t.includes('вытащ') || t.includes('тян')) return CAST_BTN_SRC.pull;
    if (t.includes('жди')) return CAST_BTN_SRC.wait;
    return CAST_BTN_SRC.cast;
  }

  function setStatus() {}

  function showFight(show) {
    document.getElementById('fight-ui')?.classList.toggle('hidden', !show);
    document.body.classList.toggle('fight-active', show);
  }

  function updateFight(ctx) {
    const f = ctx.fight;
    if (!f) return;

    const marker = document.getElementById('fish-marker');
    const barFill = document.getElementById('fight-bar-fill');
    const bar = document.getElementById('fight-bar');
    const hint = document.getElementById('fight-hint');

    const fishPos = Math.max(0, Math.min(100, f.displayFishPos ?? f.fishPos ?? 50));
    const stressPct = Math.max(0, Math.min(100, f.lineStress || 0));
    const pulling = Boolean(f.holding);

    if (marker) {
      marker.style.left = `${fishPos}%`;
      marker.classList.toggle('fight-reel__marker--pulling', pulling);
    }
    if (barFill) {
      barFill.style.width = `${stressPct}%`;
    }
    if (bar) {
      bar.classList.toggle('fight-reel--pulling', pulling);
      bar.classList.toggle('fight-reel--warn', stressPct > 55);
      bar.classList.toggle('fight-reel--danger', stressPct > 78);
    }
    if (hint) {
      if (typeof FishBehavior !== 'undefined') {
        hint.textContent = FishBehavior.label(f.pattern, ctx);
      } else if (pulling) {
        hint.textContent = stressPct > 72 ? 'Отпусти — леска натянута!' : 'Тяни к берегу';
      } else {
        hint.textContent = 'Жми «Вытащить» — натяжение растёт';
      }
    }
  }

  function setCastBtn(active, label) {
    const btn = document.getElementById('cast-btn');
    const img = document.getElementById('cast-btn-img');
    btn?.classList.toggle('active', active);
    btn?.classList.toggle('cast-btn--pull', Boolean(label && /вытащ|тян/i.test(label)));
    if (img) img.src = castImageForLabel(label);
    if (btn && label) btn.setAttribute('aria-label', label);
  }

  return {
    setStatus, showFight, updateFight, setCastBtn,
  };
})();
