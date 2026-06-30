/**
 * FishingController — FSM рыбалки
 * Заброс → Жди → Тяни (поклёвка) → вываживание (удерживай кнопку)
 */
const FSM = {
  IDLE: 'IDLE',
  CAST_FLIGHT: 'CAST_FLIGHT',
  WAITING: 'WAITING',
  BITE: 'BITE',
  FIGHT_FISH: 'FIGHT_FISH',
  REEL_IN: 'REEL_IN',
};

const FishingController = (() => {
  let ctx = null;
  let bridge = null;
  let holdingFight = false;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  }

  function createContext() {
    return {
      fish: null,
      modifiers: {},
      waitSec: 0,
      waitElapsed: 0,
      biteWindowSec: 0,
      biteElapsed: 0,
      fight: {},
      bobberPct: { x: 50, y: 56 },
      castStart: null,
      castTarget: null,
      castFlight: 0,
      reelFlight: 0,
      reelStart: null,
      reelTarget: null,
    };
  }

  function rollFishWeight(fish) {
    const minW = fish.minW;
    const maxW = Math.max(minW + 0.02, fish.maxW);
    const w = minW + GameRNG.random() * (maxW - minW);
    return Math.round(w * 1000) / 1000;
  }

  function pickFish() {
    const loc = bridge.getLocation();
    const mods = GearSystem.getModifiers(bridge.getPlayer());
    ctx.modifiers = mods;
    const table = GameRNG.buildFishTable(loc, mods.biteBonus, FISH);
    const entry = GameRNG.pickWeighted(table.map((t) => ({ ...t, weight: t.weight })));
    const fish = { ...entry.fish };
    fish.weight = rollFishWeight(fish);
    const baseRarity = entry.rarity || 'common';
    const rarity = GameRNG.rollRarity(baseRarity, {
      rareBonus: mods.rareBonus,
      luck: mods.luck * 0.01,
    });
    ctx.fish = fish;
    ctx.fight = { rarity };
    return fish;
  }

  function registerStates() {
    GameFSM.register(FSM.IDLE, {
      enter() {
        BobberUI.hide();
        FishingUI.showFight(false);
        FishingUI.setCastBtn(false, 'Забросить');
        FishingUI.setStatus('Готов к рыбалке');
      },
    });

    GameFSM.register(FSM.CAST_FLIGHT, {
      enter() {
        pickFish();
        ctx.waitSec = GameRNG.biteWaitSec(ctx.modifiers);
        ctx.waitElapsed = 0;
        const start = BobberUI.CAST_START;
        const target = BobberUI.WATER_SPOT;
        ctx.castStart = { ...start };
        ctx.castTarget = { ...target };
        ctx.castFlight = 0;
        ctx.bobberPct = { ...start };
        BobberUI.position(ctx.bobberPct.x, ctx.bobberPct.y);
        BobberUI.show();
        BobberUI.setState('idle');
        FishingUI.setCastBtn(true, 'Жди...');
        FishingUI.setStatus('Заброс...');
        GameEvents.emit(EV.CAST_START, { ctx });
      },
      update(c, dt) {
        const target = BobberUI.WATER_SPOT;
        ctx.castFlight = Math.min(1, (ctx.castFlight || 0) + dt * 0.028);
        const ease = easeInOutCubic(ctx.castFlight);
        const start = ctx.castStart || BobberUI.CAST_START;
        ctx.bobberPct.x = start.x + (target.x - start.x) * ease;
        ctx.bobberPct.y = start.y + (target.y - start.y) * ease;
        BobberUI.position(ctx.bobberPct.x, ctx.bobberPct.y);
        if (ctx.castFlight >= 1) {
          ctx.bobberPct = { ...target };
          GameFSM.transition(FSM.WAITING);
        }
      },
    });

    GameFSM.register(FSM.WAITING, {
      enter() {
        ctx.bobberPct = { ...BobberUI.WATER_SPOT };
        BobberUI.center();
        BobberUI.setState('calm');
        FishingUI.setCastBtn(true, 'Жди');
        FishingUI.setStatus('Жди поклёвки...');
      },
    });

    GameFSM.register(FSM.REEL_IN, {
      enter() {
        ctx.reelFlight = 0;
        ctx.reelStart = { ...ctx.bobberPct };
        ctx.reelTarget = { ...BobberUI.CAST_START };
        BobberUI.show();
        BobberUI.setState('idle');
        FishingUI.setCastBtn(true, 'Жди...');
        FishingUI.setStatus('Вытаскиваем...');
      },
      update(c, dt) {
        ctx.reelFlight = Math.min(1, (ctx.reelFlight || 0) + dt * 0.032);
        const ease = easeInOutCubic(ctx.reelFlight);
        const start = ctx.reelStart || BobberUI.WATER_SPOT;
        const target = ctx.reelTarget || BobberUI.CAST_START;
        ctx.bobberPct.x = start.x + (target.x - start.x) * ease;
        ctx.bobberPct.y = start.y + (target.y - start.y) * ease;
        BobberUI.position(ctx.bobberPct.x, ctx.bobberPct.y);
        if (ctx.reelFlight >= 1) {
          bridge.onReelIn?.(ctx);
          GameFSM.transition(FSM.IDLE);
        }
      },
    });

    GameFSM.register(FSM.BITE, {
      enter() {
        const t = GAME_CONFIG.timing;
        ctx.biteWindowSec = GameRNG.range(t.hookWindowMinSec + 1.5, t.hookWindowMaxSec + 4);
        ctx.biteElapsed = 0;
        BobberUI.setState('bite');
        FishingUI.setCastBtn(true, 'Тяни!');
        FishingUI.setStatus('Поклёвка! Жми «Тяни»');
        GameEvents.emit(EV.BITE_HOOK, { ctx });
      },
      update(c, dt) {
        ctx.biteElapsed += dt / 60;
        if (ctx.biteElapsed >= ctx.biteWindowSec) {
          bridge.onHookResult('fail', ctx);
          GameFSM.transition(FSM.IDLE);
        }
      },
      exit() {
        BobberUI.setState('calm');
      },
    });

    GameFSM.register(FSM.FIGHT_FISH, {
      enter(c, payload) {
        const grade = payload?.hookGrade || 'good';
        ctx.bobberPct = { ...BobberUI.WATER_SPOT };
        BobberUI.center();
        BobberUI.setState('fight');
        FightSystem.start(ctx, grade);
        FishingUI.showFight(true);
        FishingUI.setCastBtn(true, 'Тяни!');
        FishingUI.setStatus('Тяни к берегу!');
        FishingUI.updateFight(ctx);
      },
      update(c, dt) {
        const result = FightSystem.update(ctx, dt, holdingFight);
        FishingUI.updateFight(ctx);
        GameEvents.emit(EV.FIGHT_TICK, { ctx, result });
        if (result === 'win') {
          bridge.onFightWin(ctx);
          GameFSM.transition(FSM.IDLE);
        } else if (result === 'break') {
          bridge.onFightLose('break');
          GameFSM.transition(FSM.IDLE);
        } else if (result === 'escape') {
          bridge.onFightLose('escape');
          GameFSM.transition(FSM.IDLE);
        }
      },
      exit() {
        FishingUI.showFight(false);
        BobberUI.hide();
      },
    });
  }

  function tryStartCast() {
    if (GameFSM.getState() !== FSM.IDLE) return false;
    if (!bridge.spendEnergy(5)) return false;
    if (!bridge.consumeBait()) {
      bridge.refundEnergy?.(5);
      return false;
    }
    GameFSM.transition(FSM.CAST_FLIGHT);
    return true;
  }

  function hookAndFight() {
    if (GameFSM.getState() !== FSM.BITE) return;
    GameEvents.emit(EV.HOOK_RESULT, { grade: 'good', ctx });
    bridge.onHookResult('good', ctx);
    GameFSM.transition(FSM.FIGHT_FISH, { hookGrade: 'good' });
  }

  function reelIn() {
    const st = GameFSM.getState();
    if (st !== FSM.WAITING && st !== FSM.CAST_FLIGHT) return;
    GameFSM.transition(FSM.REEL_IN);
  }

  function onCastDown() {
    const st = GameFSM.getState();
    if (st === FSM.IDLE) {
      tryStartCast();
    } else if (st === FSM.WAITING || st === FSM.CAST_FLIGHT) {
      reelIn();
    } else if (st === FSM.BITE) {
      hookAndFight();
      holdingFight = true;
    } else if (st === FSM.FIGHT_FISH) {
      holdingFight = true;
    }
  }

  function onCastUp() {
    holdingFight = false;
  }

  function init(gameBridge) {
    bridge = gameBridge;
    ctx = createContext();
    registerStates();
    GameFSM.init(ctx, FSM.IDLE);
    BobberUI.init();
  }

  function update(dt = 1) {
    const st = GameFSM.getState();
    if (st === FSM.WAITING) {
      ctx.waitElapsed += dt / 60;
      if (ctx.waitElapsed >= ctx.waitSec) {
        GameFSM.transition(FSM.BITE);
      }
    }
    return GameFSM.update(dt);
  }

  function getState() { return GameFSM.getState(); }
  function getContext() { return ctx; }
  function isFishing() { return GameFSM.getState() !== FSM.IDLE; }

  return {
    FSM, init, update, onCastDown, onCastUp,
    getState, getContext, isFishing, tryStartCast,
  };
})();
