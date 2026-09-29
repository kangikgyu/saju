# 결. 나를 읽는 만세력

생년월일시로 사주 원국, 오행 분포, 십성, 보조 신살과 네 가지 주제의 해석을 보여주는 브라우저 전용 원페이지 앱입니다.

## 실행

Node.js 20.19+ 또는 22.12+가 필요합니다.

```sh
pnpm install
pnpm dev
```

`http://127.0.0.1:4173`에서 열 수 있습니다. 이 Windows 한글 경로에서는 Vite의 의존성 사전 처리 문제가 있어, `dev`는 빌드 후 미리보기로 실행됩니다. 코드를 바꾼 뒤에는 다시 실행해야 합니다. `pnpm test`로 계산 엔진을 확인하고, `pnpm build`로 정적 배포 파일을 `dist/`에 만듭니다.

## 검색 엔진용 배포

공개 URL이 정해지면 빌드할 때 `SITE_URL`을 설정합니다. 사이트가 하위 경로에 배포된다면 그 경로까지 넣어야 합니다.

```powershell
$env:SITE_URL = 'https://example.com/saju/'
pnpm build
```

이 빌드는 `dist/index.html`에 canonical, Open Graph URL·이미지, URL이 포함된 JSON-LD를 넣고 `dist/sitemap.xml`과 `dist/robots.txt`를 생성합니다. `SITE_URL` 없이 빌드하면 실제 공개 주소를 추측하지 않으므로 canonical·sitemap은 생성하지 않습니다. 배포 후 실제 URL이 HTTP 200인지 확인하고 Google Search Console에 sitemap을 제출하세요.

`robots.txt`는 호스트 루트(`/robots.txt`)에 있을 때만 해당 호스트의 크롤링 규칙으로 적용됩니다. GitHub Pages 프로젝트 사이트처럼 `/저장소/` 경로에만 업로드하면 그 파일은 호스트 전체의 robots 규칙이 되지 않습니다. 이 경우 sitemap은 Search Console에 직접 제출하거나 호스트 루트의 robots.txt에서 연결하세요.

앱은 개인 사주 원국과 성향·관계·일/이직·재물의 자기성찰 리포트 외에 연도별 신년운세와 두 사람의 일주 중심 사주 궁합을 제공합니다. 신년운세는 선택한 연도의 입춘 이후 세운을 비교하며, 궁합은 단정적인 점수 대신 일간·일지의 상징을 설명합니다.

## GitHub Pages

`main` 브랜치에 푸시하면 GitHub Actions가 `SITE_URL=https://kangikgyu.github.io/saju/`로 빌드하여 Pages에 배포합니다. 저장소의 Settings > Pages에서 Source를 GitHub Actions로 지정해야 합니다.

## 계산 기준

- 양력/한국 음력 변환: `korean-lunar-calendar`
- 절기 기반 년주·월주와 일주·시주: `lunar-javascript`; 절기 시각은 한국 표준시와의 1시간 차이를 보정
- 일주: 야자시를 다음 날로 넘기지 않는 23시 당일 기준
- 오행: 천간 1, 지지 지장간 가중치 합의 상대 비중
- 용신: 일간과 월지 계절감을 활용한 단순한 **후보**. 신강·신약 및 용신의 확정 판정이 아닙니다.

진태양시, 태어난 지역 및 역사적 서머타임은 반영하지 않습니다. 해석은 전통적 상징을 활용한 자기성찰용이며 미래 사건이나 재정 성과를 예측하지 않습니다. 입력값은 서버에 전송하지 않습니다.
