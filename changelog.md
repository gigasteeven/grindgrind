# Changelog — ChallengeGrind

> **Для другой ИИ**: Этот файл — полная документация проекта. Прочитай его перед началом работы.
> Если контекст утерян, здесь есть всё: структура, технологии, БД, формулы, безопасность, деплой.

---

## 📋 О проекте

**ChallengeGrind** — Challenge List для Geometry Dash (аналог Demonlist, но для челленджей).
Сайт где игроки могут смотреть список челленджей по сложности, отправлять свои рекорды, competing в рейтинге.

- **Репо**: https://github.com/gigasteeven/grindgrind
- **Владелец**: kaiser wilgeim (kaiserwilgeim6@gmail.com)
- **GitHub**: gigasteeven
- **Деплой**: Cloudflare Pages (https://challengegrind.pages.dev)

---

## 🛠 Технологии

| Компонент | Технология |
|---|---|
| Фреймворк | Next.js 14.2.35 (App Router) |
| CSS | Tailwind CSS 3.4 + CSS Variables (темы) |
| База данных | Upstash Redis (REST API) |
| Auth | jose (edge JWT) + bcryptjs |
| Captcha | Cloudflare Turnstile |
| Деплой | Cloudflare Pages (@cloudflare/next-on-pages) |
| Runtime | Edge (все API routes: `export const runtime = "edge"`) |

### Почему jose вместо jsonwebtoken?
`jsonwebtoken` использует Node.js `crypto`/`stream` — не работает на Cloudflare edge runtime.
`jose` — edge-compatible, работает везде. Файл: `src/lib/jwt-edge.js`.

### Почему bcryptjs?
`bcryptjs` — pure JavaScript реализация bcrypt. Не требует native модулей, работает на edge.

---

## 🎨 Дизайн

### Цветовая палитра (тема ChallengeGrind по умолчанию)
- Фон: `#0a0705` (чёрный)
- Surface: `#1a0f08` (тёмно-коричневый)
- Surface-2: `#2d1810` (коричневый)
- Border: `#4a2a1a`
- Orange: `#ff6b1a` (огненный оранжевый)
- Yellow: `#ffb627` (жёлтый)
- Text: `#f5f0eb` (белый)
- Text-dim: `#c4b8a8`

### Темы (3 шт)
1. **ChallengeGrind** — чёрный/коричневый/оранжевый (по умолчанию)
2. **Black & White** — чёрно-белый
3. **Arcane** — `#211f20` / `#f8f8e4` / `#e79291` / `#65161b`

Темы реализованы через CSS Variables в `globals.css`. Переключаются ThemeProvider + ThemeSwitcher в navbar. Сохраняются в `localStorage` (ключ: `cg-theme`).

### CSS компоненты
- `.cg-card` — карточка (border-2, rounded-xl)
- `.cg-glass` — glass shader (backdrop-blur-xl, 50% opacity, inset shadow)
- `.cg-card-hover` — карточка с hover lift эффектом
- `.cg-btn` / `.cg-btn-primary` / `.cg-btn-ghost` — кнопки
- `.cg-input` — инпут (border-2, focus glow)
- `.cg-rank` + `.cg-rank-top1/top3/top5/top10/default` — бейджи позиции
- `.cg-level-name` — жирный шрифт для названий уровней
- `.cg-badge` — маленький бейдж

### Skills применены
- **skill-frontend-2.md** (Tailwind CSS архитектор): система компонентов, адаптивность, hover/focus
- **skill-frontend-6.md** (Плавная CSS-анимация): только transform/opacity, cubic-bezier, prefers-reduced-motion, will-change

---

## 🗄 База данных (Upstash Redis)

### Подключение
```
UPSTASH_REDIS_REST_URL=https://busy-macaque-78789.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ
```

### Структура ключей
| Ключ | Тип | Описание |
|---|---|---|
| `challenge:list` | JSON string | Массив ID челленджей по порядку позиций |
| `challenge:{id}` | JSON string | Данные уровня (name, author, verifier, records, etc.) |
| `platformer:list` | JSON string | Массив ID платформеров |
| `platformer:{id}` | JSON string | Данные платформера |
| `user:{username}` | JSON string | Данные пользователя (password hash, country, isAdmin, isOwner) |
| `admins:list` | JSON string | Массив username админов |
| `users:list` | JSON string | Массив username всех зарегистрированных игроков |
| `admin:logs` | JSON string | Массив логов действий админов |
| `records:pending` | JSON string | Массив ожидающих рекордов (с status: pending/approved/rejected) |
| `content:rules` | JSON string | Массив строк правил (редактируется из Admin Panel) |
| `content:submission` | JSON string | Массив строк правил сабмита |
| `content:staff` | JSON string | Массив объектов стаффов |
| `content:social` | JSON string | Объект соцсетей {telegram, discord, youtube} |

### Важно
- Все данные хранятся как JSON strings через `redis.set()` / `redis.get()`
- **НЕ** использовать `redis.lrange()` / `redis.lpush()` — это вызывает WRONGTYPE ошибку
- Redis клиент — lazy singleton (инициализируется при первом обращении через Proxy)

### Seed скрипт
`src/lib/seed.js` — импортирует данные из `merge/` папки в Redis.
- 24 челленджа, 125 рекордов
- Удаляет поле `hz` и значение `360` из records (по требованию)
- Создаёт админа: admin / grind (owner)
- Запуск: `node src/lib/seed.js`

---

## 📐 Формула очков

Реализована в `src/lib/formula.js`. Основана на `formula.md` из репо.
Учитывается **ТОЛЬКО 100% прохождение** (по требованию владельца).

### P(h) — кусочно-заданная функция от позиции h
```
1040 - 40h                    для 1 ≤ h ≤ 8
1200 - 60h                    для 8 < h ≤ 10
800 - 20h                     для 10 < h ≤ 20
480 - 4h                      для 20 < h ≤ 50
480 - 8h                      для 50 < h ≤ 75
155 - h                       для 75 < h ≤ 150
5 - 0.4 * floor((h-150)/10)   для 150 < h ≤ 250
1 - 0.01 * floor(95(h-250)/(H-250))  для h > 250 (H = max position)
```

### Глобальный рейтинг (getRankings)
1. **Records**: каждый 100% record даёт игроку P(h) очков
2. **Verifier**: верификатор уровня получает P(h) очков + уровень в completions (дедупликация — если верификатор уже есть в records, не добавляется дважды)
3. **Author**: автор уровня получает записи в created[] и published[]
4. **Case-insensitive**: kunakov и Kunakov — один игрок (группировка по lowercase)
5. Сортировка по убыванию очков

---

## 🔐 Безопасность

### Auth
- **JWT** через `jose` (edge-compatible) — 7 дней экспирация
- **bcryptjs** — хеширование паролей (10 rounds)
- **Cloudflare Turnstile** — капча при регистрации/логине (пропускается в dev режиме)
- Токен хранится в `localStorage` (ключ: `token`)
- **ТОЛЬКО токен** в localStorage — данные пользователя ВСЕГДА берутся с сервера через `GET /api/auth/me`

### Защита от localStorage bypass
- Раньше `isAdmin` хранился в localStorage — можно было подделать
- Теперь: фронтенд делает запрос к `/api/auth/me`, сервер проверяет JWT и возвращает реальные данные
- Admin Panel: всегда требует логин, проверяет токен через `/api/auth/me`
- Submit Records: `playerName` берётся из JWT токена на сервере, не из формы

### Admin права
- **Owner** (admin): единственный кто может добавлять/удалять админов
- **Admin**: может управлять уровнями, рекордами, контентом
- **Player**: может регистрироваться, отправлять рекорды, смотреть профиль
- Все admin API endpoints проверяют `decoded.isAdmin` из JWT
- Добавление админов: проверяется `isOwner` флаг

### Дефолтный админ
- Ник: `admin`
- Пароль: `grind`
- Флаг: `isOwner: true`

---

## 📄 Страницы

| URL | Описание |
|---|---|
| `/` | Главная — hero с логотипом и кнопками |
| `/list/challenge` | Challenge List — карточки уровней |
| `/list/platformer` | Platformer List — аналогично |
| `/level/[type]/[id]` | Страница уровня — glass shader, info grid, records таблица |
| `/guidelines/rules` | Правила (редактируется из Admin Panel) |
| `/guidelines/submission` | Правила сабмита (редактируется из Admin Panel) |
| `/other/staff` | Стафф — карточки модераторов с аватарами и соцсетями |
| `/other/social` | Соцсети — Telegram, Discord, YouTube |
| `/stats` | Stats Viewer — двухпанельный: список игроков + детали |
| `/submit` | Submit Records — форма отправки рекорда |
| `/auth/signup` | Регистрация / Логин (табы) |
| `/profile` | Профиль игрока — флаг, статы, completions, verified, created, published, record status |
| `/admin` | Admin Panel — требует логин, 8 вкладок |

### Records таблица (на странице уровня)
- Колонки: `#`, `Holder` (с флагом слева), `✓` (зелёная галочка для 100%), `Proof` (ссылка на YouTube)
- Для платформеров: + колонка `Time`
- Убрана надпись "100%" — только зелёная галочка ✓

---

## 🛡 Admin Panel

### Вкладки
1. **Challenges** — список уровней, перемещение позиций (↑↓), удаление, добавление новых (с указанием позиции)
2. **Pending Records** — одобрение/отклонение сабмитов (с причиной отказа)
3. **Users** — управление пользователями (смена пароля, смена страны). Owner отображается отдельно с 👑
4. **Rules** — редактирование правил
5. **Submission** — редактирование правил сабмита
6. **Staff** — редактирование стаффов (аватарки, соцсети)
7. **Admins** — добавление/удаление админов (только Owner)
8. **Logs** — логи всех действий админов

### Добавление уровня
- Форма: Name, Level ID, Author, Verifier, Verification URL, Password, Qualify %, Tags, Position, List Type
- При указании позиции — уровень вставляется на неё, остальные сдвигаются
- Если позиция не указана — добавляется в конец

---

## 📁 Структура проекта

```
src/
├── app/
│   ├── layout.js              # Root layout (Navbar + Footer + ThemeProvider)
│   ├── page.js                # Home
│   ├── globals.css            # Tailwind + CSS Variables (темы) + компоненты
│   ├── list/challenge/        # Challenge List
│   ├── list/platformer/       # Platformer List
│   ├── level/[type]/[id]/     # Level Detail (glass shader)
│   ├── guidelines/rules/      # Rules
│   ├── guidelines/submission/ # Level Submission
│   ├── other/staff/           # Staff
│   ├── other/social/          # Social Media
│   ├── stats/                 # Stats Viewer (server component → client)
│   ├── submit/                # Submit Records
│   ├── auth/signup/           # Auth (login/signup tabs)
│   ├── profile/               # Player Profile
│   ├── admin/                 # Admin Panel (8 tabs)
│   └── api/
│       ├── auth/me/           # GET — server-side token verification
│       ├── auth/signup/       # POST — register
│       ├── auth/login/        # POST — login
│       ├── list/              # GET — list challenges
│       ├── submit/            # POST — submit record (playerName from JWT)
│       ├── profile/           # GET — profile data + record statuses
│       └── admin/
│           ├── challenges/        # GET — list, POST — add
│           ├── challenges/move/   # POST — move position
│           ├── challenges/delete/ # POST — delete
│           ├── pending/           # GET — list pending
│           ├── pending/approve/   # POST — approve (adds to challenge records)
│           ├── pending/reject/    # POST — reject (with reason)
│           ├── content/           # GET/POST — get/set editable content
│           ├── admins/            # GET — list, POST — add (owner only)
│           ├── admins/delete/     # POST — remove (owner only)
│           ├── logs/              # GET — list, POST — add log
│           └── users/             # GET — list, POST — update password/country
├── components/
│   ├── Navbar.js              # Sticky navbar (useAuth hook, ThemeSwitcher)
│   ├── Footer.js              # Footer
│   ├── ThemeProvider.js       # CSS theme context (localStorage)
│   ├── ThemeSwitcher.js       # Theme dropdown in navbar
│   ├── ChallengeCard.js       # Level card for lists
│   ├── LevelDetail.js         # Level detail page (glass, records table)
│   └── StatsViewerClient.js   # Stats Viewer (two-panel, search, pagination)
└── lib/
    ├── redis.js               # Lazy Redis singleton (Proxy), all DB operations
    ├── formula.js             # Scoring formula + getRankings (verifier/author points)
    ├── auth.js                # Auth helpers (register, login, captcha, verifyToken)
    ├── jwt-edge.js            # jose-based JWT (edge-compatible)
    └── seed.js                # Seed script for merge data import
```

---

## 🚀 Деплой (Cloudflare Pages)

### Через Dashboard
1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git
2. Repo: `gigasteeven/grindgrind`
3. Build command: `npx @cloudflare/next-on-pages`
4. Output directory: `.vercel/output/static`
5. Environment variables (см. ниже)
6. Settings → Functions → Compatibility flags → `nodejs_compat`
7. Deploy

### Через Wrangler CLI
```bash
git clone https://github.com/gigasteeven/grindgrind.git
cd grindgrind
npm install --legacy-peer-deps
npx wrangler login
npx wrangler pages project create challengegrind

# Set secrets
npx wrangler pages secret put UPSTASH_REDIS_REST_URL --project-name challengegrind
npx wrangler pages secret put UPSTASH_REDIS_REST_TOKEN --project-name challengegrind
npx wrangler pages secret put JWT_SECRET --project-name challengegrind
npx wrangler pages secret put NEXT_PUBLIC_TURNSTILE_SITE_KEY --project-name challengegrind
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name challengegrind

# Build and deploy
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name challengegrind
```

### Environment Variables
| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `https://busy-macaque-78789.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ` |
| `JWT_SECRET` | `challengegrind_secret_key_2026` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` (тестовый, замените позже) |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` (тестовый, замените позже) |

### Важно для деплоя
- `.npmrc` содержит `legacy-peer-deps=true` — обязательно для разрешения конфликтов
- `next.config.js`: `images.unoptimized: true` — CF Pages не поддерживает next/image
- Все API routes: `export const runtime = "edge"`
- `wrangler.toml`: `compatibility_flags = ["nodejs_compat"]`
- Подробная инструкция: `DEPLOY.md`

---

## 📦 Папка merge/

Содержит данные челленджей и рекордов с прошлого листа. Все относятся к Challenge List.
- `_list.json` — порядок позиций (массив имён файлов)
- `{name}.json` — данные уровня (id, name, author, verifier, records, etc.)
- При импорте через seed.js: удаляются поля `hz` и значения `360` из records

---

## 📝 История изменений

### [0.9.0] — 2026-07-07: Edge-compatible JWT (jose), CF Pages build fixes
- `jsonwebtoken` → `jose` (edge compatibility)
- `src/lib/jwt-edge.js` — SignJWT/jwtVerify из jose
- `verifyToken` теперь async во всех API routes
- `next.config.js`: убран `experimental.runtime: "nodejs"`
- `package.json`: pinned versions, `legacy-peer-deps`
- `.npmrc`: `legacy-peer-deps=true`

### [0.8.0] — 2026-07-07: Verifier points, Created/Published in profile
- Verifier получает полные очки за уровень + уровень в completions
- Author получает created[] и published[] записи
- Дедупликация: если верификатор уже в records — не добавляется дважды
- Profile: секции Verified, Created, Published
- Stats Viewer: Created/Published показывают реальные данные

### [0.7.0] — 2026-07-07: Cloudflare Pages deployment support
- `wrangler.toml`, `DEPLOY.md`
- Все API routes: `export const runtime = "edge"`
- `images.unoptimized: true`

### [0.6.0] — 2026-07-07: CRITICAL security fix — server-side auth
- Убрано хранение `user` в localStorage
- Новый endpoint `/api/auth/me` — проверка токена на сервере
- Navbar, Admin, Profile — все используют `/api/auth/me`
- Submit Records: playerName из JWT, не из формы

### [0.5.1] — 2026-07-07: Records fix, case-insensitive nicks, position on add
- Records: убрана надпись "100%", только зелёная галочка ✓
- getRankings: группировка по username.toLowerCase()
- Admin: поле Position при добавлении уровня (splice)
- Auth: case-insensitive поиск пользователя

### [0.5.0] — 2026-07-07: Records redesign, add challenges, stronger glass, thicker borders
- Records: флаг рядом с ником, убраны колонки Pre и Flag
- Admin: форма добавления уровней
- Glass: backdrop-blur-xl, 50% opacity, inset shadow
- Все borders: border-2

### [0.4.2] — 2026-07-07: Full theme support across all pages
- Все страницы используют CSS Variables (theme-aware)
- globals.css: utility классы с opacity вариантами через color-mix
- Admin Users tab: owner отображается отдельно

### [0.4.1] — 2026-07-07: Fix theme colors on home/footer
- "Grind" текст использует CSS variables для градиента

### [0.4.0] — 2026-07-07: Theme system, card redesign, glass UI, mobile, user management
- 3 темы: ChallengeGrind, Black & White, Arcane
- ThemeProvider + ThemeSwitcher
- Glass shader (.cg-glass)
- Полная мобильная поддержка
- Admin: Users tab (смена пароля, страны)

### [0.3.0] — 2026-07-07: Complete CSS overhaul + Stats Viewer redesign
- Stats Viewer: двухпанельный layout, поиск, пагинация
- Level Detail: accent bar, rank badge, info grid, records table
- Challenge Card: минималистичный дизайн
- Profile: баннер, флаг, статы, record status

### [0.2.0] — 2026-07-07: Bug fixes & Profile redesign
- Redis WRONGTYPE fix: lrange → get + JSON.parse
- Navbar: показывает username + Logout после регистрации
- Profile: country flag SVG, record status section

### [0.1.0] — 2026-07-07: Initial project skeleton
- Next.js 14 + Tailwind + Upstash Redis
- Все страницы, API routes, auth, admin panel
- Импорт merge данных (24 челленджа, 125 рекордов)
- Формула очков, seed скрипт
- Skills применены
