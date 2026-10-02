repo: intellect4gservice-collab/ikazs.ru
branch: main

## Last sync
date: 2026-08-31T00:00:00Z

### Updated in this project
- Подготовлен деплой на Джино: `.htaccess` (https + без www, gzip, кэш, Accept-Ranges для видео, запрет листинга и служебных папок).
- Добавлены `robots.txt` и `sitemap.xml` (52 страницы, приоритеты по коммерческой важности).
- `deploy.yml`: расширен список исключений (`_ds/`, docx/xlsx, `_probe.html`, бриф).
- Исправлен `automation-terminal.html` — внутри `<body>` был вложен второй документ.
- `DEPLOY.md` — чеклист настройки хостинга и автодеплоя.

## Screen map
| Экран проекта | Файлы репозитория |
| --- | --- |
| Все страницы сайта | `*.html` в корне |
| Стили | `styles.css`, `mobile.css`, `cinematic.css`, `pages-info.css` |
| Скрипты | `app.js`, `mobile.js`, `support.js`, `cinematic.js`, `kazs-viewer.jsx` |
| Медиа | `assets/**` |
| Деплой | `.github/workflows/deploy.yml`, `.htaccess`, `DEPLOY.md` |
| SEO | `robots.txt`, `sitemap.xml` |

## Sync history
- 2026-08-24 — репозиторий подключён, upstream пуст, подготовлены `deploy.yml`, `.gitignore`, `README.md`.
