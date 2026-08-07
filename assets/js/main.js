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

initChrome();
initHeroAutoplay();
initWays();
initHeroPhone();
initStory();
