# AI 기반 맛집 추천 서비스

## 📦 프로젝트 구성

- **AI 기반 맛집 추천 웹앱**
  - Kakao Map API, Perplexity AI 등 외부 AI/검색 API를 활용한 실시간 맛집 추천 및 리뷰 요약
  - 지도, 거리 계산, 실시간 검색, progressive rendering 등 다양한 최신 기능 포함

- **요기요 리뷰 크롤러 (Python)**
  - 요기요에서 음식점 리뷰 데이터를 수집하는 크롤러
  - 추천 시스템과는 별개로, 데이터 수집 용도로만 사용

---

## 🗺️ AI 기반 맛집 추천 웹앱

### 주요 기능
- Kakao Map API를 활용한 주변 맛집 탐색
- Perplexity AI를 통한 리뷰 요약 및 분위기/특징 요약
- 실시간 거리 계산, 지도 표시, progressive rendering
- 실시간 검색(디바운스 적용), 중복 API 호출 방지, 사용자 친화적 UI

### 사용법
1. `index.html` 또는 `complex_recommender.html`을 브라우저에서 엽니다.
2. 위치 권한을 허용하면 주변 맛집이 지도와 함께 표시됩니다.
3. 검색창에 키워드를 입력하면 AI가 실시간으로 추천 및 요약을 제공합니다.

### 기술 스택
- Kakao Map REST API & JavaScript SDK
- Perplexity AI API
- HTML, CSS, JavaScript (모듈화, progressive rendering)

---

## 🐍 요기요 리뷰 크롤러

### 역할
- 요기요 웹사이트에서 음식점 리뷰 데이터를 수집하는 Python 크롤러(`yogiyo_review_crwaler.py`)
- 수집된 데이터는 별도의 분석/가공/AI 학습 등에 활용 가능
- **추천 시스템과는 별개**로 동작하며, 직접적인 추천 기능은 제공하지 않음

### 사용법
1. Python 환경에서 `yogiyo_review_crwaler.py` 실행
2. 원하는 음식점의 리뷰 데이터를 수집하여 파일로 저장

---

## 📖 기타
- API 키 등 민감 정보는 별도 환경변수 또는 설정 파일로 관리
- 자세한 개발/설치 방법, API 연동법 등은 각 코드 내 주석 및 기존 README 참고

---

문의 및 기여는 [GitHub Issues](https://github.com/iluv4/food-recommend-service/issues)로 남겨주세요.
