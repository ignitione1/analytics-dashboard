# RetailCRM Analytics Dashboard (Supabase + Vercel + Telegram)

Небольшой проект-интеграция:
- синхронизирует заказы из **RetailCRM** в **Supabase (Postgres)**
- показывает простой **дашборд аналитики** (Next.js App Router)
- отправляет **Telegram-уведомления** по заказам выше заданного порога

## Возможности

- **Синк RetailCRM → Supabase** через API (`/api/sync`)
- **Дашборд**:
  - KPI (кол-во заказов, сумма, средний чек)
  - график (комбо: столбики + линия)
  - таблица последних заказов
  - переключение диапазона `7/30/90` дней через `/?days=...`
- **Telegram alerts** (`/api/alerts/check`) с дедупликацией через таблицу `order_alerts`
- **Vercel Cron** запускает синк/алерты по расписанию (см. `vercel.json`)

## Архитектура (упрощённо)

- `app/` — UI + API routes (контроллеры)
- `services/` — интеграции (RetailCRM, Telegram)
- `repositories/` — доступ к данным Supabase
- `lib/` — env, supabase client, утилиты

## Требования

- Node.js LTS
- Аккаунты:
  - RetailCRM (ключ API + site code)
  - Supabase (URL + service role key)
  - Telegram Bot (token + chat id)

## Настройка Supabase

1) Таблица `orders` должна существовать (используется для аналитики).
2) Таблица `order_alerts` нужна для дедупликации уведомлений.

Создай `order_alerts` через SQL из файла:

`supabase/order_alerts.sql`

## Переменные окружения

Создай файл `.env.local` в корне проекта (не коммить в git):

```env
RETAILCRM_URL=
RETAILCRM_API_KEY=
RETAILCRM_SITE_CODE=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

ALERT_THRESHOLD_KZT=

# ключ для ручного вызова внутренних эндпоинтов (альтернатива vercel cron header)
INTERNAL_API_KEY=
```

Примечания:
- `SUPABASE_SERVICE_ROLE_KEY` используется **только на сервере** (API routes). Не делай `NEXT_PUBLIC_*`.
- `INTERNAL_API_KEY` можно сделать любым длинным случайным значением.

## Запуск локально

Установка зависимостей:

```bash
npm i
```

Запуск dev сервера:

```bash
npm run dev
```

Открыть:

- http://localhost:3000

## Ручная проверка API

Эндпоинты защищены:
- от Vercel Cron: заголовок `x-vercel-cron: 1`
- для ручного запуска: `x-internal-api-key: <INTERNAL_API_KEY>` или `?key=<INTERNAL_API_KEY>`

### Синхронизация заказов

PowerShell:

```powershell
$key = "<INTERNAL_API_KEY>"
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/sync?key=$key"
```

Ожидаемо: `{ success: true, fetched: ..., mapped: ..., upserted: ... }`.

### Проверка алертов

```powershell
$key = "<INTERNAL_API_KEY>"
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/alerts/check?key=$key"
```

Ожидаемо:
- при первом запуске `sent > 0` (если есть заказы выше порога)
- при повторном запуске `sent = 0` (дедуп через `order_alerts`)

## Деплой на Vercel

1) Запушь проект в GitHub (или другой git remote).
2) В Vercel: **New Project** → импорт репозитория.
3) В Vercel Project → **Settings → Environment Variables** добавь все переменные из `.env.local`.
4) Деплой.
 
### Cron jobs

Файл `vercel.json` уже содержит расписание:
- `/api/sync` — каждые 15 минут
- `/api/alerts/check` — каждые 5 минут

После деплоя Vercel автоматически начнёт вызывать эти пути.