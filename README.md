# ikazs.ru

Статический сайт ООО «Интеллект 4 Джи Сервис» (производство контейнерных АЗС).
HTML + CSS + JS, без сборки: файлы из корня репозитория выкладываются на хостинг как есть.

## Структура

| Что | Где |
| --- | --- |
| Страницы | `*.html` в корне |
| Общие стили | `styles.css`, `cinematic.css`, `pages-info.css` |
| Скрипты | `app.js`, `support.js`, `cinematic.js` |
| Медиа | `assets/` (`cine/` — видео кино-интро, `prod/`, `cases/`, `parts/`) |
| Черновики, не для публикации | `scraps/`, `screenshots/`, `uploads/` |

## Деплой

Пуш в `main` запускает `.github/workflows/deploy.yml` — автозалив по FTPS на хостинг.
Нужны секреты репозитория (Settings → Secrets and variables → Actions):

- `FTP_SERVER` — хост, например `ftp.ikazs.ru`
- `FTP_USERNAME`, `FTP_PASSWORD` — доступ FTP
- `FTP_DIR` — каталог публикации, например `/public_html/`

Ручной запуск: вкладка Actions → Deploy to hosting → Run workflow.

## Правки

Правки вносятся через Claude Design, каждая — отдельным коммитом. Карта страниц и точки синхронизации — в `github.md`.
