/* ============================================================
   scroll-scene.js — движок закреплённой (pin) скролл-сцены.

   Одна и та же механика была написана дважды: у Story на десктопе и у
   секции «Способы получения». Теперь она здесь, а сцена приносит только
   свой сценарий и то, что делать на каждом шаге.

   Как устроено:
     .*__track   — обычный блок, ему выставляется высота из суммы весов актов;
     .*__stage   — sticky внутри трека, живёт ровно один экран (CSS);
     прогресс    — сколько трека уже прокручено, 0…1;
     rawAct      — дробный номер акта (2.4 = «40% третьего акта»);
     actIndex    — целый номер с гистерезисом, чтобы не дребезжал на границе.

   Добавить новую скролл-секцию = массив актов с весами + onTick.
   Копировать 200 строк заново больше не нужно.

   Использование:
     const scene = createPinnedScene({
       track,
       acts: [{ id: 'intro', vh: 40 }, { id: 'pickup', vh: 65 }],
       hysteresis: 0.1,
       exactFloorRange: [1, 4],
       onTick(state) { ... }        // вернуть false — «не фиксируй акт»
     });
     scene.tick();                  // первичная синхронизация
     scene.destroy();               // снимает слушатель и высоту трека
   ============================================================ */
import { clamp01, pickIndex } from './motion.js';

export function createPinnedScene(options) {
  const track = options.track;
  const acts = options.acts;
  const hysteresis = options.hysteresis == null ? 0.12 : options.hysteresis;
  /* Диапазон, внутри которого граница акта считается точной (Math.floor),
     а не «ближайший акт по округлению». Без него rawAct вида 3.6 округляется
     в 4, и сцена переключается на середине своей полосы, а не в конце. */
  const exactFloorRange = options.exactFloorRange || null;
  const unit = options.unit || 'svh';
  const onTick = options.onTick;

  const totalVh = acts.reduce(function (sum, act) { return sum + act.vh; }, 0);
  const bounds = (function () {
    let acc = 0;
    return acts.map(function (act) {
      const start = acc / totalVh;
      acc += act.vh;
      return { start: start, end: acc / totalVh };
    });
  })();

  let lastActIndex = 0;
  let ticking = false;

  track.style.height = totalVh + unit;

  function computeProgress() {
    const r = track.getBoundingClientRect();
    const scrollable = r.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp01(-r.top / scrollable);
  }

  function tick() {
    ticking = false;
    const progress = computeProgress();

    let rawAct = acts.length - 1;
    for (let i = 0; i < bounds.length; i++) {
      if (progress < bounds[i].end || i === bounds.length - 1) {
        const span = bounds[i].end - bounds[i].start;
        rawAct = i + (span > 0 ? (progress - bounds[i].start) / span : 0);
        break;
      }
    }

    let actIndex = pickIndex(rawAct, lastActIndex, acts.length, hysteresis);
    if (exactFloorRange && rawAct >= exactFloorRange[0] && rawAct < exactFloorRange[1]) {
      actIndex = Math.floor(rawAct);
    }

    const actSpan = bounds[actIndex].end - bounds[actIndex].start;
    const localP = actSpan > 0 ? clamp01((progress - bounds[actIndex].start) / actSpan) : 0;

    const state = {
      progress: progress,
      rawAct: rawAct,
      actIndex: actIndex,
      act: acts[actIndex],
      localP: localP,
      isNewAct: actIndex !== lastActIndex
    };

    // false = сцена сейчас под ручным управлением, номер акта не фиксируем.
    if (onTick && onTick(state) === false) return;
    lastActIndex = actIndex;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    totalVh: totalVh,
    bounds: bounds,
    tick: tick,
    destroy: function () {
      window.removeEventListener('scroll', onScroll);
      track.style.removeProperty('height');
    }
  };
}
