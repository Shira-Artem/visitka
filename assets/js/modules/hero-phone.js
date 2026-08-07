/* ============================================================
   hero-phone.js — движение корпуса телефона в hero:
   медленный float + параллакс за курсором на десктопе.
   Внутренние экраны телефона — hero-demo.js, здесь только корпус.
   ============================================================ */
import { bp, prefersReduced } from '../lib/breakpoints.js';

export function initHeroPhone() {
  const heroPhone = document.getElementById('heroPhone');
  if (!heroPhone || prefersReduced()) return;

  const hero = document.getElementById('story');
  const target = { x: 0, y: 0, rx: 0, ry: 0 };
  const current = { x: 0, y: 0, rx: 0, ry: 0 };
  const motionStart = performance.now();

  function resetHeroPhone() {
    target.x = 0; target.y = 0; target.rx = 0; target.ry = 0;
  }

  function onHeroPointer(e) {
    if (!bp.is('desktop') || !hero) {
      resetHeroPhone();
      return;
    }
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    target.x = x * 12;
    target.y = y * -7;
    target.rx = y * -2.2;
    target.ry = x * 3;
  }

  function renderHeroPhone(now) {
    const t = (now - motionStart) / 1000;
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    current.rx += (target.rx - current.rx) * 0.08;
    current.ry += (target.ry - current.ry) * 0.08;

    // Base tilt stays fixed (no idle sine jitter on rotation) so the phone's
    // text renders crisp at rest — sub-pixel rotation every frame is what
    // made it look permanently smudged. Only the deliberate float (Y) and
    // deliberate pointer parallax move continuously.
    const floatY = Math.sin(t * 1.05) * 6;
    const rotateX = 1 + current.rx;
    const rotateY = -2.4 + current.ry;

    heroPhone.style.transform =
      'translate3d(' + current.x.toFixed(2) + 'px,' + (floatY + current.y).toFixed(2) + 'px,0) ' +
      'rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';

    requestAnimationFrame(renderHeroPhone);
  }

  if (hero) {
    hero.addEventListener('pointermove', onHeroPointer, { passive: true });
    hero.addEventListener('pointerleave', resetHeroPhone);
  }
  bp.onChange(resetHeroPhone);
  requestAnimationFrame(renderHeroPhone);

  // Тактильный "pop" при ручном клике по роли — на отдельном CSS-свойстве `scale`,
  // не на `transform` (которым каждый кадр владеет rAF выше), поэтому анимации не
  // конфликтуют: браузер компонует scale и transform независимо.
  window.addEventListener('yj:manual-role', function () {
    heroPhone.classList.remove('is-pulse');
    void heroPhone.offsetWidth;
    heroPhone.classList.add('is-pulse');
  });
}
