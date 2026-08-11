/* ============================================================
   cat-journey/index.js — «Котик уже не ждёт» (блок3), пин-сцена
   на GSAP + ScrollTrigger + MotionPath. Маршрут — следы лапок,
   расставленные MotionPath по невидимой направляющей и проявляемые по
   одному вслед за скроллом (не рисованная линия — см. историю правок).

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

  gsap.registerPlugin(ScrollTrigger, window.MotionPathPlugin);

  const scene = root.querySelector('.cat-journey__scene');
  const visuals = root.querySelector('.cat-journey__visuals');
  const guidePath = root.querySelector('.cat-journey__route-guide-path');
  const flash = root.querySelector('.cat-journey__flash');
  const wraps = gsap.utils.toArray(root.querySelectorAll('.cat-journey__cat-wrap'));
  const innerCats = gsap.utils.toArray(root.querySelectorAll('.cat-journey__cat'));
  const hearts = gsap.utils.toArray(root.querySelectorAll('.cat-journey__heart'));
  const paws = gsap.utils.toArray(root.querySelectorAll('.cat-journey__paw'));
  if (!scene || !visuals || !guidePath || wraps.length !== 3 || paws.length < 2) return;

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
      gsap.set(hearts, { autoAlpha: 0, y: 6, scale: 0.4 });
      gsap.set(scene, { backgroundColor: BASE_BG });
      gsap.set(visuals, { boxShadow: '0 0 0px 0px rgba(255,90,31,0)' });

      // Следы лапок вместо рисованной линии: расставляем каждый след на
      // свою точку направляющей (start===end у MotionPath — статичная
      // позиция, не анимация), чередуя разворот, как будто левая/правая
      // лапа. Проявляются по одному внутри таймлайна ниже.
      const PAW_START_T = 0.06;
      const PAW_SPREAD = 0.86;
      paws.forEach((paw, i) => {
        const t = PAW_START_T + (PAW_SPREAD * i) / (paws.length - 1);
        const mirror = i % 2 === 0 ? 1 : -1;
        gsap.set(paw, {
          motionPath: { path: guidePath, start: t, end: t, align: guidePath, alignOrigin: [0.5, 0.5] },
          autoAlpha: 0,
          scale: 0.3,
          scaleX: mirror,
          rotation: mirror > 0 ? 10 : -10,
        });
      });

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

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * (TOTAL_VH / 100)),
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Следы лапок проявляются по одному вслед за скроллом — свежий след
      // выпрыгивает с небольшим перелётом, предыдущий тут же приглушается,
      // чтобы взгляд читал направление движения, а не «россыпь наклеек».
      paws.forEach((paw, i) => {
        const t = 0.06 + (0.86 * i) / (paws.length - 1);
        tl.fromTo(paw, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.045, ease: 'back.out(2.4)' }, t);
        if (i > 0) tl.to(paws[i - 1], { autoAlpha: 0.4, duration: 0.045 }, t);
      });

      // Лёгкий параллакс карточки — сцена не стоит колом на скролле, даже
      // когда кот не меняется.
      tl.fromTo(visuals, { y: -8 }, { y: 8, duration: 1 }, 0)

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
        gsap.set([wraps, innerCats, paws, flash, hearts, visuals, scene], { clearProps: 'all' });
      };
    }
  );
}
