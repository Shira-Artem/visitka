# QA и контрольные точки

Статус последнего desktop-прохода: **passed**  
Дата: 2026-08-21  
Коммиты последнего рабочего цикла: `1b8412b`, `fb2c476`.

## Последняя проверка

- Preview: `http://127.0.0.1:4181/index.html?v=20260821-4#desktop-director`.
- Guest menu отрисовывается и в Journey, и в Guest theatre panel.
- Guest → Cashier → Guest переключение работает.
- Director copy и capability rail отображаются рядом с готовыми screens.
- Console errors: 0.
- `node --check assets/js/desktop-landing.js` — passed.
- `node --check assets/js/desktop-product-screens.js` — passed.
- `git diff --check` — passed; CRLF warnings от Git не являются ошибками.
- Horizontal overflow отсутствует в проверенном desktop viewport; основные ширины проекта — 1280, 1440,
  1920 CSS px.
- `qa/approved-mockups/` не редактировалась.

## Визуальные артефакты

- `qa/screenshots/desktop-full-menu-route-2026-08-21.png`
- `qa/screenshots/desktop-menu-route-detail-2026-08-21.png`
- `qa/screenshots/desktop-director-management-2026-08-21.png`
- `qa/screenshots/desktop-product-screens-implemented-2026-08-20.png`
- `qa/screenshots/desktop-journey-source-vs-implementation.png`
- `qa/screenshots/desktop-director-source-vs-implementation.png`

## Перед следующим handoff

- Обновить preview URL/version в этом файле и `README.md` контекста.
- Повторить browser smoke test после изменения markup или JS.
- Обновить screenshot только после проверки правильного viewport и interaction state.
- Не объявлять готовность, если design QA не подтверждён или mobile baseline случайно изменён.
