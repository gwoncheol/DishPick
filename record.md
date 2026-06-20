# DishPick 개선 기록 (record.md)

## 0. 중요: TanStack Start 풀스택으로 전환 (2026-06)

### 이전 오해

처음 요청하신 **「TanStack으로 하나의 시스템」** 을 **TanStack Query만** 적용한 **React + Spring Boot 분리 구조**로 구현했습니다.

| 구분 | 이전 (오해) | 원하신 것 |
|------|-------------|-----------|
| 프레임워크 | React + Vite + React Router | **TanStack Start (풀스택)** |
| 백엔드 | Spring Boot (Java) | **Server Functions (TypeScript/Node)** |
| API | REST `/api/**` | **`createServerFn` 서버 함수** |
| DB 접근 | JPA | **Drizzle ORM + SQLite (better-sqlite3)** |
| 배포 | Spring JAR + static | **Node `.output/server`** |

### 현재 구조 (TanStack Start)

```text
web/                          ← 메인 애플리케이션
├── src/
│   ├── routes/               ← TanStack Router 파일 기반 라우팅
│   ├── server/foods.ts       ← createServerFn (DB CRUD)
│   ├── db/                   ← Drizzle + SQLite
│   └── components/
├── vite.config.ts            ← tanstackStart() + nitro()
└── package.json

docker-compose
└── app (Node 22, TanStack Start + SQLite)
```

**접속:** http://localhost

---

## 1. 개선 전 시스템의 단점 (초기 Spring + React)

### 1-1. Docker / 아키텍처 분산

- mysql + backend + frontend + nginx **4컨테이너**
- 프론트·백 분리 → CORS, 프록시 설정 필요

### 1-2. 데이터 관리

- `init.sql`만으로 데이터 관리
- 웹에서 CRUD 불가 (초기)

### 1-3. 프론트 데이터 처리

- 페이지마다 `useEffect` + API 호출 중복

### 1-4. 이미지 표시

- `object-fit: cover` + 고정 높이 → **이미지 잘림**

---

## 2. TanStack Start 전환 후 장점

| 항목 | 내용 |
|------|------|
| **진짜 풀스택** | 화면 + 서버 로직 + DB가 **하나의 TypeScript 프로젝트** |
| **Server Functions** | `getFoods`, `createFood` 등 — REST 컨트롤러 불필요 |
| **파일 기반 라우팅** | `src/routes/` — URL과 파일 1:1 |
| **SSR + Loader** | 페이지 진입 시 서버에서 데이터 로드 |
| **Docker 단순화** | **app 1컨테이너** (SQLite 파일 볼륨) |
| **Admin CRUD** | `/admin` — 웹에서 메뉴·레시피 관리 |
| **이미지** | `object-fit: contain` — 잘림 최소화 |

---

## 3. Server Functions (API 대체)

| 함수 | 역할 |
|------|------|
| `getCategories` | 카테고리 목록 |
| `getFoods` | 전체 메뉴 |
| `getRandomFood` | 랜덤 추천 |
| `getFoodsByCategory` | 카테고리별 |
| `searchFoods` | 검색 |
| `getFoodDetail` | 상세 + 레시피 |
| `createFood` / `updateFood` / `deleteFood` | Admin CRUD |

정의 위치: `web/src/server/foods.ts`

---

## 4. 라우트

| URL | 파일 |
|-----|------|
| `/` | `routes/index.tsx` |
| `/random` | `routes/random.tsx` |
| `/search` | `routes/search.tsx` |
| `/categories/$id` | `routes/categories/$id.tsx` |
| `/foods/$id` | `routes/foods/$id.tsx` |
| `/admin` | `routes/admin/index.tsx` |
| `/admin/new` | `routes/admin/new.tsx` |
| `/admin/edit/$id` | `routes/admin/edit/$id.tsx` |

---

## 5. 실행 방법

```powershell
cd C:\Users\dlxlr\Desktop\DishPick
docker compose up --build -d
```

- http://localhost — 사용자 화면
- http://localhost/admin — 메뉴 관리

로컬 개발 (Node 22+ 필요):

```powershell
cd web
npm install
npm run dev
```

SQLite DB 파일: `web/data/dishpick.db` (최초 실행 시 자동 생성·시드)

환경변수: `DATABASE_PATH=./data/dishpick.db` (또는 `DATABASE_URL=file:./data/dishpick.db`)

---

## 6. 향후 개선

- 관리자 로그인
- 이미지 파일 업로드 (URL → S3/로컬 저장)
- AI 맞춤 추천 (가이드 10단계)

---

## 7. 요약

| | Spring + React Query | **TanStack Start (현재)** |
|--|------------------------|---------------------------|
| 언어 | Java + TypeScript | **TypeScript only** |
| API | REST Controller | **Server Functions** |
| 라우팅 | React Router | **TanStack Router** |
| Docker | 2~4 containers | **app 1개 (SQLite)** |
| 풀스택 | ❌ (분리) | **✅** |

---

## 8. SQLite 전환 (2026-06)

MySQL 컨테이너를 제거하고 **SQLite 파일 DB**로 변경했습니다.

| 항목 | 내용 |
|------|------|
| 드라이버 | `better-sqlite3` |
| DB 파일 | `data/dishpick.db` (Docker: `/app/data/dishpick.db` 볼륨) |
| 초기 데이터 | `web/src/db/seed.ts` — 최초 실행 시 자동 시드 |
| Docker | **app 컨테이너 1개** |

초기 데이터는 `web/src/db/seed.ts`에서 관리합니다.

이 문서는 DishPick을 **TanStack Start 풀스택 프레임워크**로 전환한 과정과 그 이유를 기록합니다.
