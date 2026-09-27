# 전봇들 (Poledle)

전봇대 번호판으로 위치를 맞히는 데일리 퍼즐.

## 시작하기

```sh
pnpm install
cp .env.example .env.local   # VITE_NAVER_MAP_CLIENT_ID 입력
pnpm dev                     # http://localhost:5173
```

## 명령

| 명령              | 설명                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `pnpm check`      | 포맷, 린트, 타입, 단위 테스트, 빌드                                 |
| `pnpm e2e`        | Playwright e2e (처음 한 번 `pnpm exec playwright install chromium`) |
| `pnpm run deploy` | 빌드 후 Cloudflare Workers에 배포 (`.env.local` 값이 빌드에 들어감) |

## 데이터 출처

- 출제 번호: 한국전력공사 공개 전주전산화번호 데이터
- 육지 경계: Natural Earth 1:10m(퍼블릭 도메인)
- 지도·주소: NAVER Cloud Platform Maps
- 글꼴: Paperlogy(OFL)
