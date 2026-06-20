# DishPick Cursor AI 개발 가이드

## 프로젝트 개요

프로젝트명: DishPick

목표: - 랜덤 음식 추천 - 한식/중식/일식/양식 등 카테고리 탐색 - 음식
검색 - 음식 상세 정보 조회 - 레시피 조회

기술 스택: - Frontend: React + TypeScript + Vite - Backend: Spring
Boot + Spring Data JPA - Database: MySQL - Deployment: Docker, Docker
Compose, Ubuntu, Nginx

개발 원칙: - 유지보수가 쉬운 구조 - 컴포넌트 단위 분리 - DTO 사용 - 예외
처리 포함 - 수정 파일 목록 먼저 제시 - 기존 구조 최대 유지

## 프로젝트 구조

DishPick/ ├── frontend ├── backend ├── nginx ├── docker-compose.yml └──
README.md

## API

GET /api/categories GET /api/foods GET /api/foods/random GET
/api/foods/category/{id} GET /api/foods/search?keyword= GET
/api/foods/{id}

## DB 설계

Category - id - name

Food - id - category_id - name - description - image_url

Recipe - id - food_id - ingredients - steps

## Cursor 작업 순서

1.  프로젝트 구조 생성
2.  DB 설계 및 SQL 작성
3.  Spring Boot API 구현
4.  React UI 구현
5.  React-Spring 연동
6.  Docker 구성
7.  Ubuntu 서버 배포
8.  Nginx Reverse Proxy 적용
9.  README 작성
10. AI 추천 기능 확장

## Cursor 공통 지침

수정한 파일 목록을 먼저 보여주세요. 전체 코드를 제공해주세요. 기존
구조를 유지하면서 최소한의 변경으로 구현해주세요. 누락된 파일은 함께
생성해주세요.
