# ЮртаНеЖди — Visitka

Статический лендинг сервиса заказа еды и мобильного Mini App для заведений. Главная рабочая
desktop-версия продаёт владельцу единый поток: **гость → заказ → касса → кухня → директор**.

## С чего начать

1. Прочитать [`docs/project-context/README.md`](docs/project-context/README.md).
2. Затем открыть [`product.md`](docs/project-context/product.md), [`desktop.md`](docs/project-context/desktop.md)
   и [`qa.md`](docs/project-context/qa.md) внутри этой папки.
3. Перед frontend-изменениями прочитать корневой [`AGENTS.md`](AGENTS.md) и
   [`qa/approved-mockups/README.md`](qa/approved-mockups/README.md).

## Локальный запуск

Из корня проекта:

```bash
python -m http.server 4181 --bind 127.0.0.1
```

Открыть: <http://127.0.0.1:4181/index.html?v=20260821-4#desktop-director>

## Стек и сборка

- HTML + CSS + Vanilla JS без runtime-фреймворка.
- `assets/js/desktop-product-screens.js` — готовые product screens.
- `assets/js/desktop-landing.js` — desktop interactions.
- `node build.mjs` — production build в `dist/` с content hashes.
- Деплой описан в [`DEPLOY.md`](DEPLOY.md); публикуется содержимое `dist/`, а не корень.

## Важные правила

- Desktop и mobile имеют отдельные композиции.
- `qa/approved-mockups/` — immutable reference material.
- Мобильный baseline не менять в рамках desktop-задачи.
- Для desktop сохранять естественный скролл и телефон как главный визуальный герой.
- Новые промежуточные результаты фиксировать в `docs/project-context/` и отдельным локальным коммитом.

## Структура документации

```text
docs/project-context/
├── README.md       # единая точка входа и continuation checklist
├── product.md      # продукт, аудитория и продающие аргументы
├── desktop.md      # текущая desktop-реализация и решения
├── qa.md           # последняя QA-проверка и артефакты
└── decisions.md    # короткий журнал ключевых решений
```
