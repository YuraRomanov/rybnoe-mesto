/** Finite State Machine — enter / update / exit */
const GameFSM = (() => {
  const states = new Map();
  let current = null;
  let ctx = null;
  let time = 0;

  function register(name, handlers) {
    states.set(name, {
      enter: handlers.enter || (() => {}),
      update: handlers.update || (() => {}),
      exit: handlers.exit || (() => {}),
    });
  }

  function init(context, initial) {
    ctx = context;
    time = 0;
    transition(initial, { initial: true });
  }

  function transition(next, payload = {}) {
    if (current === next) return;
    const prev = current;
    if (current && states.has(current)) {
      states.get(current).exit(ctx, payload);
      GameEvents.emit(EV.STATE_EXIT, { from: current, to: next, ctx, ...payload });
    }
    current = next;
    if (states.has(current)) {
      states.get(current).enter(ctx, payload);
      GameEvents.emit(EV.STATE_ENTER, { state: current, from: prev, ctx, ...payload });
    }
    GameEvents.emit(EV.STATE_CHANGE, { from: prev, to: current, ctx, ...payload });
  }

  function update(dt) {
    time += dt;
    if (current && states.has(current)) {
      states.get(current).update(ctx, dt, time);
    }
    return current;
  }

  function getState() { return current; }

  return { register, init, transition, update, getState };
})();
