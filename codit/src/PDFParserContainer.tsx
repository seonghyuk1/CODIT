import { useState } from "react";
import PDFUploader from "./PDFUploader";
import PDFViewer from "./PDFViewer";

const PDFParserContainer = () => {
  const [pdfPath, setPdfPath] = useState<string>("");

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        height: "950vh",
        backgroundColor: "#f5f5f5",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid #ddd",
          padding: "20px 0",
          textAlign: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ fontSize: "24px", color: "#3f51b5", margin: "0" }}>CODIT PDF Parser (Developed by 홍성혁)</h1>
        <div style={{ marginTop: "10px" }}>
          <PDFUploader onUpload={setPdfPath} />
        </div>
      </div>

      <div
        style={{
          marginTop: "180px",
          width: "100%",
          maxWidth: "1000px",
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        {pdfPath ? <PDFViewer pdfPath={`http://localhost:5000${pdfPath}`} /> : <p style={{ textAlign: "center", color: "#999" }}>PDF를 업로드해주세요.</p>}
      </div>
    </div>
  );
};

export default PDFParserContainer;
