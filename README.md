# PLAY BASEBALL Prototype

팀에 가입하지 않아도 날짜·지역·희망 포지션을 선택해 생활야구 경기에 참가하는 모바일 우선 PWA 프로토타입입니다.

## 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 구현된 흐름

- 지역별 경기 필터
- 경기 카드와 모집 현황
- 경기 상세 바텀시트
- 희망 포지션 최대 3개 선택 및 지망 순서 표시
- 참가 신청 완료 피드백
- 모바일·태블릿·데스크톱 반응형 UI
- 키보드 포커스와 reduced-motion 대응

## 아직 연결되지 않은 기능

- 회원가입과 인증
- 실제 데이터베이스
- 결제·환불
- 운영자 도구
- 실시간 알림과 날씨

구현 순서와 개발 에이전트용 프롬프트는 [docs/IMPLEMENTATION_PROMPT.md](docs/IMPLEMENTATION_PROMPT.md)를 참고하세요.
