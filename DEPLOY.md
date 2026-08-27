# Деплой Visitka

## Единственный production-поток

```text
master → node build.mjs → dist/ → GitHub Pages
```

- `master` — единственная рабочая ветка и источник актуальной версии.
- `dist/` — локальный build artifact; он не хранится в Git.
- GitHub Actions при каждом push в `master` заново собирает `dist/` и публикует
  его через GitHub Pages.
- `qa/approved-mockups/` — только immutable-референсы, не deploy-источник.

## Локальная сборка

```bash
git pull --ff-only origin master
node build.mjs
python -m http.server 4173 --bind 0.0.0.0 --directory dist
```

Проверка на компьютере: <http://127.0.0.1:4173/>.

Проверка на iPhone выполняется по локальному IP компьютера в той же сети,
например <http://192.168.0.6:4173/>.

На сервер или любой другой хостинг публикуется только содержимое свежей папки
`dist/`.
