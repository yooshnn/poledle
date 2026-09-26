# 전봇들 (Poledle)

전봇대 번호판으로 위치를 맞히는 데일리 퍼즐. 서버 없이 정적 파일로 동작한다.

## 시작하기

```sh
pnpm install
cp .env.example .env.local   # VITE_NAVER_MAP_CLIENT_ID 입력
pnpm dev                     # http://localhost:5173
```

NCP 콘솔의 Maps Application에서 Dynamic Map과 Reverse Geocoding을 켜고, Web 서비스 URL에 `http://localhost:5173`(dev), `http://localhost:4173`(preview), `https://poledle.cupya.me`(배포)를 등록한다.

## 명령

| 명령              | 설명                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `pnpm check`      | 포맷, 린트, 타입, 단위 테스트, 빌드                                 |
| `pnpm e2e`        | Playwright e2e (처음 한 번 `pnpm exec playwright install chromium`) |
| `pnpm run deploy` | 빌드 후 Cloudflare Workers에 배포 (`.env.local` 값이 빌드에 들어감) |
