# Changelog — ChallengeGrind

## [0.8.0] — 2026-07-07: Verifier points, Created/Published in profile, Stats Viewer

### Verifier Gets Points + Completions
- getRankings() теперь добавляет верифнутые уровни верификатору как completions
- Верификатор получает полные очки за уровень (как если бы он его прошел)
- В профиле верификатора его верифнутые уровни отображаются в Completions
- Дедупликация: если верификатор также есть в records, не добавляется дважды

### Created / Published in Profile
- getRankings() находит уровни где author совпадает с ником игрока
- В профиле: новые секции "Challenges Created" и "Challenges Published" с бейджами
- В Stats Viewer: Created и Published показывают реальные данные (не "None")
- API /api/profile возвращает verified, created, published массивы

### Stats Viewer
- Created и Published секции показывают реальные уровни
- Verified показывает позицию уровня (#N Name)

## [0.7.0] — 2026-07-07: Cloudflare Pages deployment support

### Cloudflare Pages Compatibility
- `next.config.js`: images.unoptimized = true (CF Pages не поддерживает next/image optimizer)
- `wrangler.toml`: конфигурация для Cloudflare Pages с nodejs_compat флагом
- Все API routes: `export const runtime = "edge"` для Cloudflare Workers
- `package.json`: добавлены @cloudflare/next-on-pages и wrangler
- Скрипты: `pages:build` и `pages:deploy` для деплоя через wrangler
- `DEPLOY.md`: инструкция по деплою на Cloudflare Pages
- bcryptjs (pure JS) уже используется — работает на edge
- Upstash Redis — совместим с Cloudflare edge

## [0.6.0] — 2026-07-07: CRITICAL security fix — server-side auth verification

### Security Fix: localStorage isAdmin bypass
- **Проблема**: человек мог прописать `localStorage.setItem("user", '{"isAdmin":true}')` и получить доступ к админке
- **Решение**: 
  - В localStorage хранится ТОЛЬКО JWT токен (его нельзя подделать без JWT_SECRET)
  - Новый endpoint `GET /api/auth/me` — проверяет токен на сервере, возвращает реальные данные
  - Navbar: делает запрос к /api/auth/me, не читает isAdmin из localStorage
  - Admin Panel: ВСЕГДА требует логин, проверяет токен через /api/auth/me
  - Profile: данные берутся с сервера через /api/auth/me
  - Submit Records: имя игрока берётся из токена на сервере
  - Убрано хранение `user` в localStorage везде

### Files Changed
- `src/app/api/auth/me/route.js` — NEW: server-side token verification
- `src/components/Navbar.js` — useAuth hook, fetches from /api/auth/me
- `src/app/admin/page.js` — always verifies token with server, no localStorage trust
- `src/app/profile/page.js` — fetches user data from /api/auth/me
- `src/app/auth/signup/page.js` — stores only token, not user data
- `src/app/submit/page.js` — fetches user from /api/auth/me

## [0.5.1] — 2026-07-07: Records fix, case-insensitive nicks, position on add, auth bug fixes

### Records Table
- Убрана надпись "100%" — только зелёная галочка ✓
- Заголовок колонки изменён с "100%" на "✓"
- Для процентов < 100 показывается процент цифрами

### Case-Insensitive Usernames
- getRankings() теперь группирует по username.toLowerCase()
- kunakov и Kunakov засчитываются как один игрок
- Отображается оригинальный ник (первый найденный)

### Admin: Position When Adding Level
- Поле Position в форме добавления уровня
- Уровень вставляется на указанную позицию (splice)
- Все уровни ниже сдвигаются автоматически
- Очки пересчитываются по формуле (позиция = индекс + 1)
- Если позиция не указана — добавляется в конец

### Auth/Registration Bug Fixes
- Регистрация: проверка case-insensitive (нельзя зарегистрировать Admin если есть admin)
- Логин: поиск пользователя case-insensitive
- Submit Records: playerName берётся из JWT токена, не из формы (нельзя подделать)
- Profile API: поиск рекордов case-insensitive
- Pending records: submittedBy ставится из токена
- Admin users list: корректный мерж всех списков пользователей

## [0.5.0] — 2026-07-07: Records redesign, add challenges, stronger glass, thicker borders

### Records Table Redesign
- Убраны колонки "Pre" и "Flag" (отдельная колонка)
- Флаг теперь отображается **рядом с ником** слева
- Остались только: #, Holder (с флагом), 100%, Proof
- Для платформеров: + колонка Time

### Admin Panel — Add Challenges
- Новая кнопка "+ Add New Challenge" в Challenges tab
- Форма добавления: Name, ID, Author, Verifier, Verification URL, Password, Qualify %, Tags, List Type (Challenge/Platformer)
- API: POST /api/admin/challenges/add
- Добавленные уровни появляются в списке сразу

### Glass Shader — Stronger
- backdrop-blur-xl вместо backdrop-blur-md
- Полупрозрачный фон 50% (было 60%)
- box-shadow с inset для глубины
- Толще рамки: border-2 везде вместо border

### Borders — Thicker
- Все .cg-card, .cg-glass, .cg-card-hover: border-2
- .cg-input: border-2
- .cg-btn-ghost: border-2
- .cg-divider: border-t-2
- --cg-border цвет сделан светлее для видимости

### Mobile Support
- Все новые элементы адаптивны
- Форма добавления: grid-cols-1 на мобиле, grid-cols-2 на десктопе
- Records таблица: overflow-x-auto

## [0.4.2] — 2026-07-07: Full theme support across all pages, admin user list fix

### Theme Support — All Pages
- **globals.css**: добавлены все utility классы с opacity вариантами через CSS variables
- **Auth page**: табы, форма, инпуты — все используют CSS переменные
- **Submit Records**: форма, инпуты, кнопки, toggle — themed
- **Rules / Submission**: карточки, нумерация — themed
- **Staff**: карточки, аватары, соцсети — themed
- **Social Media**: карточки платформ — themed
- **Profile**: баннер, статы, completions, record status — themed
- **Admin Panel**: табы, карточки, инпуты — themed
- **Stats Viewer**: панели, делители — themed
- **Level Detail**: glass элементы, таблица — themed
- Все hardcoded Tailwind цвета заменены на CSS variables

### Admin Panel — Users Tab
- Owner (admin) отображается отдельно с 👑 значком
- Обычные админы и игроки — в общем списке
- Кнопка Edit работает для всех кроме owner

## [0.4.1] — 2026-07-07: Fix theme colors on home page, footer, accent bar

### Bug Fixes
- **Home page "Grind" text**: теперь использует CSS переменные (--cg-accent-from/to) вместо статичных Tailwind классов — меняет цвет при смене темы
- **Footer "Grind" text**: та же починка
- **Accent bar на странице уровня**: уже использовал CSS переменные, подтверждено

### Card Redesign (списки)
- Карточки переделаны: позиция, тире, название уровня, "published by"
- Минималистичный дизайн как на референсе
- Stats справа на десктопе, компактно на мобиле

## [0.4.0] — 2026-07-07: Theme system, card redesign, glass UI, mobile support, user management

### Theme System
- **3 темы**: ChallengeGrind (по умолчанию), Black & White, Arcane (#211f20 #f8f8e4 #e79291 #65161b)
- ThemeProvider + ThemeSwitcher в navbar
- Тема сохраняется в localStorage
- CSS переменные для всех цветов — плавное переключение

### Card Redesign (списки челленджей и платформеров)
- Горизонтальные карточки с большим номером позиции
- Название уровня жирным шрифтом (cg-level-name)
- "published by [author]" под названием
- Records и Score справа на десктопе
- Мобильная версия: компактная с stats снизу

### Glass Shader UI
- .cg-glass класс: backdrop-blur + полупрозрачный фон
- Применён к странице уровня: header, info grid, records
- Приятный минималистичный эффект

### Mobile Support
- viewport meta tag
- Адаптивные отступы и размеры шрифтов
- Мобильное меню с прокруткой
- Stats Viewer: двухпанельный на десктопе, стек на мобиле
- Все страницы оптимизированы для 400px+

### User Management (Admin Panel)
- Новая вкладка "Users" в админке
- Список всех пользователей с country и ролью
- Возможность менять пароль любого пользователя
- Возможность менять country (флаг) любого пользователя
- Логи всех изменений
- API: GET/POST /api/admin/users
- Регистрация добавляет пользователя в users:list

### Stats Viewer — флаги
- SVG флаги из flagcdn.com для всех игроков
- Если флаг не установлен — международный флаг (INT)
- Флаги в списке игроков и в панели деталей

### API Changes
- `GET /api/admin/users` — список всех пользователей
- `POST /api/admin/users` — обновление пароля и страны пользователя
- `POST /api/auth/signup` — добавляет пользователя в users:list

## [0.3.0] — 2026-07-07: Complete CSS overhaul + Stats Viewer redesign

### CSS Overhaul
- Полностью переписан globals.css: чище компоненты, меньше визуального шума
- `.cg-card` — без паддинга по умолчанию (контролируется местами)
- `.cg-card-hover` — для интерактивных карточек с lift эффектом
- `.cg-rank` система бейджей: top1 (золото), top3 (оранжевый), top5, top10, default
- Убраны лишние тени и скругления

### Stats Viewer — полная переделка
- **Двухпанельный layout** (как на референсе): слева список игроков, справа детали
- **Поиск** по имени игрока
- **Пагинация** (Previous / Next) по 25 игроков на страницу
- **Левая панель**: ранг, ник, completions, флаг, очки
- **Правая панель**:
  - Имя игрока + флаг
  - Rank и Score
  - ChallengeGrind Stats (Top 5 / Top 15 / Extended)
  - Hardest Challenge
  - Challenges Completed (список бейджей со ссылками)
  - Challenges Verified
  - Created / Published
- Вместо "Demons" → "Challenges" везде

### Level Detail — редизайн
- Градиентный accent bar сверху
- Бейдж позиции с цветовым кодированием
- Info grid 2×4 (Level ID, Password, Qualify %, Verifier)
- Records таблица: #, Holder, Flag, Pre, 100%, Proof
- Счётчик: "X registered, Y are 100%"

### Challenge Card — редизайн
- Минималистичный дизайн: бейдж позиции + имя + verifier + records + points
- Цвет бейджа зависит от позиции

### Profile — редизайн
- Баннер с градиентом
- Флаг страны как аватар (flagcdn.com SVG)
- 3 карточки статистики (Score, Completions, Hardest)
- Completions список с сортировкой по позиции
- Record Status (приватная секция)

## [0.2.0] — 2026-07-07: Bug fixes & Profile redesign

### Bug Fixes
- **Critical Redis fix**: `getChallengeList()`, `getPlatformerList()`, `getAdminLogs()`, `getPendingRecords()` — изменены с `lrange` (Redis list) на `get` + `JSON.parse` (Redis string), чтобы совпадать с seed.js который использует `set()`. Это исправляло `WRONGTYPE` ошибку на Stats Viewer, Challenge List и Platformer List.
- **Navbar auth state**: Navbar теперь проверяет `localStorage` на наличие токена и показывает username + Logout вместо Sign Up после регистрации.
- **Profile redirect**: При истёкшем токене профиль редиректит на `/auth/signup` вместо пустого экрана.

### Profile Redesign
- **Country flag avatar**: Вместо буквенной аватарки — SVG флаг страны игрока из `flagcdn.com`
- **Banner gradient**: Добавлен градиентный баннер в шапке профиля
- **Stats cards**: Иконки для Total Score, Completions, Hardest
- **Record Status section**: Внизу профиля — статус всех отправленных рекордов (pending/approved/rejected). Виден только самому игроку. При отказе показывается причина.
- **Owner badge**: 👑 Owner для владельца, 🛡️ Admin для обычных админов

### Level Detail Redesign (по образцу)
- **Gradient position badge**: Цветовой градиент зависит от позиции (#1-5 жёлтый, #6-15 оранжевый, и т.д.)
- **Info grid**: Level ID, Password, Qualify %, Verifier — в сетке 2x4 карточек
- **Records table**: Полная таблица с колонками #, Holder, Flag, Pre, 100%, Time (для платформеров), Proof
- **Records header**: Показывает общее количество рекордов и сколько из них 100%
- **Verification video button**: Кнопка для просмотра верификационного видео

### Admin Panel
- **Staff avatars**: В StaffTab добавлена возможность ставить URL аватарки для каждого стаффа + поля для соцсетей (Telegram, Discord, YouTube)
- **Reject with reason**: При отказе рекорда админ вводит причину, которая видна игроку в профиле
- **Pending status display**: Одобренные/отклонённые рекорды показываются со статусом в админ панели

### Home Page
- **Removed 3 feature cards**: Убраны карточки "Challenge List", "Stats Viewer", "Submit Records" с главной — оставлен только hero с заголовком и кнопками

### API Changes
- `GET /api/profile` — теперь возвращает `recordStatuses` (массив статусов рекордов игрока)
- `POST /api/admin/pending/reject` — принимает `reason` поле
- `POST /api/admin/pending/approve` — помечает рекорд как approved вместо удаления
- Новые функции в redis.js: `getPlayerPendingRecords()`, `updatePendingRecordStatus()`

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
1. **Home** (`/`) — лендинг с hero-секцией
2. **Challenge List** (`/list/challenge`) — список челленджей с прямоугольными карточками
3. **Platformer List** (`/list/platformer`) — аналогично, но в Records отображается время
4. **Level Detail** (`/level/[type]/[id]`) — страница уровня: Verifier, ID, Tags, Password, Records
5. **Rules** (`/guidelines/rules`) — список правил (редактируется из Admin Panel)
6. **Level Submission** (`/guidelines/submission`) — правила сабмита (редактируется из Admin Panel)
7. **Staff** (`/other/staff`) — карточки модераторов с аватарами и соцсетями (редактируется из Admin Panel)
8. **Social Media** (`/other/social`) — Telegram, Discord, YouTube иконки (редактируется из Admin Panel)
9. **Stats Viewer** (`/stats`) — рейтинг игроков: топ-3 подиум + таблица
10. **Submit Records** (`/submit`) — форма отправки рекорда с Raw Footage (опционально)
11. **Auth** (`/auth/signup`) — регистрация/авторизация с Cloudflare Turnstile
12. **Profile** (`/profile`) — личный кабинет: флаг, ранг, очки, прохождения, статус рекордов
13. **Admin Panel** (`/admin`) — вкладки: Challenges, Pending Records, Rules, Submission, Staff, Admins, Logs

### База данных (Upstash Redis)
- Структура ключей:
  - `challenge:list` — JSON массив ID челленджей
  - `challenge:{id}` — JSON с данными уровня
  - `platformer:list` / `platformer:{id}` — аналогично для платформеров
  - `user:{username}` — JSON с данными пользователя
  - `admins:list` — список админов
  - `admin:logs` — JSON массив логов
  - `records:pending` — JSON массив ожидающих рекордов
  - `content:rules`, `content:submission`, `content:staff`, `content:social` — редактируемый контент

### Формула очков (formula.md)
- Реализована в `src/lib/formula.js`
- Учитывается ТОЛЬКО 100% прохождение (по требованию)
- Кусочно-заданная функция P(h) от позиции h

### Импорт данных (merge папка)
- 24 челленджа импортированы из merge/_list.json
- 125 рекордов очищены: удалено поле "hz" и значение "360"
- Seed скрипт: `src/lib/seed.js`
- Дефолтный админ: admin / grind (owner)

### Авторизация
- JWT токены (7 дней), bcrypt, Cloudflare Turnstile
- httpOnly cookies для токенов
- Только owner (admin) может добавлять других админов

### Skills применены
- **skill-frontend-2.md** (Tailwind CSS архитектор): система компонентов, адаптивность
- **skill-frontend-6.md** (Плавная CSS-анимация): transform/opacity, cubic-bezier, prefers-reduced-motion
