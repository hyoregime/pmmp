# 4분할 이미지 편집기

참고 이미지의 구조를 기준으로 만든 GitHub Pages용 정적 편집기입니다.

## 반영된 기능

- 보라색 계열 UI/강조색 없이 흑백/중립색으로 구성
- 2×2 사진 배치
- 사진의 둥근 모서리
- 사진 사이 여백
- 사진 아래 제목/설명 영역
- 상단 전체 제목
- 사진은 cover 방식
- 사진을 드래그해서 크롭 위치 이동
- 마우스 휠로 확대/축소
- 모바일에서는 터치 드래그로 위치 이동
- 결과물 위의 텍스트를 **직접 클릭해서 수정**
- 사진은 클릭/더블클릭하여 교체
- PNG/JPG 저장
- GitHub Pages에서 별도 서버 없이 실행 가능

## GitHub Pages 배포

Repository에 `index.html`, `style.css`, `app.js`, `assets/`를 그대로 올린 뒤
Settings → Pages → Deploy from a branch → main / root를 선택하면 됩니다.
