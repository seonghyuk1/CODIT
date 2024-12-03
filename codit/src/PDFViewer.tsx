import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

// ! 내가 생각한 파싱 규칙
// 각 좌/우 데이터가 순회할 때 나머지 인덱스 중 (공백 제외)에 값이 존재한다면 계속 같은 인덱스에 넣음
// 나머지 인덱스가 모두 공백으로 존재하는 빈 인덱스들이라면 해당 행에 맞는 한 쪽은 새로운 인덱스를 생성하여 행 값을 넣어줌

// 타입 가드 선언
const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => {
  return (item as TextItem).str !== undefined;
};

// 특정 페이지에서 텍스트를 가져오는 함수
const extractPageText = (items: (TextItem | TextMarkedContent)[], yThreshold: number) => {
  return items
    .filter(isTextItem)
    .filter((item) => item.transform[5] > yThreshold)
    .map((item) => item.str.trim())
    .join(" ");
};

interface GroupTextParams {
  items: (TextItem | TextMarkedContent)[]; // 텍스트 항목 배열
  xRange: { min: number; max: number }; // X 좌표 범위
  yRange: { min: number; max: number }; // Y 좌표 범위
}

const groupTextByCoordinates = ({ items, xRange, yRange }: GroupTextParams) => {
  const rows: { [key: number]: { x: number; text: string }[] } = {}; // 좌표 그룹화 결과 저장

  // 텍스트 항목 필터링 및 처리
  items.filter(isTextItem).forEach((item) => {
    const text = item.str.trim(); // 텍스트 값
    const x = item.transform[4]; // X 좌표
    const y = item.transform[5]; // Y 좌표

    // X, Y 좌표가 지정된 범위 안에 있는 경우만 처리
    if (x > xRange.min && x < xRange.max && y > yRange.min && y < yRange.max) {
      const roundedY = Math.round(y / 5) * 5; // Y 좌표를 5의 배수로 반올림하여 그룹화
      if (!rows[roundedY]) rows[roundedY] = []; // 해당 Y 좌표가 없으면 초기화
      rows[roundedY].push({ x, text }); // X 좌표와 텍스트를 추가
    }
  });

  return rows; // 그룹화된 결과 반환
};

const formatTableData = async (pdfPath: string) => {
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdfDoc = await loadingTask.promise;

  const formattedData = []; // 최종 JSON 형태의 데이터
  let startPage = 1; // 기본 시작 페이지 (동적으로 변경됨)

  // '신·구조문대비표' 탐색 로직
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const topText = extractPageText(textContent.items, 700);
    if (topText.includes("신·구조문대비표")) {
      startPage = pageNum;
      break;
    }
  }

  for (let pageNum = startPage; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // 신구조문일 땐 TITLE 제외
    const isStartYPosition = startPage === pageNum ? 700 : 750;

    const rows = groupTextByCoordinates({
      items: textContent.items,
      xRange: { min: 50, max: 550 },
      yRange: { min: 100, max: isStartYPosition },
    });

    const pageRows = Object.keys(rows)
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => {
        const rowItems = rows[Number(y)].sort((a, b) => a.x - b.x);

        // "현행" 열 (좌측 x < 250)
        const left = rowItems
          .filter((item) => item.x < 250)
          .map((item) => item.text)
          .join(" ")
          .trim();

        // "개정안" 열 (우측 >= 250)
        const right = rowItems
          .filter((item) => item.x >= 250)
          .map((item) => item.text)
          .join(" ")
          .trim();
        return [left, right];
      });

    const mergedRows: string[][] = [];

    // 현재 병합 중인 행 초기화
    let currentRow: string[] = ["", ""];

    pageRows.forEach(([left, right], index) => {
      const trimmedLeft = left.trim();
      const trimmedRight = right.trim();

      if (index === 0) {
        mergedRows.push([trimmedLeft, trimmedRight]);
        currentRow = ["", ""];
        return;
      }

      if (trimmedLeft || trimmedRight) {
        if (trimmedLeft) currentRow[0] = currentRow[0] ? `${currentRow[0]}\n${trimmedLeft}` : trimmedLeft;
        if (trimmedRight) currentRow[1] = currentRow[1] ? `${currentRow[1]}\n${trimmedRight}` : trimmedRight;
      }

      if ((!trimmedLeft && !pageRows.slice(index + 1).some(([l]) => l.trim())) || (!trimmedRight && !pageRows.slice(index + 1).some(([, r]) => r.trim()))) {
        mergedRows.push([...currentRow]);
        currentRow = ["", ""];
      }
    });

    if (currentRow[0] || currentRow[1]) mergedRows.push([...currentRow]);

    formattedData.push(mergedRows);
  }

  return formattedData;
};

const PDFViewer = ({ pdfPath }: { pdfPath: string }) => {
  const [pages, setPages] = useState<JSX.Element[]>([]);
  const [tableData, setTableData] = useState<string[][][]>([]);

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfPath);
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      const renderedPages = [];
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.7 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          renderedPages.push(<img src={canvas.toDataURL()} alt={`Page ${pageNum}`} key={pageNum} />);
        }
      }

      setPages(renderedPages);
    };

    renderPDF();

    const loadTableData = async () => {
      const data = await formatTableData(pdfPath);
      setTableData(data);
    };

    loadTableData();
  }, [pdfPath]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        gap: "20px",
        height: "80vh",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#fff",
        }}
      >
        <h3>업로드 된 PDF</h3>

        {pages}
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#fff",
        }}
      >
        <h3>신·구조문대비표 파싱 결과</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(tableData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default PDFViewer;
