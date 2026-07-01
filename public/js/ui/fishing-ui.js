/** UI вываживания — шкала натяжения + рыба на верхнем краю */
const FishingUI = (() => {
  const CAST_BTN_SRC = {
    cast: 'assets/ui/hud/cast-default.png?v=8',
    wait: 'assets/ui/hud/cast-wait.png?v=8',
    pull: 'assets/ui/hud/cast-pull.png?v=8',
  };

  const FIGHT_MARKER_HTML = '<span class="fight-fish-marker__shape" title="Рыба"></span>';
  const FIGHT_DISPLAY_FISH = typeof GAME_FISH !== 'undefined' ? GAME_FISH.gold_karas : null;

  function castImageForLabel(label) {
    if (!label) return CAST_BTN_SRC.cast;
    const t = label.toLowerCase();
    if (t.includes('вытащ') || t.includes('тян')) return CAST_BTN_SRC.pull;
    if (t.includes('жди')) return CAST_BTN_SRC.wait;
    return CAST_BTN_SRC.cast;
  }

  function setStatus() {}

  function renderFishIcon() {
    const box = document.getElementById('fight-fish-icon');
    if (!box) return;
    if (FIGHT_DISPLAY_FISH && typeof FishSprites !== 'undefined') {
      const html = FishSprites.renderHtml(FIGHT_DISPLAY_FISH, 'sm');
      if (html) {
        box.innerHTML = html;
        return;
      }
    }
    box.innerHTML = FIGHT_MARKER_HTML;
  }

  function showFight(show) {
    document.getElementById('fight-ui')?.classList.toggle('hidden', !show);
    document.body.classList.toggle('fight-active', show);
    const nameEl = document.getElementById('fight-fish-name');
    if (nameEl && FIGHT_DISPLAY_FISH) nameEl.textContent = FIGHT_DISPLAY_FISH.name;
    if (show) renderFishIcon();
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
      marker.classList.toggle('fight-reel__fish--pulling', pulling);
      marker.classList.toggle('fight-reel__fish--drifting', !pulling);
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
    renderFishIcon();
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
