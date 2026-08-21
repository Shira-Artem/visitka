# Desktop — текущая реализация

## Главный источник

Production URL: [http://127.0.0.1:4181/index.html?v=20260821-5](http://127.0.0.1:4181/index.html?v=20260821-5)

Эталон: `qa/approved-mockups/01-desktop-landing-approved.html` и `.png`.
Композиция собирается по desktop-макету, а product screens переиспользуются из уже готовой версии.

## Зафиксированные решения

- Главный phone — реальное клиентское меню с пятью блюдами, категориями и корзиной.
- Journey начинается с меню гостя, затем показывает кассу, кухню и директора.
- В role theatre Guest показывает то же меню; вкладки переключают тот же phone shell на роли команды.
- Рядом с гостем явно показан маршрут `QR → Меню → Заказ`, а в theatre — «Один бот · один QR».
- Director section говорит не только об аналитике, но и об управлении товарами, сотрудниками,
  доставкой, заказами, клиентами и точками.
- Sync section показывает действие директора слева и мгновенный результат у гостя справа.
- Ways cards живут в обычном документном потоке; мини-демо анимируются постоянно, без forced pagination.
- Desktop-only правила ограничены `.desktop-site`; mobile baseline не изменён.
- Hero использует два согласованных product screen: меню гостя и реальный dashboard директора;
  телефоны выровнены в одну композицию, с короткой подписью кабинета и синхронизацией заказа.

## Ключевые файлы

- `index.html` — production desktop markup и оставшийся legacy/mobile markup.
- `assets/css/desktop-landing.css` — desktop tokens, grid, sections и responsive rules.
- `assets/js/desktop-product-screens.js` — reusable `<dl-product-screen>` templates.
- `assets/js/desktop-landing.js` — role tabs, director tabs, menu/cart and ways interactions.
- `assets/js/main.js` — legacy runtime gate and shared initialization.
- `assets/img/generated/` — реальные блюда и product assets.

## Технические инварианты

- Порядок `<link>` в `index.html` менять только осознанно: `sections/*` используют каскад и могут
  иметь одинаковую специфичность.
- Брейкпоинты живут в `assets/css/tokens.css`; не размножать числа ширин по JS.
- Desktop-specific styles должны быть ограничены `.desktop-site`, чтобы не протечь в mobile.
- Сборка публикует только `dist/`; исходный корень не является deploy artifact.

## Следующий безопасный проход

1. Уточнять B2B-copy и CTA только после визуальной проверки desktop.
2. Не возвращать pinned story или scroll-driven перелистывание на desktop.
3. Не заменять реальные screens скриншотами-картинками.
4. Перед изменением mobile сначала получить отдельное согласование; approved mobile source остаётся
   контрольным.
5. Реальные ссылки Telegram/MAX и QR заменить одним отдельным проходом, когда они будут предоставлены.
