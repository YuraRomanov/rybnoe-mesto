/** DOM-поплавок — позиция на воде озера (фон lake.png) */
const BobberUI = (() => {
  const BOBBER_SRC = 'assets/ui/hud/bobber.png?v=10';
  const WATER_SPOT = { x: 50, y: 55 };
  const CAST_START = { x: 54, y: 64 };
  const FIGHT_PULL = { x: 53, y: 70 };
  const CENTER = WATER_SPOT;

  let el = null;
  let targetPct = { ...CENTER };
  let displayPct = { ...CENTER };
  let state = 'calm';

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

  function show(resetPosition = true) {
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = '';
    el.setAttribute('aria-hidden', 'false');
    if (resetPosition) center();
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

  function setState(next) {
    state = next;
    if (!el) return;
    const wasHidden = el.classList.contains('hidden');
    el.classList.remove(
      'bobber--calm', 'bobber--idle', 'bobber--windup', 'bobber--flight',
      'bobber--nibble', 'bobber--bite', 'bobber--fight',
    );
    el.classList.add(`bobber--${next}`);
    el.dataset.state = next;
    if (wasHidden) el.classList.add('hidden');
    const img = el.querySelector('.bobber-img');
    if (img) img.src = BOBBER_SRC;
  }

  function getState() {
    return state;
  }

  function position(pctX, pctY) {
    targetPct = { x: pctX, y: pctY };
  }

  function setPositionImmediate(pctX, pctY) {
    targetPct = { x: pctX, y: pctY };
    displayPct = { x: pctX, y: pctY };
    applyPosition();
  }

  function setPulling(pulling) {
    if (!el) return;
    el.classList.toggle('bobber--fight-pull', Boolean(pulling));
  }

  function tick(smooth = 0.2) {
    const rate = state === 'flight' ? 0.55 : state === 'windup' ? 0.5 : state === 'fight' ? 0.45 : 0.2;
    displayPct.x += (targetPct.x - displayPct.x) * rate;
    displayPct.y += (targetPct.y - displayPct.y) * rate;
    applyPosition();
  }

  function getDisplayPct() {
    return { ...displayPct };
  }

  return {
    init, show, hide, setState, getState, position, setPositionImmediate, setPulling,
    center, tick, getDisplayPct,
    CENTER, WATER_SPOT, CAST_START, FIGHT_PULL,
  };
})();
