/* ============================================================
   story/mobile-story.js — Блок 1, ≤768px, обычный document flow.

   Раньше здесь был закреплённый (position:sticky) кадр на 6 сцен с
   искусственной высотой трека ~650svh — счётчик прогресса скролла двигал
   свет и подпись, поэтому один палец-свайп почти не продвигал страницу
   (см. .claude/rules/mobile-ui.md). Теперь Блок 1 — тот же поток, что уже
   используется на 769…980px и при prefers-reduced-motion (mobile-flow.js):
   карточки актов идут одна за другой, активный акт выбирает
   IntersectionObserver, а не позиция скролла.

   Единственное, что остаётся мобильным (≤768px) отличием контента —
   сам hero: на телефоне это питч владельцу заведения (MOBILE_HERO_CAPTION),
   а не гостевой заголовок из разметки. Подпись монтируется поверх исходной
   hero-панели, исходное содержимое прячется через CSS
   (sections/story-mobile.css, .story__act-panel[data-act="hero"]).
   ============================================================ */
import { setupMobileFlow } from './mobile-flow.js';
import { MOBILE_HERO_CAPTION } from './config.js';

export function setupMobileStory(core) {
  const heroPanel = core.panels.find(function (p) { return p.getAttribute('data-act') === 'hero'; });
  let caption = null;

  if (heroPanel) {
    const hero = MOBILE_HERO_CAPTION;
    caption = document.createElement('div');
    caption.className = 'story__mobile-caption story__hero-caption';
    caption.innerHTML =
      '<span class="eyebrow story__hero-eyebrow">' + hero.eyebrow + '</span>' +
      '<h1 class="story__headline story__headline--hero">' +
        hero.lines.map(function (line) {
          return '<span class="line"><span>' + line + '</span></span>';
        }).join('') +
      '</h1>' +
      '<p class="story__hero-sub">' + hero.sub + '</p>' +
      '<a class="btn btn--fire story__hero-cta" href="' + hero.ctaHref + '">' + hero.ctaLabel +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</a>' +
      '<p class="story__cue" aria-hidden="true"><i></i>' + hero.hint + '</p>';
    heroPanel.appendChild(caption);
    heroPanel.classList.add('story__act-panel--mobile-hero');
  }

  // Первый мобильный экран — «Директор» (готовый revenue-график), а не цикл
  // по ролям гостя: незачем объяснять кассу/кухню до того, как читатель
  // понял, что сервис вообще для заведений.
  const flowCleanup = setupMobileFlow(core, { heroState: { role: 'director', state: 'default' } });

  return function cleanup() {
    flowCleanup();
    if (caption) caption.remove();
    if (heroPanel) heroPanel.classList.remove('story__act-panel--mobile-hero');
  };
}
