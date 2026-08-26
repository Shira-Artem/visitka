/* ============================================================
   story/desktop.js — Story на десктопе: один телефон, sticky от Hero
   до акта «Директор». Механика прогресса — общая, из lib/scroll-scene.js;
   здесь только то, чем Story отличается от других pin-сцен:
   под-состояния актов, непрерывная глава «Касса» и ручной перехват,
   когда гость сам щёлкает по ролям в телефоне.
   ============================================================ */
import { STORY_ACTS } from './config.js';

export function setupDesktop(core) {
  let manualOverride = false;
  let activeIndex = 0;

  function onManualRole(e) {
    manualOverride = true;
    if (e && e.detail) core.applyAura(e.detail.role);
  }

  const panels = Array.from(core.stage.querySelectorAll('[data-act]'));
  function activate(panel) {
    const index = panels.indexOf(panel);
    if (index < 0 || (manualOverride && index === activeIndex)) return;
    manualOverride = false;
    activeIndex = index;
    panels.forEach((item) => item.classList.toggle('is-active', item === panel));
    const act = STORY_ACTS[index];
    core.setCashTimeline(act && act.id === 'cash' ? 1 : 0);
    core.drive(index, act && act.id === 'cash' ? 1 : 0);
  }

  core.track.style.removeProperty('height');
  core.stage.style.removeProperty('height');
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        .forEach((entry) => activate(entry.target));
    }, { threshold: [0.35, 0.6], rootMargin: '-8% 0px -8% 0px' });
    panels.forEach((panel) => io.observe(panel));
  }

  window.addEventListener('yj:manual-role', onManualRole);
  // Keep the neutral initial phase explicit without resetting the phone's
  // existing hero state; tick() will replace it immediately on deep links.
  core.applyPanel(0);
  if (panels[0]) activate(panels[0]);

  return function cleanup() {
    if (io) io.disconnect();
    window.removeEventListener('yj:manual-role', onManualRole);
  };
}
