# DishPick

> "오늘 뭐 먹지?" — 메뉴 추천과 레시피 탐색 웹 서비스

랜덤 추천, 카테고리 탐색, 검색, 상세 정보, 레시피 조회, Admin CRUD 기능을 제공합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | TanStack Start, TanStack Router |
| Frontend | React 19, TypeScript |
| Server | Server Functions (`createServerFn`) |
| Database | SQLite (Drizzle ORM + better-sqlite3) |
| Infra | Docker, Docker Compose |

## 프로젝트 구조

```text
DishPick/
├── web/                 # TanStack Start 풀스택 앱
│   ├── src/routes/      # 파일 기반 라우팅
│   ├── src/server/      # Server Functions
│   └── src/db/          # Drizzle 스키마·시드
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 주요 화면

| URL | 설명 |
|-----|------|
| `/` | 홈 — 카테고리, 인기 메뉴 |
| `/random` | 랜덤 추천 + 레시피 |
| `/search` | 키워드 검색 |
| `/categories/$id` | 카테고리별 메뉴 |
| `/foods/$id` | 음식 상세 |
| `/admin` | 메뉴·레시피 관리 |

## Docker로 실행

```powershell
docker compose up --build -d
```

→ http://localhost

| 서비스 | 포트 |
|--------|------|
| app (TanStack Start) | 80 → 3000 |

종료:

```powershell
docker compose down
```

DB 데이터는 Docker 볼륨 `sqlite_data`에 저장됩니다.

## 로컬 개발 (Node 22+)

```powershell
cd web
npm install
npm run dev
```

→ http://localhost:3000

SQLite DB: `web/data/dishpick.db` (최초 실행 시 자동 생성·시드)

환경변수: `DATABASE_PATH=./data/dishpick.db`

## DB 설계

- **category** — id, name
- **food** — id, category_id, name, description, image_url
- **recipe** — id, food_id, ingredients, steps

초기 데이터(한식/중식/일식/양식, 12개 메뉴)는 `web/src/db/seed.ts`에서 자동으로 넣습니다.

## 향후 확장

- 관리자 로그인
- 이미지 파일 업로드
- AI 기반 맞춤 추천

자세한 개선 기록은 `record.md`를, Cursor AI 작업 가이드는 `DishPick_Cursor_Guide_TanStack.md`를 참고하세요.
