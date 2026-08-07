/* ============================================================
   hero-autoplay.js — пока пользователь не тронул скролл/демо сам,
   телефон в hero-акте сам проигрывает ВЕСЬ процесс по кругу
   (гость → касса → кухня → директор → гость…), чтобы результат
   был виден сразу при заходе на сайт, целиком, без необходимости
   скроллить. Крутит настоящую цепочку hero-demo.js (enterRole()),
   а не урезанный гостевой повтор — так же дорого выглядит и без
   скролла, как и после него. Останавливается насовсем при первом
   реальном уходе скролла из hero-акта (см. story/) или любом клике
   внутри демо/по переключателю ролей — дальше решает либо скролл,
   либо сам гость. Кнопки "Смотреть демо"/"Как это работает"
   (href="#story") перезапускают показ с начала.

   Контракт с остальными модулями остаётся глобальным
   (window.YJ_HERO_AUTOPLAY) — его читает hero-demo.js и сценарии
   Story; переводить его в импорты нельзя, не трогая hero-demo.js.
   ============================================================ */
import { prefersReduced } from '../lib/breakpoints.js';

export function initHeroAutoplay() {
  if (!window.YJ_HERO_DEMO || prefersReduced()) return;

  const startHeroAutoplay = window.YJ_HERO_DEMO.startFullAutoplay;
  const stopHeroAutoplay = window.YJ_HERO_DEMO.stopFullAutoplay;

  window.YJ_HERO_AUTOPLAY = { start: startHeroAutoplay, stop: stopHeroAutoplay };

  window.addEventListener('yj:manual-role', stopHeroAutoplay);
  const heroDemoEl = document.getElementById('heroDemo');
  if (heroDemoEl) heroDemoEl.addEventListener('pointerdown', stopHeroAutoplay, { once: true });

  // Клик может запустить smooth-scroll издалека — по пути скролл-контроллер
  // проходит через промежуточные акты и тут же остановит автоплей (см. story/core.js
  // drive()), поэтому перезапускаем и сразу, и повторно после того, как скролл
  // реально осядет на hero-акте.
  document.querySelectorAll('a[href="#story"]').forEach(function (link) {
    link.addEventListener('click', function () {
      startHeroAutoplay();
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', startHeroAutoplay, { once: true });
      } else {
        window.setTimeout(startHeroAutoplay, 700);
      }
    });
  });

  startHeroAutoplay();
}
