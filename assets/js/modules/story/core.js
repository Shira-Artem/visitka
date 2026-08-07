/* ============================================================
   story/core.js — единственный источник состояния Story.

   Три раскладки (desktop.js, mobile-story.js, mobile-flow.js) решают
   только ОДНО: какой акт сейчас активен. Применяет его всегда этот
   модуль — он единственный, кто трогает data-story-act, .is-active на
   панелях, ауру, шкалу и зовёт YJ_HERO_DEMO.applyState(). Второй копии
   этой логики быть не должно, иначе телефон и подписи разъедутся.
   ============================================================ */
import { clamp01, smoothRange } from '../../lib/motion.js';
import { clearVars } from '../../lib/css-vars.js';
import { STORY_ACTS, ACT_ROLE, HOW_COPY, KITCHEN_CHIP } from './config.js';

/* Переменные главы «Касса». Список объявлен один раз и используется
   и на запись, и на уборку — забыть почистить переменную нельзя. */
const CASH_VARS = [
  '--cash-progress', '--cash-intro', '--cash-paper', '--cash-head', '--cash-number',
  '--cash-received', '--cash-accept', '--cash-accepted', '--cash-line-1', '--cash-line-2',
  '--cash-line-3', '--cash-total', '--cash-sent', '--cash-status-progress'
];

export function createStoryCore() {
  const track = document.getElementById('storyTrack');
  const stage = document.getElementById('storyStage');
  if (!track || !stage || !window.YJ_HERO_DEMO) return null;

  const section = document.getElementById('story');
  const panels = [].slice.call(document.querySelectorAll('.story__act-panel'));
  const dotEls = [].slice.call(document.querySelectorAll('.story__dots span'));
  const dotsEl = document.getElementById('storyDots');
  const auraSpans = [].slice.call(document.querySelectorAll('.story__aura span'));
  const howKicker = document.getElementById('storyHowKicker');
  const howHeadline = document.getElementById('storyHowHeadline');
  const kitchenChip = document.getElementById('storyKitchenChip');

  /* Аура за телефоном красится под активную роль (гость/касса/кухня/директор) —
     единственная точка входа, вызывается из всех трёх раскладок. */
  function applyAura(role) {
    auraSpans.forEach(function (s) {
      s.classList.toggle('is-active', s.getAttribute('data-aura-role') === role);
    });
  }

  function setCashTimeline(progress) {
    const p = clamp01(progress);
    const sent = smoothRange(p, 0.32, 0.40);
    const received = smoothRange(p, 0.40, 0.55);
    const accepted = smoothRange(p, 0.75, 0.90);
    const statusProgress = p < 0.40 ? 0.32 * sent : (p < 0.75 ? 0.32 + 0.36 * received : 0.68 + 0.32 * accepted);
    // The receipt does not exist before this chapter. It feeds down first,
    // then its content and cashier statuses are drawn from the same progress.
    stage.style.setProperty('--cash-progress', p.toFixed(3));
    stage.style.setProperty('--cash-intro', smoothRange(p, 0, 0.15).toFixed(3));
    stage.style.setProperty('--cash-paper', smoothRange(p, 0.05, 0.24).toFixed(3));
    stage.style.setProperty('--cash-head', smoothRange(p, 0.09, 0.18).toFixed(3));
    stage.style.setProperty('--cash-number', smoothRange(p, 0.13, 0.22).toFixed(3));
    stage.style.setProperty('--cash-received', received.toFixed(3));
    stage.style.setProperty('--cash-accept', smoothRange(p, 0.55, 0.75).toFixed(3));
    stage.style.setProperty('--cash-accepted', accepted.toFixed(3));
    stage.style.setProperty('--cash-line-1', smoothRange(p, 0.18, 0.27).toFixed(3));
    stage.style.setProperty('--cash-line-2', smoothRange(p, 0.23, 0.32).toFixed(3));
    stage.style.setProperty('--cash-line-3', smoothRange(p, 0.28, 0.36).toFixed(3));
    stage.style.setProperty('--cash-total', smoothRange(p, 0.32, 0.42).toFixed(3));
    stage.style.setProperty('--cash-sent', sent.toFixed(3));
    stage.style.setProperty('--cash-status-progress', statusProgress.toFixed(3));
  }

  function clearCashTimeline() {
    clearVars(stage, CASH_VARS);
  }

  function applyPanel(actIndex) {
    const actId = STORY_ACTS[actIndex].id;
    stage.setAttribute('data-story-act', actId);
    stage.setAttribute('data-order-phase', actId);
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-act') === actId);
    });
    dotEls.forEach(function (d, i) {
      d.classList.toggle('is-active', i === actIndex);
    });
    if (dotsEl) {
      dotsEl.style.setProperty('--rail-progress', STORY_ACTS.length > 1 ? actIndex / (STORY_ACTS.length - 1) : 0);
    }
    applyAura(ACT_ROLE[actId]);
  }

  /* Единственная точка, которая двигает телефон: applyState() в hero-demo.js
     сама отменяет предыдущие таймеры/rAF и синхронно приводит DOM к состоянию —
     прыжковый скролл никогда не оставляет телефон на полпути. */
  function drive(actIndex, subIndex) {
    const act = STORY_ACTS[actIndex];
    if (act.id !== 'hero' && window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
    const sub = act.states[subIndex];
    stage.setAttribute('data-cash-step', act.id === 'cash' ? sub : '');
    applyPanel(actIndex);

    if (act.id === 'how' && howKicker && howHeadline) {
      const copy = HOW_COPY[sub] || HOW_COPY.venue;
      howKicker.textContent = copy.kicker;
      howHeadline.textContent = copy.headline;
    }
    if (act.id === 'kitchen' && kitchenChip) {
      kitchenChip.textContent = KITCHEN_CHIP[sub] || KITCHEN_CHIP.new;
    }

    window.YJ_HERO_DEMO.applyState(ACT_ROLE[act.id], act.id === 'hero' ? 'venue' : sub);
  }

  return {
    track: track,
    stage: stage,
    section: section,
    panels: panels,
    dotEls: dotEls,
    dotsEl: dotsEl,
    howKicker: howKicker,
    howHeadline: howHeadline,
    kitchenChip: kitchenChip,
    applyAura: applyAura,
    applyPanel: applyPanel,
    setCashTimeline: setCashTimeline,
    clearCashTimeline: clearCashTimeline,
    drive: drive
  };
}
