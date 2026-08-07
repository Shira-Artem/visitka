/* ============================================================
   story/mobile-story.js — мобильная Story (≤768px), «Свет заказа».

   Один закреплённый кадр на шесть сцен. Телефон стоит неподвижно
   (одна координата, один размер), меняются только свет вокруг него
   и подпись сверху — поэтому сцена читается как единый ролик, а не
   как набор экранов.

   Единственный источник состояния — прогресс .story__track:
     progress → sceneIndex (с гистерезисом) + локальный прогресс сцены.
   Отсюда пишутся все CSS-переменные (см. sections/story-mobile.css);
   второй логики сцен ни в CSS, ни в разметке нет.

   Почему не через lib/scroll-scene.js: у этой сцены другая система
   отсчёта (высота берётся у .story__stage, а не у window — на мобильных
   браузерах с прячущейся панелью svh заметно меньше innerHeight),
   равные по длине сцены и свой порог гистерезиса. Натягивать её на
   общий движок значило бы изменить поведение ради красоты.
   ============================================================ */
import { clamp01, smoothRange } from '../../lib/motion.js';
import { clearVars } from '../../lib/css-vars.js';
import { prefersReduced } from '../../lib/breakpoints.js';
import {
  STORY_ACTS, ACT_ROLE, MOBILE_ACT_STATE, MOBILE_SCENES,
  MOBILE_SCENE_VH, MOBILE_HEADER_CLEARANCE, MOBILE_CAPTION_GAP, MOBILE_RAIL_SPACE,
  MOBILE_MIN_CAPTION_BAND, PHONE_WIDTH_RATIO, RAIL_ENERGY_GAIN, RAIL_ENERGY_DECAY,
  RAIL_SETTLE_MS, MOBILE_TONE_LEAD, MOBILE_EXIT_START, MOBILE_PAGE_TONE
} from './config.js';

const STAGE_VARS = ['--mobile-phone-top', '--mobile-phone-width', '--scene-p', '--story-p', '--story-exit'];
const SECTION_VARS = ['--st-base', '--st-key', '--st-tint'];
const RAIL_VARS = ['--rail-progress', '--rail-energy', '--rail-dir', '--rail-span'];

export function setupMobileStory(core) {
  const storyStage = core.stage;
  const storyTrack = core.track;
  const storySection = core.section;
  const actPanels = core.panels;
  const dotEls = core.dotEls;
  const dotsEl = core.dotsEl;

  const sceneCount = STORY_ACTS.length;
  let activeSceneIndex = -1;
  let ticking = false;
  const mounted = [];
  let lastTone = '';
  let cutTimer = 0;
  let hitTimer = 0;
  const threadEl = storyStage.querySelector('.story__thread');

  /* «Пульс заказа»: ядро на шкале едет строго за прогрессом, а его энергия
     (длина шлейфа и яркость) — за скоростью прокрутки. Держим два числа:
     railEnergy — сглаженная скорость, railDir — направление движения. */
  let railEnergy = 0;
  let railDir = 1;
  let railLastProgress = null;
  let railLastTime = 0;
  let railDecayFrame = 0;
  let railSettleTimer = 0;

  function toneOf(index) {
    return MOBILE_SCENES[STORY_ACTS[Math.max(0, Math.min(sceneCount - 1, index))].id].tone;
  }

  function mix(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function mixTriplet(from, to, t) {
    return mix(from[0], to[0], t) + ',' + mix(from[1], to[1], t) + ',' + mix(from[2], to[2], t);
  }

  /* Подписи сцен монтируются в существующие .story__act-panel: панель
     остаётся единственным носителем состояния (.is-active), а мобильная
     типографика живёт отдельным узлом и снимается в cleanup(). */
  function mountCaptions() {
    actPanels.forEach(function (panel) {
      const actId = panel.getAttribute('data-act');
      const scene = MOBILE_SCENES[actId];
      if (!scene || !scene.lines) return;
      const caption = document.createElement('div');
      caption.className = 'story__mobile-caption';
      caption.innerHTML =
        '<span class="story__mobile-kicker"><b>' + scene.index + '</b><i></i>' + scene.label + '</span>' +
        '<h2 class="story__headline story__headline--mobile">' +
          scene.lines.map(function (line) {
            return '<span class="line"><span>' + line + '</span></span>';
          }).join('') +
        '</h2>' +
        (scene.note ? '<p class="story__mobile-note">' + scene.note + '</p>' : '');
      panel.appendChild(caption);
      mounted.push(caption);
    });

    // Подсказка прокрутки принадлежит первой сцене и уезжает вместе с ней.
    const heroPanel = storyStage.querySelector('.story__act-panel[data-act="hero"]');
    if (heroPanel) {
      const cue = document.createElement('p');
      cue.className = 'story__cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.innerHTML = '<i></i>Листай — заказ оживает';
      heroPanel.appendChild(cue);
      mounted.push(cue);
    }
  }

  /* Кадр Story — это .story__stage высотой 100svh с overflow:hidden, и на
     мобильных браузерах с прячущейся панелью svh заметно меньше, чем
     window.innerHeight. Всю геометрию и прогресс считаем от реальной высоты
     сцены, иначе маршрутная шкала уезжает за нижнюю границу и обрезается. */
  function stageHeight() {
    return storyStage.getBoundingClientRect().height || window.innerHeight;
  }

  // Реальная высота самой высокой подписи — hero: четыре строки обещания
  // плюс подсказка прокрутки. Меряем по факту, а не повторяем в JS clamp()
  // из CSS: размеры шрифта живут в одном месте — в таблице стилей.
  function heroBlockHeight() {
    const panel = storyStage.querySelector('.story__act-panel[data-act="hero"]');
    if (!panel) return 0;
    const kids = [].filter.call(panel.children, function (node) {
      return window.getComputedStyle(node).display !== 'none';
    });
    if (!kids.length) return 0;
    const first = kids[0].getBoundingClientRect();
    const last = kids[kids.length - 1].getBoundingClientRect();
    return Math.max(0, last.bottom - first.top);
  }

  /* Геометрия кадра. Телефон получает одну координату и один размер на всю
     Story, поэтому полосу подписи задаёт самая высокая сцена, а не средняя:
     так текст ни в одной сцене не спорит ни с шапкой, ни с телефоном. */
  function updateMobilePhoneGeometry() {
    const vh = stageHeight();
    const captionBand = Math.round(Math.max(
      MOBILE_MIN_CAPTION_BAND,
      heroBlockHeight() + MOBILE_HEADER_CLEARANCE + MOBILE_CAPTION_GAP
    ));
    const available = Math.max(240, vh - captionBand - MOBILE_RAIL_SPACE - 16);
    const width = Math.round(Math.max(148, Math.min(260, available * PHONE_WIDTH_RATIO)));
    const phoneHeight = width / PHONE_WIDTH_RATIO;
    const slack = Math.max(0, vh - captionBand - MOBILE_RAIL_SPACE - phoneHeight);
    const top = Math.round(captionBand + slack * 0.42);
    storyStage.style.setProperty('--mobile-phone-top', top + 'px');
    storyStage.style.setProperty('--mobile-phone-width', width + 'px');
    // Длина хода пульса в пикселях: ядро едет через transform, а не через
    // left, поэтому шкале нужен явный размер (ширина минус два радиуса узла).
    if (dotsEl) dotsEl.style.setProperty('--rail-span', Math.max(0, dotsEl.clientWidth - 14) + 'px');
  }

  function mobileStoryProgress() {
    const rect = storyTrack.getBoundingClientRect();
    const scrollable = rect.height - stageHeight();
    if (scrollable <= 0) return 0;
    return clamp01(-rect.top / scrollable);
  }

  // Свет ведёт монтаж: цвет уходит в следующую сцену чуть раньше, чем
  // сменится подпись, — переход читается как режиссура, а не как переключение.
  function paintAtmosphere(progress) {
    const rawIndex = Math.min(sceneCount - 1, Math.floor(progress * sceneCount));
    const local = clamp01(progress * sceneCount - rawIndex);
    const blend = smoothRange(local, MOBILE_TONE_LEAD, 1);
    const from = toneOf(rawIndex);
    const to = toneOf(rawIndex + 1);
    const exit = smoothRange(progress, MOBILE_EXIT_START, 1);

    const base = [
      mix(from.base[0], to.base[0], blend),
      mix(from.base[1], to.base[1], blend),
      mix(from.base[2], to.base[2], blend)
    ];
    // В финале база уходит в цвет страницы — стык со следующей секцией не виден.
    const baseValue = mixTriplet(base, MOBILE_PAGE_TONE, exit);
    const next = baseValue + '|' + mixTriplet(from.key, to.key, blend) + '|' + mixTriplet(from.tint, to.tint, blend);
    if (next !== lastTone) {
      lastTone = next;
      const parts = next.split('|');
      storySection.style.setProperty('--st-base', parts[0]);
      storySection.style.setProperty('--st-key', parts[1]);
      storySection.style.setProperty('--st-tint', parts[2]);
    }
    storyStage.style.setProperty('--scene-p', local.toFixed(3));
    storyStage.style.setProperty('--story-p', progress.toFixed(3));
    storyStage.style.setProperty('--story-exit', exit.toFixed(3));
  }

  function writeRailEnergy() {
    if (!dotsEl) return;
    dotsEl.style.setProperty('--rail-energy', railEnergy.toFixed(3));
    dotsEl.style.setProperty('--rail-dir', String(railDir));
  }

  // Затухание считается от времени, а не от числа кадров: пропущенный кадр
  // не оставляет шлейф растянутым.
  function railDecayFactor(elapsed) {
    return Math.pow(RAIL_ENERGY_DECAY, Math.max(1, elapsed) / 16);
  }

  /* После остановки скролла событий больше нет, поэтому энергию гасим
     коротким затухающим циклом — он сам останавливается на нуле и не
     превращается в постоянный rAF. */
  function decayRailEnergy(now) {
    railDecayFrame = 0;
    const elapsed = now - railLastTime;
    railLastTime = now;
    railEnergy *= railDecayFactor(elapsed);
    if (railEnergy < 0.01) railEnergy = 0;
    writeRailEnergy();
    if (railEnergy > 0) railDecayFrame = requestAnimationFrame(decayRailEnergy);
  }

  function trackRailEnergy(progress) {
    const now = performance.now();
    if (railLastProgress === null) {
      railLastProgress = progress;
      railLastTime = now;
      return;
    }
    const delta = progress - railLastProgress;
    const elapsed = now - railLastTime;
    railLastProgress = progress;
    railLastTime = now;
    if (delta > 0) railDir = 1;
    else if (delta < 0) railDir = -1;
    if (prefersReduced()) return;
    railEnergy = clamp01(railEnergy * railDecayFactor(elapsed) + Math.abs(delta) * RAIL_ENERGY_GAIN);
    writeRailEnergy();
    if (!railDecayFrame) railDecayFrame = requestAnimationFrame(decayRailEnergy);
    // Страховка: если rAF придушен (вкладка ушла в фон), шлейф всё равно
    // обязан схлопнуться — иначе на экране остаётся висеть «гирлянда».
    window.clearTimeout(railSettleTimer);
    railSettleTimer = window.setTimeout(function () {
      railEnergy = 0;
      writeRailEnergy();
    }, RAIL_SETTLE_MS);
  }

  // Попадание в узел: одиночное кольцо на шкале и капля света из телефона.
  // Класс всегда снимается по таймеру, поэтому анимации не накапливаются.
  function playNodeHit() {
    if (prefersReduced() || !dotsEl) return;
    dotsEl.classList.remove('is-hit');
    if (threadEl) threadEl.classList.remove('is-hit');
    void dotsEl.offsetWidth;
    dotsEl.classList.add('is-hit');
    if (threadEl) threadEl.classList.add('is-hit');
    window.clearTimeout(hitTimer);
    hitTimer = window.setTimeout(function () {
      dotsEl.classList.remove('is-hit');
      if (threadEl) threadEl.classList.remove('is-hit');
    }, 780);
  }

  function applyMobileStoryScene(index) {
    const act = STORY_ACTS[index];
    const state = MOBILE_ACT_STATE[act.id];
    activeSceneIndex = index;
    storyStage.setAttribute('data-story-act', act.id);
    storyStage.setAttribute('data-order-phase', act.id);
    storyStage.setAttribute('data-cash-step', act.id === 'cash' ? state : '');
    core.applyPanel(index);
    core.setCashTimeline(act.id === 'cash' ? 1 : 0);

    // Пройденные узлы маршрута остаются зажжёнными — заказ движется вперёд.
    dotEls.forEach(function (dot, i) {
      dot.classList.toggle('is-done', i < index);
    });

    // Заказ дошёл до узла: сначала кольцо-импульс на шкале, и уже под него
    // уходят свет, подпись и экран телефона (задержка входа подписи — в CSS).
    playNodeHit();

    // Одиночный световой «стык» — прячет подмену подписи.
    if (!prefersReduced()) {
      storyStage.classList.remove('is-cut');
      void storyStage.offsetWidth;
      storyStage.classList.add('is-cut');
      window.clearTimeout(cutTimer);
      cutTimer = window.setTimeout(function () {
        storyStage.classList.remove('is-cut');
      }, 620);
    }

    // Первая сцена — витрина: телефон сам проигрывает весь путь заказа,
    // чтобы «вау» случилось ещё до первого движения пальцем. Как только
    // история тронулась, управление забирает скролл; при возврате в hero
    // автоплей стартует заново. applyState() чистит таймеры автоплея,
    // поэтому в hero его звать нельзя.
    if (act.id === 'hero' && window.YJ_HERO_AUTOPLAY) {
      window.YJ_HERO_AUTOPLAY.start();
    } else {
      if (window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
      window.YJ_HERO_DEMO.applyState(ACT_ROLE[act.id], state);
    }
  }

  function tickMobileStory() {
    ticking = false;
    const progress = mobileStoryProgress();
    const rawPosition = progress * sceneCount;
    let index = Math.min(sceneCount - 1, Math.floor(rawPosition));
    // Гистерезис: смена сцены требует уверенного перехода границы, поэтому
    // дрожание пальца у стыка не даёт мерцания.
    if (index > activeSceneIndex && rawPosition < activeSceneIndex + 1.06) index = activeSceneIndex;
    if (index < activeSceneIndex && rawPosition > activeSceneIndex - 0.06) index = activeSceneIndex;

    paintAtmosphere(progress);
    trackRailEnergy(progress);
    if (index !== activeSceneIndex) applyMobileStoryScene(index);
    // Маршрутная шкала непрерывна: заливка доходит до узла ровно тогда,
    // когда начинается его сцена (узлы стоят на i/(N-1)). Пишем после
    // applyPanel(), который ставит своё дискретное значение для десктопа.
    if (dotsEl) {
      dotsEl.style.setProperty('--rail-progress', clamp01(rawPosition / (sceneCount - 1)).toFixed(4));
    }
  }

  function onMobileStoryScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tickMobileStory);
  }

  function onMobileStoryResize() {
    updateMobilePhoneGeometry();
    onMobileStoryScroll();
  }

  storyTrack.style.setProperty('--story-track-h', (sceneCount * MOBILE_SCENE_VH) + 'svh');
  storyStage.setAttribute('data-mobile-story', 'true');
  mountCaptions();
  updateMobilePhoneGeometry();
  applyMobileStoryScene(0);
  window.addEventListener('scroll', onMobileStoryScroll, { passive: true });
  window.addEventListener('resize', onMobileStoryResize);
  tickMobileStory();

  return function cleanup() {
    window.clearTimeout(cutTimer);
    window.clearTimeout(hitTimer);
    window.clearTimeout(railSettleTimer);
    if (railDecayFrame) cancelAnimationFrame(railDecayFrame);
    if (threadEl) threadEl.classList.remove('is-hit');
    window.removeEventListener('scroll', onMobileStoryScroll);
    window.removeEventListener('resize', onMobileStoryResize);
    mounted.forEach(function (node) { node.remove(); });
    dotEls.forEach(function (dot) { dot.classList.remove('is-done'); });
    storyStage.classList.remove('is-cut');
    storyTrack.style.removeProperty('--story-track-h');
    clearVars(storyStage, STAGE_VARS);
    clearVars(storySection, SECTION_VARS);
    if (dotsEl) {
      dotsEl.classList.remove('is-hit');
      clearVars(dotsEl, RAIL_VARS);
    }
    storyStage.removeAttribute('data-mobile-story');
  };
}
