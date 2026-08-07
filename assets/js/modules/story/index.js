/* ============================================================
   story/index.js — выбор раскладки Story и точка входа секции.

   Границы раскладок объявлены в tokens.css (--bp):
     ≤768px (mobile/phone) — закреплённая мобильная Story «Свет заказа»,
     769…980px (compact)   — прежний потоковый вариант,
     ≥981px (desktop)      — пин-сцена.
   reduced-motion всегда уводит в потоковый вариант, кроме мобильной
   Story, у которой есть собственный reduced-режим в CSS.
   ============================================================ */
import { bp, prefersReduced } from '../../lib/breakpoints.js';
import { createLayoutSwitch } from '../../lib/layout-switch.js';
import { createStoryCore } from './core.js';
import { setupDesktop } from './desktop.js';
import { setupMobileStory } from './mobile-story.js';
import { setupMobileFlow } from './mobile-flow.js';

export function initStory() {
  const core = createStoryCore();
  if (!core) return null;

  /* Мобильное демо: ссылка не прыгает по якорю, а мягко подводит к сцене,
     которой дальше управляет палец читателя. */
  const mobileDemoLink = document.querySelector('[data-mobile-demo-link]');
  const mobileDemoStage = document.getElementById('mobileDemoStage');
  if (mobileDemoLink && mobileDemoStage) {
    mobileDemoLink.addEventListener('click', function (event) {
      if (!bp.is('phone')) return;
      event.preventDefault();
      // The mobile demo is deliberately driven by the reader's scroll. The
      // desktop hero autoplay may already be running, so freeze it on the
      // first guest screen before revealing the scroll-story.
      if (window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
      window.YJ_HERO_DEMO.applyState('guest', 'venue');
      mobileDemoStage.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  return createLayoutSwitch(
    function () {
      if (bp.atMost('mobile')) return 'mobile-story';
      if (prefersReduced() || !bp.is('desktop')) return 'flow';
      return 'desktop';
    },
    {
      'mobile-story': function () { return setupMobileStory(core); },
      flow: function () { return setupMobileFlow(core); },
      desktop: function () { return setupDesktop(core); }
    }
  );
}
