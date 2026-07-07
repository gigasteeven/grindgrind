# Changelog — ChallengeGrind

## [0.1.0] — 2026-07-07: Initial Project Skeleton

### Проект
- **ChallengeGrind** — Challenge List для Geometry Dash
- Сайт работает на Next.js 14 + Tailwind CSS + Upstash Redis
- Цветовая палитра: чёрный (#0a0705), тёмно-коричневый (#1a0f08), огненный оранжевый (#ff6b1a), жёлтый (#ffb627), белый (#f5f0eb)
- Логотип: "Challenge" белым, "Grind" — оранжево-жёлтый градиент

### Навигация (Sticky Navbar)
- Dropdown "List" → Challenge List, Platformer List
- Dropdown "Guidelines" → Rules, Level Submission
- Dropdown "Other" → Staff, Social Media
- Кнопка "Stats Viewer" (рейтинг игроков)
- Кнопка "Sign Up" (справа)
- Мобильное меню с гамбургер-иконкой
- Иконка сайта: ico.png в navbar

### Страницы
1. **Home** (`/`) — лендинг с hero-секцией и карточками
2. **Challenge List** (`/list/challenge`) — список челленджей с прямоугольными карточками (#позиция, Verifier, Points, Records)
3. **Platformer List** (`/list/platformer`) — аналогично, но в Records отображается время
4. **Level Detail** (`/level/[type]/[id]`) — страница уровня: Verifier, ID, Tags, Password, Verification Video, Records (ник, флаг, кнопка видео)
5. **Rules** (`/guidelines/rules`) — список правил (редактируется из Admin Panel)
6. **Level Submission** (`/guidelines/submission`) — правила сабмита (редактируется из Admin Panel)
7. **Staff** (`/other/staff`) — карточки модераторов с аватарами и соцсетями (редактируется из Admin Panel)
8. **Social Media** (`/other/social`) — Telegram, Discord, YouTube иконки (редактируется из Admin Panel)
9. **Stats Viewer** (`/stats`) — рейтинг игроков: топ-3 подиум + таблица (позиция, ник, очки, completions, hardest). Вместо Demons — Challenges
10. **Submit Records** (`/submit`) — форма отправки рекорда: выбор челленджа, видео, Raw Footage (опционально), время (для платформеров), процент, страна
11. **Auth** (`/auth/signup`) — регистрация/авторизация с переключением табов, Cloudflare Turnstile капча (placeholder)
12. **Profile** (`/profile`) — личный кабинет: аватар, ник, флаг, позиция в рейтинге, Total Score, Completions, Hardest, список прохождений
13. **Admin Panel** (`/admin`) — авторизация + вкладки:
    - Challenges: перемещение позиций, удаление
    - Pending Records: одобрение/отклонение сабмитов
    - Rules: редактирование правил
    - Submission: редактирование правил сабмита
    - Staff: редактирование списка модераторов
    - Admins: добавление/удаление админов (только owner)
    - Logs: логи действий администраторов

### База данных (Upstash Redis)
- URL: https://busy-macaque-78789.upstash.io
- Структура ключей:
  - `challenge:list` — упорядоченный список ID челленджей
  - `challenge:{id}` — JSON с данными уровня
  - `platformer:list` / `platformer:{id}` — аналогично для платформеров
  - `user:{username}` — JSON с данными пользователя
  - `admins:list` — список админов
  - `admin:logs` — логи действий
  - `records:pending` — ожидающие рекорды
  - `content:rules`, `content:submission`, `content:staff`, `content:social` — редактируемый контент

### Формула очков (formula.md)
- Реализована в `src/lib/formula.js`
- Учитывается ТОЛЬКО 100% прохождение (по требованию)
- Кусочно-заданная функция P(h) от позиции h
- Глобальный рейтинг: сумма очков за все 100% прохождения, сортировка по убыванию

### Импорт данных (merge папка)
- 24 челленджа импортированы из merge/_list.json
- 125 рекордов очищены: удалено поле "hz" и значение "360"
- Seed скрипт: `src/lib/seed.js`
- Дефолтный админ: admin / grind (owner)

### Авторизация
- JWT токены (7 дней)
- Пароли хешируются bcrypt
- Cloudflare Turnstile капча (пропускается в dev режиме)
- httpOnly cookies для токенов
- Только owner (admin) может добавлять других админов

### Безопасность
- Пароли не возвращаются в API ответах
- JWT в httpOnly cookies
- Проверка admin-прав на каждом admin API endpoint
- Логи всех admin-действий

### Skills применены
- **skill-frontend-2.md** (Tailwind CSS архитектор): система отступов, повторяемые компоненты (.cg-card, .cg-btn, .cg-input), адаптивность (mobile/tablet/desktop), hover/focus состояния
- **skill-frontend-6.md** (Плавная CSS-анимация): только transform и opacity, cubic-bezier кривые, prefers-reduced-motion поддержка, will-change hints

### Технологии
- Next.js 14 (App Router)
- Tailwind CSS 3.4
- @upstash/redis
- bcryptjs + jsonwebtoken
- Cloudflare Turnstile (готово к подключению)

### Файлы
```
src/
├── app/
│   ├── layout.js          # Root layout (Navbar + Footer)
│   ├── page.js            # Home
│   ├── globals.css        # Tailwind + кастомные стили
│   ├── list/challenge/    # Challenge List
│   ├── list/platformer/   # Platformer List
│   ├── level/[type]/[id]/ # Level Detail
│   ├── guidelines/rules/  # Rules
│   ├── guidelines/submission/ # Level Submission
│   ├── other/staff/       # Staff
│   ├── other/social/      # Social Media
│   ├── stats/             # Stats Viewer
│   ├── submit/            # Submit Records
│   ├── auth/signup/       # Auth (login/signup)
│   ├── profile/           # Player Profile
│   ├── admin/             # Admin Panel
│   └── api/
│       ├── auth/signup/   # Register API
│       ├── auth/login/    # Login API
│       ├── list/          # List API
│       ├── submit/        # Submit Record API
│       ├── profile/       # Profile API
│       └── admin/
│           ├── challenges/    # List/Move/Delete
│           ├── pending/       # List/Approve/Reject
│           ├── content/       # Get/Set content
│           ├── admins/        # List/Add/Delete
│           └── logs/          # Get/Add logs
├── components/
│   ├── Navbar.js          # Sticky navbar с dropdowns
│   ├── Footer.js          # Footer
│   ├── ChallengeCard.js   # Карточка уровня
│   └── LevelDetail.js     # Детальная страница уровня
└── lib/
    ├── redis.js           # Upstash Redis client + helpers
    ├── formula.js         # Формула очков
    ├── auth.js            # Auth helpers (register, login, captcha)
    └── seed.js            # Seed script для импорта данных
```
