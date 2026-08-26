/* ============================================================
   story/mobile-flow.js — потоковая Story: ≤980px и reduced-motion.

   Пина нет, телефон один и тот же, карточки актов идут обычным потоком.
   Активный акт выбирает IntersectionObserver, а не прогресс скролла;
   применяет его всё то же core.js.
   ============================================================ */
import { ACT_ROLE, MOBILE_ACT_STATE, HOW_COPY, KITCHEN_CHIP } from './config.js';

export function setupMobileFlow(core, options) {
  const storyStage = core.stage;
  const storyTrack = core.track;
  const actPanels = core.panels;
  // Блок 1 (≤768px) монтирует свою hero-подпись поверх этого потока
  // (см. mobile-story.js) и хочет, чтобы телефон при этом сразу показывал
  // «Директора» — самый сильный product visual блока — а не гостевой экран,
  // с которого начинает раскладка 769…980px.
  const heroState = options && options.heroState;

  storyTrack.style.removeProperty('height');
  core.clearCashTimeline();
  storyStage.removeAttribute('data-story-act');
  storyStage.removeAttribute('data-cash-step');
  storyStage.removeAttribute('data-order-phase');

  let io = null;
  let revealIo = null;

  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const actId = entry.target.getAttribute('data-act');
        if (actId !== 'hero' && window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
        storyStage.setAttribute('data-story-act', actId);
        // Hero is an entry panel, not a scroll-act on mobile: keeping it
        // active prevents desktop visibility rules from blanking the offer
        // when a later card becomes the active demo state.
        actPanels.forEach(function (p) {
          p.classList.toggle('is-active', p === entry.target || p.getAttribute('data-act') === 'hero');
        });
        if (actId === 'how' && core.howKicker && core.howHeadline) {
          const mobileHowCopy = HOW_COPY[MOBILE_ACT_STATE.how];
          core.howKicker.textContent = mobileHowCopy.kicker;
          core.howHeadline.textContent = mobileHowCopy.headline;
        }
        if (actId === 'kitchen' && core.kitchenChip) {
          core.kitchenChip.textContent = KITCHEN_CHIP[MOBILE_ACT_STATE.kitchen];
        }
        core.applyAura(ACT_ROLE[actId]);
        if (actId === 'hero' && heroState) {
          window.YJ_HERO_DEMO.applyState(heroState.role, heroState.state);
        } else {
          window.YJ_HERO_DEMO.applyState(ACT_ROLE[actId], MOBILE_ACT_STATE[actId]);
        }
      });
    }, { threshold: 0.5 });

    actPanels.forEach(function (p) { io.observe(p); });

    // Отдельный, более ранний триггер только для fade-in карточки — не завязан
    // на состояние телефона, поэтому карта успевает проявиться до смены роли.
    revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    actPanels.forEach(function (p) {
      if (p.getAttribute('data-act') !== 'hero') revealIo.observe(p);
    });
  } else {
    actPanels.forEach(function (p) { p.classList.add('in-view'); });
  }

  actPanels.forEach(function (p, i) { p.classList.toggle('is-active', i === 0); });
  core.applyAura(heroState ? heroState.role : 'guest');
  storyStage.setAttribute('data-story-act', 'hero');
  storyStage.setAttribute('data-cash-step', '');
  storyStage.setAttribute('data-order-phase', 'hero');
  storyStage.style.setProperty('--cash-progress', 0);
  if (heroState) {
    window.YJ_HERO_DEMO.applyState(heroState.role, heroState.state);
  } else {
    window.YJ_HERO_DEMO.applyState('guest', 'venue');
  }

  return function cleanup() {
    if (io) io.disconnect();
    if (revealIo) revealIo.disconnect();
  };
}
