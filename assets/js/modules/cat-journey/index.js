/* ============================================================
   cat-journey/index.js — «Котик уже не ждёт» (блок3), пин-сцена
   на GSAP + ScrollTrigger + DrawSVG + MotionPath.

   Вся сцена живёт внутри gsap.matchMedia(): условие "isLive"
   (≤768px, тот же порог, что у мобильной Story-кинематографии) и
   "reduceMotion" — при их несовпадении JS вообще не трогает DOM,
   секция остаётся статичным стеком из cat-journey.css. Когда
   брейкпоинт/настройка меняются на лету, matchMedia сам вызывает
   cleanup-функцию, которую возвращает обработчик — второй копии
   этой логики нигде нет (единственный источник состояния).

   Состояние акта пишется как data-cat-act на .cat-journey__scene —
   тот же приём, что data-order-phase в story.css: JS отвечает
   только за прогресс, вся визуальная реакция — в CSS.
   ============================================================ */
import { ACTS, TOTAL_VH } from './config.js';

const ROOT_SELECTOR = '.cat-journey';

export function initCatJourney() {
  const root = document.querySelector(ROOT_SELECTOR);
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!root || !gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger, window.DrawSVGPlugin, window.MotionPathPlugin);

  const scene = root.querySelector('.cat-journey__scene');
  const visuals = root.querySelector('.cat-journey__visuals');
  const path = root.querySelector('.cat-journey__route-path');
  const glow = root.querySelector('.cat-journey__route-glow');
  const trail = root.querySelector('.cat-journey__route-trail');
  const dot = root.querySelector('.cat-journey__route-dot');
  const flash = root.querySelector('.cat-journey__flash');
  const wraps = gsap.utils.toArray(root.querySelectorAll('.cat-journey__cat-wrap'));
  const innerCats = gsap.utils.toArray(root.querySelectorAll('.cat-journey__cat'));
  const hearts = gsap.utils.toArray(root.querySelectorAll('.cat-journey__heart'));
  if (!scene || !visuals || !path || !trail || !dot || wraps.length !== 3) return;

  // Три тона атмосферы — от нейтрального к тёплому, каждый шаг синхронен
  // со сменой акта, а не просто линейный дрейф через всю сцену.
  const BASE_BG = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#fbfaf8';
  const MID_BG = '#fff2ec';
  const WARM_BG = '#ffe6d5';

  const mm = gsap.matchMedia();

  mm.add(
    {
      isLive: '(max-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isLive, reduceMotion } = context.conditions;
      if (!isLive || reduceMotion) return undefined;

      root.classList.add('cat-journey--live');
      scene.setAttribute('data-cat-act', '1');

      // Обёртки (.cat-journey__cat-wrap) — тем управляет таймлайн (смена
      // акта: autoAlpha/y/scale/rotation). Сами картинки внутри дышат
      // независимо (idle ниже) — два разных элемента, твины не конфликтуют.
      gsap.set(wraps, { autoAlpha: 0, scale: 0.9, y: 16, rotation: 6 });
      gsap.set(wraps[0], { autoAlpha: 1, scale: 1, y: 0, rotation: 0 });
      gsap.set([path, glow], { drawSVG: '0%' });
      gsap.set(trail, { drawSVG: '0% 0%' });
      gsap.set(hearts, { autoAlpha: 0, y: 6, scale: 0.4 });
      gsap.set(scene, { backgroundColor: BASE_BG });
      gsap.set(visuals, { boxShadow: '0 0 0px 0px rgba(255,90,31,0)' });

      // «Дыхание» активного кота — лёгкая пульсация масштаба + покачивание,
      // весь акт, не только между ними. По rotation/scale ЭЛЕМЕНТА img, а
      // не его обёртки, поэтому не спорит с твинами смены акта ниже.
      const idle = gsap.to(innerCats, {
        scale: 1.035,
        rotation: 1.3,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.35 },
      });

      const [w1, w2] = [ACTS[0].weight, ACTS[1].weight];
      const crossfade = 0.06;
      const TRAIL_WINDOW = 0.09;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate() {
          // Яркий «хвост кометы» — скользящее окно drawSVG вслед за точкой,
          // пересчитывается каждый кадр от текущего прогресса таймлайна
          // (function-based value в самом твине считался бы один раз, тут
          // нужен именно живой пересчёт).
          const p = tl.progress();
          const from = Math.max(0, p - TRAIL_WINDOW);
          gsap.set(trail, { drawSVG: (from * 100).toFixed(2) + '% ' + (p * 100).toFixed(2) + '%' });
        },
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * (TOTAL_VH / 100)),
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Маршрут (плюс подсветка-дубль) рисуется целиком через всю сцену
      // (0→1) — акты делят этот же прогресс на 3 части. Лёгкий параллакс
      // карточки — сцена не стоит колом на скролле, даже когда кот не меняется.
      tl.to([path, glow], { drawSVG: '100%', duration: 1 }, 0)
        .to(dot, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1 }, 0)
        .fromTo(visuals, { y: -8 }, { y: 8, duration: 1 }, 0)

        // Акт 1 → 2: кот с разворотом уходит вверх, новый заходит снизу;
        // в момент переключения — вспышка «заказ принят» на экране
        // телефона, атмосфера сцены и свечение карточки чуть теплеют.
        .to(wraps[0], { autoAlpha: 0, y: -16, scale: 0.88, rotation: -6, duration: crossfade }, w1 - crossfade)
        .to(wraps[1], { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: crossfade }, w1 - crossfade)
        .fromTo(flash, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 0.85, scale: 1.25, duration: crossfade }, w1 - crossfade)
        .to(flash, { autoAlpha: 0, duration: crossfade }, w1 + crossfade * 0.4)
        .to(scene, { backgroundColor: MID_BG, duration: crossfade }, w1 - crossfade)
        .to(visuals, { boxShadow: '0 0 40px 6px rgba(255,154,61,.22)', duration: crossfade }, w1 - crossfade)
        .call(() => scene.setAttribute('data-cat-act', '2'), null, w1)

        // Акт 2 → 3: та же смена, но приземление с перелётом и небольшим
        // довеском-покачиванием — мягкий вес того самого толстого
        // довольного кота. Атмосфера доходит до самого тёплого тона,
        // сердечки расцветают stagger'ом поверх уже нарисованных в кадре.
        .to(wraps[1], { autoAlpha: 0, y: -16, scale: 0.88, rotation: -6, duration: crossfade }, w1 + w2 - crossfade)
        .to(wraps[2], { autoAlpha: 1, y: 0, scale: 1.08, rotation: 0, duration: crossfade }, w1 + w2 - crossfade)
        .to(wraps[2], { scale: 1, duration: crossfade * 1.4, ease: 'back.out(2)' }, w1 + w2)
        .to(wraps[2], { scale: 1.02, duration: crossfade * 0.7, ease: 'sine.inOut', yoyo: true, repeat: 1 }, w1 + w2 + crossfade * 1.4)
        .to(scene, { backgroundColor: WARM_BG, duration: crossfade }, w1 + w2 - crossfade)
        .to(visuals, { boxShadow: '0 0 60px 10px rgba(255,90,31,.32)', duration: crossfade }, w1 + w2 - crossfade)
        .fromTo(
          hearts,
          { autoAlpha: 0, y: 6, scale: 0.4 },
          { autoAlpha: 1, y: -10, scale: 1, duration: crossfade * 2, stagger: 0.05, ease: 'back.out(2.2)' },
          w1 + w2 - crossfade
        )
        .call(() => scene.setAttribute('data-cat-act', '3'), null, w1 + w2);

      return () => {
        idle.kill();
        root.classList.remove('cat-journey--live');
        scene.removeAttribute('data-cat-act');
        gsap.set([wraps, innerCats, path, glow, trail, dot, flash, hearts, visuals, scene], { clearProps: 'all' });
      };
    }
  );
}
