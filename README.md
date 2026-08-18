# Medisore (메디소어) - AI 욕창 예방 및 스마트 체위 관리 B2B SaaS

> **요양기관과 비전문 간병인을 위한 AI 욕창 예방 및 스마트 돌봄 플랫폼**  
> 2시간 체위 알림부터 AI 자세 분석, 7일 관리기록지 자동 생성까지. 누구나 쉽게 욕창 관리를 표준화하고 돌봄의 공백을 없앱니다.

---

## 🌟 주요 기능 (Key Features)

1. **2시간 순환형 체위 스케줄러 & MediaPipe 자세 코칭**
   - 2시간/2.5시간/3시간 주기별 맞춤 알림 (왼쪽 ⇄ 오른쪽 ⇄ 바로 누움)
   - 스마트폰 카메라 촬영 기반 어깨·골반 30° 측위 신체선열 자동 분석

2. **AI 욕창 상처 단계 판별 & 맞춤 처치 가이드**
   - 모바일 사진 촬영만으로 Stage 1~4 단계 정밀 자동 분류
   - 상처 상태 및 삼출물 양에 따른 최적 드레싱 준비물(칼슘 알지네이트, 폼 등) 및 영상 가이드 제공

3. **돌봄 연속성 보장 타임라인 & 7일 관리기록지 PDF**
   - 시간대별 체위 관리 및 드레싱 내역 실시간 기록
   - 요양기관 공단 평가 및 보호자 공유용 A4 표준 서식 7일 관리기록지 PDF 1초 출력

4. **실시간 AI 자세·체위 시뮬레이터**
   - 브라우저 상에서 MediaPipe 관절 추정, 체압 분산 히트맵, 자동 SOAP 인수인계 리포트 생성 체험

---

## 🚀 배포 및 로컬 실행 방법

### 1. 로컬 실행
별도의 빌드 과정 없이 `index.html` 파일을 웹 브라우저로 바로 실행하거나, 정적 웹 서버를 통해 실행할 수 있습니다.

```bash
# Python 내장 웹 서버 실행 (선택 사항)
python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속

### 2. GitHub Pages 배포
이 저장소는 GitHub Pages를 통해 배포할 수 있습니다.
- Repository Settings > **Pages**
- Build and deployment > Source: **Deploy from a branch**
- Branch: `main` / `root` 선택 후 **Save**

---

## 📁 프로젝트 구조 (Project Structure)

```
medisore-saas/
├── index.html           # 메인 랜딩 페이지
├── README.md            # 프로젝트 소개 및 가이드
├── css/
│   └── style.css        # 메디소어 디자인 시스템 및 반응형 스타일
├── js/
│   ├── app.js           # UI 인터랙션, 네비게이션, 모달 및 알림
│   └── scanner-demo.js  # 실시간 MediaPipe 자세 분석 및 SOAP 시뮬레이터
└── assets/              # 공식 로고 및 실제 서비스 UI/A4 서식 스크린샷
```

---

© 2026 Medisore (메디소어). All Rights Reserved.
