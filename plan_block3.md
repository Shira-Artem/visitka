# plan_block3 — «Котик уже не ждёт», замена финального CTA на мобильной версии

## Цель

Заменить статичную секцию `#final` (QR-плейсхолдер + мёртвые кнопки Telegram/MAX) на
кинематографичную pin-scroll историю с котиком — по референс-скриншоту пользователя:
заголовок «КОТИК УЖЕ НЕ ЖДЁТ», три акта («Голодный и сообразительный» → «Заказ в пути» →
«Сытый и счастливый»), огненная линия маршрута между актами, в конце — реальный QR и кнопки
«Открыть в Telegram» / «Открыть в MAX».

**Только мобильная версия** (`<981px`, тот же брейкпоинт, что у Story/Ways). Десктопный
`.final` не трогаем — паттерн уже устоялся в проекте (`plan_mobile.md`: «не трогаем
desktop-раскладку»).

Реализация — на GSAP (самохостинг, без npm/CDN): используем скачанные официальные скиллы
`gsap-core`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-timeline`, `gsap-utils`,
`gsap-performance` (`.claude/skills/gsap-*`).

## Решено с пользователем (11.08.2026)

- GSAP — самохостинг: `assets/js/vendor/gsap/*.min.js`, classic `<script defer>`.
- Ссылки Telegram/MAX и QR пока `href="#"`-заглушка, но QR рисуем настоящим QR-генератором
  (кодируем временный текст), заменим на реальные ссылки позже.
- Ассеты котика (`cat-hungry.webp`, `cat-ordering.webp`, `cat-happy-full.webp`,
  `pickup-window.webp`, `order-bag.webp`) генерирует и кладёт пользователь сам в
  `assets/img/cat-story/` — до их прихода верстаем на временных плейсхолдерах тех же
  пропорций, потом просто подменяем `src`.
- Имя плана — этот файл, `plan_block3.md`, в корне (по аналогии с `plan_mobile.md`).

Полная архитектура и обоснование — см. историю согласования плана в сессии; краткая версия
ниже как чеклист.

## Чеклист

- [x] 1. Скачать GSAP vendor-файлы (gsap.min.js, ScrollTrigger.min.js, DrawSVGPlugin.min.js,
      MotionPathPlugin.min.js) → `assets/js/vendor/gsap/` (jsDelivr, подтверждено пользователем).
- [x] 2. Подключить vendor-скрипты в `index.html` (после `hero-demo.js`, перед `main.js`,
      `defer`, classic script).
- [x] 3. HTML: в `#final` — текущая панель обёрнута под desktop-only показ
      (`.final__panel--desktop`), добавлена разметка `.cat-journey` (intro/scene из 3
      актов/visuals/route svg/actions с QR+кнопками).
- [x] 4. CSS: `assets/css/sections/cat-journey.css`, подключён в `<link>`-цепочке сразу после
      `sections/final.css`, перед `sections/adaptive.css` (каскад не переставлен).
- [x] 5. JS: модуль `assets/js/modules/cat-journey/{index.js,config.js}` —
      `gsap.matchMedia({isLive:'(max-width:768px)', reduceMotion:'(prefers-reduced-motion:reduce)'})`
      (порог живого пина — как у мобильной Story-кинематографии, ≤980 просто показывает секцию),
      один `ScrollTrigger` (pin+scrub) на 320svh, `DrawSVGPlugin` для маршрута целиком,
      `MotionPathPlugin` для точки по нему же, 3 акта делят тот же прогресс через `data-cat-act`,
      cleanup — возврат из `mm.add()` (matchMedia сам вызывает при выходе из брейкпоинта).
- [x] 6. Подключить `initCatJourney()` в `main.js` после `initStory()`.
- [x] 7. Реальные ассеты котика получены — 3 PNG (`cat-ordering.png`, `cat-ordering_2.png`,
      `cat-happy-full.png`, прозрачный фон, ~1150×1370) конвертированы в WebP 800px шириной
      (~64–74 КБ каждый, итого ~210 КБ — в бюджет) и разложены как
      `assets/img/cat-story/{cat-hungry,cat-ordering,cat-happy-full}.webp`. Отдельных
      `pickup-window`/`order-bag` не делали — пакет с логотипом уже есть в кадре акта 3, лишние
      слои не понадобились.
- [x] 8. QR — решили пока НЕ генерировать настоящий (сеть/API не трогаем): в `.cat-journey`
      используется тот же декоративный SVG-плейсхолдер, что и в десктопном `.final`. Ссылки
      Telegram/MAX — по-прежнему `href="#"`.
- [x] 9. Проверка сделана (`node build.mjs` + локальный сервер `.claude/launch.json`/`visitka`,
      375×812): пин держит, все 3 акта переключаются, QR/кнопки открываются через `[data-reveal]`
      после релиза пина, десктоп (1280px) не изменился, ресайз 375→900→375 (граница 768px)
      корректно снимает и заново ставит `ScrollTrigger` (`matchMedia` cleanup), консоль чистая.
      По пути найден и исправлен баг: `.cat-journey__visuals` схлопывался в 0×0 (контейнер с
      `aspect-ratio` и только `max-width`, при этом все дети `position:absolute` — не от чего
      считать intrinsic-размер); исправлено на `width:min(100%,320/280px)`.
- [ ] 10. Когда придут реальные ссылки Telegram/MAX — обновить `href` и сгенерировать настоящий QR
      (заменить оба плейсхолдера, десктопный и мобильный, одним проходом).

## Ограничения (из брифа)

Не вставлять макет одной картинкой · не рисовать/морфить котика через CSS · все три
изображения котика должны быть готовы до старта сцены (без ленивой подгрузки по актам) ·
один `ScrollTrigger` на сцену, не по одному на движение · без постоянного `blur` · desktop не
трогаем.

## Статус

Начато 11.08.2026. Ожидаем от пользователя ассеты котика (генерирует отдельно) и реальные
ссылки Telegram/MAX (пока заглушка).
