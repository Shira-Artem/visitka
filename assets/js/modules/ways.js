/* ============================================================
   ways.js — «Способы получения заказа»: закреплённая scroll-сцена (~300vh).

   .ways__track держит общую высоту, .ways__stage — sticky (та же
   архитектура, что у Story). На каждом шаге прогресса подсвечивается
   один способ (.is-active + мини-демо), остальные два отходят назад
   в 3D (.is-receded). В финале сцена возвращает карточки в нейтральное
   состояние и подставляет в h2/eyebrow фразу «Один сервис. Любой способ
   получить заказ.». На мобильном/reduced-motion пин отключается
   (см. sections/adaptive.css) — карточки просто получают fade-up.

   Механика прогресса общая с Story и живёт в lib/scroll-scene.js.
   ============================================================ */
import { bp, prefersReduced } from '../lib/breakpoints.js';
import { createPinnedScene } from '../lib/scroll-scene.js';
import { createLayoutSwitch } from '../lib/layout-switch.js';

const WAYS_ACTS = [
  { id: 'intro',    vh: 40 },
  { id: 'pickup',   vh: 65 },
  { id: 'delivery', vh: 65 },
  { id: 'table',    vh: 65 },
  { id: 'outro',    vh: 65 }
];
const WAYS_ACTIVE_INDEX = { intro: -1, pickup: 0, delivery: 1, table: 2, outro: -1 };
const WAYS_HEAD_DEFAULT = {
  eyebrow: 'Как получить заказ',
  headline: 'Выбирай,<br><span class="grad-text">как удобно</span>',
  lead: 'Один Mini App — три способа получить заказ. Гость выбирает сам, заведение ведёт все заказы в одной системе.'
};
const WAYS_HEAD_OUTRO = {
  eyebrow: 'Один сервис',
  headline: 'Любой способ<br><span class="grad-text">получить заказ</span>',
  lead: ''
};

export function initWays() {
  const waysTrack = document.getElementById('waysTrack');
  const waysStage = document.getElementById('waysStage');
  const wayCards = [].slice.call(document.querySelectorAll('[data-way-card]'));

  if (wayCards.length) {
    // Fade-up при появлении в кадре — единственная анимация на мобильном
    // потоке и мягкий вход перед тем, как на десктопе scroll-контроллер
    // ниже возьмёт карточки под управление.
    if ('IntersectionObserver' in window) {
      const wayIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            wayIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -6% 0px' });
      wayCards.forEach(function (card) { wayIo.observe(card); });
    } else {
      wayCards.forEach(function (card) { card.classList.add('in-view'); });
    }
  }

  if (!waysTrack || !waysStage || !wayCards.length) return null;

  const wayBlobs = [].slice.call(document.querySelectorAll('[data-way-blob]'));
  const waySteps = [].slice.call(document.querySelectorAll('[data-way-step]'));
  const waysProgressEl = document.getElementById('waysProgress');
  const waysEyebrowEl = document.getElementById('waysEyebrow');
  const waysHeadlineEl = document.getElementById('waysHeadline');
  const waysLeadEl = document.getElementById('waysLead');

  function playWayDemo(card) {
    const demo = card.querySelector('[data-way-demo]');
    if (!demo) return;
    demo.classList.remove('is-playing');
    void demo.offsetWidth;
    demo.classList.add('is-playing');
  }
  function stopWayDemo(card) {
    const demo = card.querySelector('[data-way-demo]');
    if (demo) demo.classList.remove('is-playing');
  }

  function applyWaysAct(actIndex) {
    const act = WAYS_ACTS[actIndex];
    const activeIndex = WAYS_ACTIVE_INDEX[act.id];
    const isOutro = act.id === 'outro';

    wayCards.forEach(function (card, i) {
      const isActive = i === activeIndex;
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-receded', activeIndex !== -1 && !isActive);
      if (isActive) playWayDemo(card); else stopWayDemo(card);
    });

    wayBlobs.forEach(function (blob, i) {
      blob.classList.toggle('is-active', i === activeIndex);
    });

    waySteps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === activeIndex);
    });
    if (waysProgressEl) {
      const filled = isOutro ? 3 : Math.max(0, activeIndex + 1);
      waysProgressEl.style.setProperty('--rail-progress', filled / 3);
      waysProgressEl.classList.toggle('is-complete', isOutro);
    }

    if (waysEyebrowEl && waysHeadlineEl && waysLeadEl) {
      const copy = isOutro ? WAYS_HEAD_OUTRO : WAYS_HEAD_DEFAULT;
      waysEyebrowEl.textContent = copy.eyebrow;
      waysHeadlineEl.innerHTML = copy.headline;
      waysLeadEl.textContent = copy.lead;
    }
    waysStage.classList.toggle('is-outro', isOutro);
    if (activeIndex === -1) {
      waysStage.removeAttribute('data-way-mood');
    } else {
      waysStage.setAttribute('data-way-mood', String(activeIndex));
    }
  }

  function setupPinned() {
    const scene = createPinnedScene({
      track: waysTrack,
      acts: WAYS_ACTS,
      hysteresis: 0.1,
      // Внутри средних актов граница держится точной, иначе rawAct вида 3.6
      // (61.5% полосы «table») округляется в 4 (outro), и карточка сцены
      // переключается на середине своей полосы, а не в конце.
      exactFloorRange: [1, WAYS_ACTS.length - 1],
      onTick: function (state) {
        if (state.isNewAct) applyWaysAct(state.actIndex);
      }
    });

    applyWaysAct(0);
    scene.tick();

    return function cleanup() {
      scene.destroy();
    };
  }

  function setupFlow() {
    waysTrack.style.removeProperty('height');
    wayCards.forEach(function (card) {
      card.classList.remove('is-active', 'is-receded');
      stopWayDemo(card);
    });
    waysStage.classList.remove('is-outro');
    waysStage.removeAttribute('data-way-mood');

    // Без пина карточки идут обычным потоком — каждая получает .is-active
    // насовсем, как только на треть попала в кадр, и мини-демо проигрывается
    // один раз.
    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-active');
          playWayDemo(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
      wayCards.forEach(function (card) { io.observe(card); });
    } else {
      wayCards.forEach(function (card) { card.classList.add('is-active'); playWayDemo(card); });
    }

    return function cleanup() {
      if (io) io.disconnect();
    };
  }

  return createLayoutSwitch(
    function () { return (!bp.is('desktop') || prefersReduced()) ? 'flow' : 'pinned'; },
    { pinned: setupPinned, flow: setupFlow }
  );
}
