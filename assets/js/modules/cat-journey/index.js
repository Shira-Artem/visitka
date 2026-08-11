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
  const path = root.querySelector('.cat-journey__route-path');
  const dot = root.querySelector('.cat-journey__route-dot');
  const cats = gsap.utils.toArray(root.querySelectorAll('.cat-journey__cat'));
  if (!scene || !path || !dot || cats.length !== 3) return;

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

      gsap.set(cats, { autoAlpha: 0, scale: 0.94 });
      gsap.set(cats[0], { autoAlpha: 1, scale: 1 });
      gsap.set(path, { drawSVG: '0%' });

      const [w1, w2] = [ACTS[0].weight, ACTS[1].weight];
      const crossfade = 0.05;

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

      // Один непрерывный «росчерк» маршрута и точка на нём через всю
      // сцену (0→1) — акты просто делят этот же прогресс на 3 части.
      tl.to(path, { drawSVG: '100%', duration: 1 }, 0)
        .to(dot, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1 }, 0)
        .to(cats[0], { autoAlpha: 0, scale: 0.94, duration: crossfade }, w1 - crossfade)
        .to(cats[1], { autoAlpha: 1, scale: 1, duration: crossfade }, w1 - crossfade)
        .call(() => scene.setAttribute('data-cat-act', '2'), null, w1)
        .to(cats[1], { autoAlpha: 0, scale: 0.94, duration: crossfade }, w1 + w2 - crossfade)
        .to(cats[2], { autoAlpha: 1, scale: 1, duration: crossfade }, w1 + w2 - crossfade)
        .call(() => scene.setAttribute('data-cat-act', '3'), null, w1 + w2);

      return () => {
        root.classList.remove('cat-journey--live');
        scene.removeAttribute('data-cat-act');
        gsap.set([cats, path, dot], { clearProps: 'all' });
      };
    }
  );
}
