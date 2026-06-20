# DishPick Cursor AI 개발 가이드 (TanStack Start)

> 현재 프로젝트 기준 가이드입니다.  
> 최초 Spring Boot + React 버전 가이드는 `DishPick_Cursor_Guide.md`를 참고하세요.

---

## 프로젝트 개요

**프로젝트명:** DishPick

**목표**

- 랜덤 음식 추천
- 한식 / 중식 / 일식 / 양식 카테고리 탐색
- 음식 검색
- 음식 상세 정보 조회
- 레시피 조회
- Admin에서 메뉴·레시피 CRUD

**기술 스택**

| 구분 | 기술 |
|------|------|
| Framework | TanStack Start, TanStack Router |
| Frontend | React 19, TypeScript, Vite 8 |
| Server | Server Functions (`createServerFn`) |
| Validation | Zod |
| Database | SQLite (`better-sqlite3`) |
| ORM | Drizzle ORM |
| Runtime | Node.js 22 |
| Deployment | Docker, Docker Compose |

**개발 원칙**

- TypeScript 풀스택 단일 프로젝트 (`web/`)
- 화면·서버·DB를 한 코드베이스에서 관리
- 컴포넌트 단위 분리
- Server Function + Zod로 입력 검증
- 기존 구조 최대 유지, 최소 변경으로 구현
- 수정 파일 목록을 먼저 제시

---

## 프로젝트 구조

```text
DishPick/
├── web/                          # 메인 애플리케이션
│   ├── src/
│   │   ├── routes/               # TanStack Router (파일 기반 라우팅)
│   │   ├── server/foods.ts       # Server Functions (DB CRUD)
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle 스키마
│   │   │   ├── index.ts          # DB 연결
│   │   │   ├── init.ts           # 테이블 생성
│   │   │   └── seed.ts           # 초기 샘플 데이터
│   │   ├── components/           # 공통 UI
│   │   ├── styles/               # CSS
│   │   └── types/                # TypeScript 타입
│   ├── data/dishpick.db          # SQLite 파일 (로컬, git 제외)
│   ├── vite.config.ts
│   ├── drizzle.config.ts
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── README.md
├── record.md                     # 개선·전환 기록
├── DishPick_Cursor_Guide.md      # 최초 가이드 (레거시)
└── DishPick_Cursor_Guide_TanStack.md  # 이 문서
```

---

## 라우트

| URL | 파일 | 설명 |
|-----|------|------|
| `/` | `routes/index.tsx` | 홈 |
| `/random` | `routes/random.tsx` | 랜덤 추천 |
| `/search` | `routes/search.tsx` | 검색 |
| `/categories/$id` | `routes/categories/$id.tsx` | 카테고리별 목록 |
| `/foods/$id` | `routes/foods/$id.tsx` | 상세 + 레시피 |
| `/admin` | `routes/admin/index.tsx` | Admin 목록 |
| `/admin/new` | `routes/admin/new.tsx` | 메뉴 등록 |
| `/admin/edit/$id` | `routes/admin/edit/$id.tsx` | 메뉴 수정 |

REST API(`/api/**`)는 사용하지 않습니다. 데이터는 **Server Functions**로 처리합니다.

---

## Server Functions

정의 위치: `web/src/server/foods.ts`

| 함수 | 역할 |
|------|------|
| `getCategories` | 카테고리 목록 |
| `getFoods` | 전체 메뉴 |
| `getRandomFood` | 랜덤 추천 (레시피 포함) |
| `getFoodsByCategory` | 카테고리별 메뉴 |
| `searchFoods` | 이름 검색 |
| `getFoodDetail` | 상세 + 레시피 |
| `createFood` | Admin 등록 |
| `updateFood` | Admin 수정 |
| `deleteFood` | Admin 삭제 |

**사용 예 (라우트 loader)**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { getFoods } from '~/server/foods'

export const Route = createFileRoute('/')({
  loader: () => getFoods(),
  component: HomePage,
})
```

---

## DB 설계

### 테이블

**category**

- id (INTEGER, PK, AUTOINCREMENT)
- name (TEXT, UNIQUE)

**food**

- id (INTEGER, PK, AUTOINCREMENT)
- category_id (INTEGER, FK → category.id)
- name (TEXT)
- description (TEXT)
- image_url (TEXT) — 외부 URL 문자열

**recipe**

- id (INTEGER, PK, AUTOINCREMENT)
- food_id (INTEGER, FK → food.id, UNIQUE)
- ingredients (TEXT) — `|` 구분
- steps (TEXT) — `\n` 구분

### 데이터 파일

| 구분 | 경로 |
|------|------|
| 실제 DB | `web/data/dishpick.db` |
| Docker DB | `/app/data/dishpick.db` (볼륨 `sqlite_data`) |
| 초기 시드 | `web/src/db/seed.ts` |

최초 실행 시 `init.ts`가 테이블을 만들고, 데이터가 없으면 `seed.ts`가 4개 카테고리·12개 메뉴를 넣습니다.

환경변수: `DATABASE_PATH=./data/dishpick.db`

---

## 실행 방법

### Docker (권장)

```powershell
cd C:\Users\dlxlr\Desktop\DishPick
docker compose up --build -d
```

- http://localhost
- http://localhost/admin

종료: `docker compose down`  
DB 초기화: `docker compose down -v` (볼륨 삭제)

### 로컬 개발 (Node 22+)

```powershell
cd web
npm install
npm run dev
```

→ http://localhost:3000

---

## Cursor 작업 순서 (현재 스택 기준)

1. `web/` TanStack Start 프로젝트 구조 확인
2. `src/db/schema.ts` — Drizzle 스키마 정의
3. `src/db/seed.ts` — 초기 데이터 작성
4. `src/server/` — Server Functions 구현
5. `src/routes/` — 화면 + loader/action 연결
6. `src/components/` — UI 컴포넌트 분리
7. Docker (`Dockerfile`, `docker-compose.yml`) 구성
8. `README.md`, `record.md` 갱신
9. AI 추천 기능 확장 (향후)
10. 관리자 인증·이미지 업로드 (향후)

---

## Cursor 공통 지침

- 수정한 파일 목록을 **먼저** 보여주세요.
- 기존 TanStack Start 구조를 유지하면서 **최소한의 변경**으로 구현하세요.
- REST Controller나 별도 백엔드 폴더를 새로 만들지 마세요. Server Functions를 사용하세요.
- DB 변경 시 `schema.ts`, `init.ts`, 필요하면 `seed.ts`를 함께 수정하세요.
- 누락된 파일은 함께 생성하세요.
- Docker 실행 경로는 프로젝트 루트(`DishPick/`)입니다.

---

## 향후 확장

- 관리자 로그인 (Admin 보호)
- 이미지 URL → 파일 업로드 / S3
- AI 기반 맞춤 추천
- 사용자 즐겨찾기

---

## 관련 문서

| 파일 | 내용 |
|------|------|
| `DishPick_Cursor_Guide.md` | 최초 Spring Boot + React 가이드 |
| `DishPick_Cursor_Guide_TanStack.md` | **현재** TanStack Start 가이드 (이 문서) |
| `record.md` | 전환·개선 이력 |
| `README.md` | 실행 방법 요약 |
