## CODIT PDF Parser (Developed by 홍성혁) 설명

![image](https://github.com/user-attachments/assets/8a55aa55-7114-4218-8f72-6a8c4fa657a7)


 PDF 파일을 업로드하여 구조화된 데이터를 추출하고 표시하는 React 기반 웹 애플리케이션입니다. 
사용자는 PDF 파일을 업로드하고, PDF의 페이지를 뷰어에서 확인하며, 추출된 데이터를 테이블 형식으로 시각화할 수 있습니다.
(단, 이 프로젝트에서는 의안과 의안원문의 '신·구조문대비표' 만을 이차원 배열로 파싱합니다.)

---

## 프로젝트 기능
- PDF 업로드: 파일 선택 후 업로드 버튼을 통해 PDF 파일을 서버에 업로드합니다.
- PDF 뷰어: 업로드한 PDF의 모든 페이지를 스크롤 가능한 UI에서 확인할 수 있습니다.
- 데이터 파싱: 업로드한 PDF의 특정 규칙에 따라 데이터를 파싱하고 시각화합니다.
- 결과 표시: 파싱된 데이터를 JSON 형식으로 출력하여 명확한 결과를 제공합니다.


---

## 기술스택 

### 프론트엔드
- React (TypeScript)
- CSS-in-JS 
- Axios
- pdfjs-dist

### 백엔드 
- Node.js (Express)

---

## 실행 방법

### 프론트
1. 로컬에 Clone
2. ls (codit 디렉토리 확인) -> cd codit (소문자)
3. 패키지 설치 (npm i)
4. npm start

### 서버
0. 새로운 터미널 open
1. ls (codit 디렉토리 확인) -> cd codit -> cd server
2. 패키지 설치 (npm i)
3. mkdir uploads
4. node index.js

7. 필요 의안과 의안원문 업로드 (파일 선택버튼)
8. 파일 업로드 실행
9. 파싱 결과 확인

---


