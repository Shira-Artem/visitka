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
import { initMobileProductJourney } from './modules/mobile-product-journey.js';

function bootLanding() {
  initChrome();
  initHeroAutoplay();
  initWays();
  initHeroPhone();
  initStory();
  initMobileProductJourney();
}

// The GSAP UMD bundles above are deferred classic scripts. Waiting for DOMContentLoaded
// preserves their document order before mobile modules read window.gsap/ScrollTrigger.
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootLanding, { once: true });
} else {
  bootLanding();
}
