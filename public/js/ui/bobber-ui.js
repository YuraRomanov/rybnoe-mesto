/** DOM-поплавок — позиция на воде озера (фон lake.png) */
const BobberUI = (() => {
  const BOBBER_SRC = 'assets/ui/hud/bobber.png?v=5';
  const WATER_SPOT = { x: 50, y: 56 };
  const CAST_START = { x: 62, y: 70 };
  const CENTER = WATER_SPOT;

  let el = null;
  let targetPct = { ...CENTER };
  let displayPct = { ...CENTER };

  function applyPosition() {
    if (!el) return;
    el.style.left = `${displayPct.x}%`;
    el.style.top = `${displayPct.y}%`;
  }

  function init() {
    el = document.getElementById('bobber');
    if (!el) return;
    const img = el.querySelector('.bobber-img');
    if (img) img.src = BOBBER_SRC;
    hide();
  }

  function show() {
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = '';
    el.setAttribute('aria-hidden', 'false');
    center();
  }

  function hide() {
    if (!el) return;
    el.classList.add('hidden');
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    setState('calm');
  }

  function center() {
    position(CENTER.x, CENTER.y);
    displayPct = { ...CENTER };
    applyPosition();
  }

  function setState(state) {
    if (!el) return;
    el.className = `bobber bobber--${state}`;
    el.dataset.state = state;
    const img = el.querySelector('.bobber-img');
    if (img) img.src = BOBBER_SRC;
  }

  function position(pctX, pctY) {
    targetPct = { x: pctX, y: pctY };
  }

  function tick(smooth = 0.2) {
    displayPct.x += (targetPct.x - displayPct.x) * smooth;
    displayPct.y += (targetPct.y - displayPct.y) * smooth;
    applyPosition();
  }

  function getDisplayPct() {
    return { ...displayPct };
  }

  return {
    init, show, hide, setState, position, center, tick, getDisplayPct,
    CENTER, WATER_SPOT, CAST_START,
  };
})();
