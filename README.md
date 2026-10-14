# GEN NX — A new dimension

구조도면에서 3D 구조체가 솟아오른 뒤 GEN 배지로 조립되는 8초 티저 2종.
영상 안에는 기능 설명 문구 없이 마지막에 `11.2026`만 표시합니다.

## 결과물

- `exports/gen_teaser_red.mp4` — Crimson, 1920×1080, 30fps, H.264, 무음, 8초
- `exports/gen_teaser_blue.mp4` — Blueprint, 동일 규격
- `exports/gen_teaser_red.gif`, `exports/gen_teaser_blue.gif` — 640×360, 15fps, 무한 반복
- `exports/gen_teaser_*_poster.png` — 최종 장면 1920×1080
- `exports/gen_teaser_source.zip` — 소스와 결과물을 포함한 편집용 프로젝트
- `index.html` — 버전 전환, 탐색, 반복, 전체 화면, 동시 비교, 다운로드
- `render.html` — 실시간 WebGL 애니메이션. `?theme=blue&play=1`, `?theme=red&t=4.5`

### 브랜드 정밀도

**현재 로고는 첨부된 블루프린트 래스터 이미지를 기준으로 재구성한 시안입니다. 공식 로고의 정확한 벡터 복제본은 아닙니다.**
외곽의 우측 상단·좌측 하단 절삭과 GEN 배치를 유지하는 방향으로 제작했습니다.
공식 SVG/AI가 제공되지 않아 자형, 모서리, 비율의 완전한 일치는 검증할 수 없습니다.
브랜드 최종 승인용 출력은 공식 벡터를 `src/logo-data.js`의 `outline`, `parts`, `strokes`에 반영한 뒤 다시 렌더링해야 합니다.
`parts`는 완성된 글자의 폴리곤, `strokes`는 해당 글자로 조립되는 구조 부재의 중심선입니다. 두 데이터를 함께 갱신하세요.
유튜브 링크는 사용자가 제공한 방향 참고 자료이며, 영상 내용을 직접 재생·분석한 결과물이라고 주장하지 않습니다.

## 실행

Node.js 20 이상과 npm이 필요합니다. 현재 환경에서 Node.js 24.19.0 / npm 11.9.0을 사용했습니다.

```sh
cd /workspace/midas-gen-nx-landing
npm ci --cache /tmp/gen-npm-cache --no-audit --no-fund
npm run dev
```

서버 포트는 기본 4173입니다. 필요하면 `PORT=4200 npm run dev`로 변경합니다.
브라우저에서 이 서버의 루트 페이지를 열면 두 영상을 비교할 수 있습니다.
HTML을 파일로 직접 여는 대신 HTTP 서버를 사용하세요. Three.js는 로컬 설치본을 사용하고 외부 CDN·API 키는 필요하지 않습니다.

## MP4 / GIF 재생성

시스템에 Chromium과 FFmpeg가 필요합니다. Chromium은 `CHROMIUM_PATH`로 경로를 지정할 수 있습니다.

```sh
npm run render            # 두 버전 모두
npm run render -- red     # 붉은 버전만
npm run render -- blue    # 푸른 버전만
npm run package           # 편집용 ZIP 갱신 (Python 3 필요)
npm run check
```

렌더러가 임시 포트의 서버와 헤드리스 Chromium을 직접 띄우고 종료합니다. 재생 시간을 프레임 단위로 지정하므로 컴퓨터 속도가 영상 길이에 영향을 주지 않습니다.
240개 프레임을 FFmpeg로 전달하고 `yuv420p`, H.264, `+faststart` MP4로 인코딩합니다. 오디오는 포함하지 않습니다.
GIF는 MP4에서 팔레트를 생성해 변환합니다. 이 환경의 Chromium은 소프트웨어 WebGL로도 실행됩니다. 렌더링은 몇 분 걸릴 수 있습니다.
테스트는 실제 영상 메타데이터·디코딩, 브라우저 재생·탐색·버전 전환·동시 재생 및 모바일 레이아웃을 확인합니다.

## 편집 지점

| 파일 | 내용 |
| --- | --- |
| `src/logo-data.js` | 배지 외곽, GEN 자형, 조립 부재, 돌출 두께 |
| `src/scene.js` | 색상, 소재, 구조도면, 기둥과 보, 조립 경로, 카메라, 타임라인 |
| `render.html` | 배경, 미세 질감, 날짜, 프레임 렌더링 API |
| `scripts/render.mjs` | 해상도, 프레임률, 인코딩, GIF 규격 |
| `src/studio.css`, `src/studio.js` | 미리보기 UI와 컨트롤 |

- 0–1.5초: 기둥 단면, 이중 보선, 중심축, 그리드, 계단 코어, 치수선 등장
- 1.5–3.5초: 기둥과 보가 시차를 두고 상승하며 3D 구조 형성
- 3–6초: 구조 부재가 로고의 선과 면으로 이동·회전·결합, 도면 보조선 정리
- 6–8초: 완성된 로고와 날짜 공개, 카메라 고정. 6.4초 이후 동일한 프레임 유지

끝 장면을 충분히 읽은 뒤 도면으로 돌아가는 루프입니다. 마지막 로고를 시작 도면에 연속적으로 모핑하는 무접합 루프는 아닙니다.

## 랜딩페이지 삽입

```html
<video autoplay muted loop playsinline preload="metadata"
       poster="/media/gen_teaser_red_poster.png"
       style="display:block;width:100%;aspect-ratio:16/9;object-fit:cover">
  <source src="/media/gen_teaser_red.mp4" type="video/mp4">
</video>
```

GIF는 검토용입니다. 실제 랜딩페이지에는 용량과 색 계조가 유리한 MP4를 권장합니다.
비교 페이지는 동작 줄이기 설정을 감지하면 자동재생을 시작하지 않습니다.
화면 외부의 제목과 UI는 MP4에 포함되지 않습니다.

## 클라우드 작업

기존 `/workspace/midas-gen-nx-landing` 체크아웃을 사용합니다. 사용자가 요청하지 않으면 별도 Git worktree를 만들지 않습니다.
실행 중인 서버는 새 환경에 유지되지 않으므로 `npm run dev`로 다시 시작합니다.
정적 MP4와 GIF는 생성된 파일이며, Three.js는 라이브 편집 및 재렌더링에 필요합니다.

## 라이선스

직접 작성한 애니메이션·페이지 소스와 별개로 GEN 브랜드 권리는 해당 권리자에게 있습니다.
Three.js와 Playwright의 라이선스는 npm 설치 패키지에 포함됩니다. 브랜드 공식 원본 승인 여부는 위 내용을 참고하세요.

## 전달 및 오프라인 미리보기

`/workspace/...`는 작업 환경 내부 경로이며 공개 다운로드 URL이 아닙니다. 온보딩 채팅은 로컬 웹 서버를 미리보기로 연결하지 않습니다. 사용자에게 전달하려면 별도의 파일 전달 또는 웹 호스팅 경로가 필요합니다. 내부 HTTP 200은 외부에서의 접근을 보장하지 않습니다.

`python3 scripts/standalone.py`는 MP4·GIF·포스터를 모두 내장한 `exports/gen_teaser_preview.html`을 만듭니다. 이 HTML은 받은 컴퓨터에서 더블클릭해 비교·재생하고 MP4/GIF를 추출할 수 있습니다. 외부 요청이나 Node.js 설치가 필요하지 않습니다. 이 파일은 용량 중복을 피하려고 프로젝트 ZIP에는 포함하지 않습니다.

프로젝트 ZIP을 받은 경우 압축을 풀고 `index.html`을 직접 열어도 영상 비교가 가능합니다. LIVE 3D와 프레임 재렌더링에는 앞서 안내한 HTTP 서버가 필요합니다.

## GitHub Pages 배포

기존 `gh-pages` 루트 랜딩페이지를 보존하고 `/teaser/` 하위 경로에 게시합니다.
소스는 `gen-nx-teaser` 브랜치에 보관합니다.

```sh
npm ci
npm run package
npm run build:pages
npm run check:pages
```

빌드 결과는 `.render/pages/teaser/`입니다. Three.js의 필요한 모듈과 라이선스를 로컬 vendor 디렉터리에 복사하므로 외부 CDN 없이 LIVE 3D를 사용할 수 있습니다.
Pages 테스트는 `/midas-gen-nx-landing/teaser/`와 같은 중첩 경로에서 실제 브라우저 재생·다운로드와 파일 해시를 확인합니다. 이 테스트는 GitHub의 실제 배포 완료를 대신하지 않습니다.
