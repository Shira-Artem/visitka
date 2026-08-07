/* ============================================================
   story/desktop.js — Story на десктопе: один телефон, sticky от Hero
   до акта «Директор». Механика прогресса — общая, из lib/scroll-scene.js;
   здесь только то, чем Story отличается от других pin-сцен:
   под-состояния актов, непрерывная глава «Касса» и ручной перехват,
   когда гость сам щёлкает по ролям в телефоне.
   ============================================================ */
import { pickIndex } from '../../lib/motion.js';
import { createPinnedScene } from '../../lib/scroll-scene.js';
import { STORY_ACTS } from './config.js';

export function setupDesktop(core) {
  const lastSub = STORY_ACTS.map(function () { return 0; });
  let manualOverride = false;
  let overrideActIndex = -1;
  let lastActIndex = 0;

  function onManualRole(e) {
    manualOverride = true;
    overrideActIndex = lastActIndex;
    if (e && e.detail) core.applyAura(e.detail.role);
  }

  const scene = createPinnedScene({
    track: core.track,
    acts: STORY_ACTS,
    hysteresis: 0.12,
    // Keep chapter boundaries exact so the cash-only receipt can never leak
    // into selection or checkout while the user reverses the scroll.
    exactFloorRange: [1, 4],
    onTick: function (state) {
      if (manualOverride) {
        if (state.actIndex !== overrideActIndex) {
          manualOverride = false;
        } else {
          return false; // пользователь исследует кабинет вручную — скролл не вмешивается
        }
      }

      const act = state.act;
      const localP = state.localP;
      let subIndex = 0;
      if (act.id === 'cash') {
        subIndex = localP < 0.40 ? 0 : (localP < 0.75 ? 1 : 2);
      } else if (act.states.length > 1) {
        subIndex = pickIndex(localP * (act.states.length - 1), lastSub[state.actIndex], act.states.length, 0.12);
      }

      // The cashier chapter is continuous: CSS values are interpolated from
      // scroll progress even between the three unchanged phone states.
      core.setCashTimeline(act.id === 'cash' ? localP : 0);

      if (state.isNewAct || subIndex !== lastSub[state.actIndex]) {
        lastActIndex = state.actIndex;
        lastSub[state.actIndex] = subIndex;
        core.drive(state.actIndex, subIndex);
      }
    }
  });

  window.addEventListener('yj:manual-role', onManualRole);
  // Keep the neutral initial phase explicit without resetting the phone's
  // existing hero state; tick() will replace it immediately on deep links.
  core.applyPanel(0);
  scene.tick();

  return function cleanup() {
    scene.destroy();
    window.removeEventListener('yj:manual-role', onManualRole);
  };
}
