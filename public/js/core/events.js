/** Event Bus — event-driven ядро */
const GameEvents = (() => {
  const listeners = new Map();

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event)?.delete(fn);
  }

  function emit(event, payload) {
    listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('[GameEvents]', event, e); }
    });
  }

  return { on, emit };
})();

const EV = {
  STATE_ENTER: 'state:enter',
  STATE_EXIT: 'state:exit',
  STATE_CHANGE: 'state:change',
  CAST_START: 'cast:start',
  CAST_RELEASE: 'cast:release',
  BITE_WARNING: 'bite:warning',
  BITE_HOOK: 'bite:hook',
  HOOK_RESULT: 'hook:result',
  FIGHT_TICK: 'fight:tick',
  FIGHT_WIN: 'fight:win',
  FIGHT_LOSE: 'fight:lose',
  CATCH: 'catch:complete',
  UI_UPDATE: 'ui:update',
};
