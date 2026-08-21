/* ============================================================
   main.js — точка входа лендинга ЮртаНеЖди.
   Без внешних зависимостей: нативные ES-модули + IntersectionObserver.

   Здесь только порядок запуска. Вся логика — в modules/, общая
   механика — в lib/. Телефон и его внутренние экраны живут отдельно
   в hero-demo.js (обычный скрипт, грузится раньше и выставляет
   window.YJ_HERO_DEMO).

   Порядок важен в одном месте: hero-autoplay выставляет
   window.YJ_HERO_AUTOPLAY, на который смотрят сценарии Story, —
   поэтому Story инициализируется после него.
   ============================================================ */
import { initChrome } from './modules/chrome.js';
import { initHeroAutoplay } from './modules/hero-autoplay.js';
import { initHeroPhone } from './modules/hero-phone.js';
import { initWays } from './modules/ways.js';
import { initStory } from './modules/story/index.js';
import { initCatJourney } from './modules/cat-journey/index.js';

function bootLanding() {
  // The approved desktop direction has its own natural-flow composition.
  // Legacy Story/Ways remain the separate mobile implementation only.
  if (document.querySelector('.desktop-site') && window.matchMedia('(min-width: 901px)').matches) return;

  // Mobile browsers resize the viewport when the address bar/toolbar hides or
  // shows *while the page is mid-scroll*. By default ScrollTrigger reacts to
  // that as a real resize and re-measures every pinned scene (cat-journey on
  // mobile; Story/Ways pin only on desktop, where this doesn't apply) right
  // under the reader's finger, which snaps the pinned frame and reads as the
  // section "grabbing" the scroll. This flag is GSAP's documented switch for
  // exactly that: ignore resizes caused by mobile chrome show/hide, keep
  // reacting to real orientation/width changes.
  if (window.ScrollTrigger) window.ScrollTrigger.config({ ignoreMobileResize: true });

  initChrome();
  initHeroAutoplay();
  initWays();
  initHeroPhone();
  initStory();
  initCatJourney();
}

// The GSAP UMD bundles above are deferred classic scripts. Waiting for DOMContentLoaded
// preserves their document order before mobile modules read window.gsap/ScrollTrigger.
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootLanding, { once: true });
} else {
  bootLanding();
}
