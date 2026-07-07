# Changelog — ChallengeGrind

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
