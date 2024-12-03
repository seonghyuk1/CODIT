import React, { useState } from "react";
import axios from "axios";

const PDFUploader = ({ onUpload }: { onUpload: (pdfPath: string) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(response.data.filePath);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* 파일 선택 버튼 */}
        <label
          htmlFor="file-input"
          style={{
            display: "inline-block",
            backgroundColor: "#3f51b5",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "#303f9f";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "#3f51b5";
          }}
        >
          파일 선택
        </label>
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{
            display: "none",
          }}
        />
        {/* 업로드 버튼 */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          style={{
            backgroundColor: selectedFile ? "#3f51b5" : "#e0e0e0",
            color: selectedFile ? "white" : "#9e9e9e",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: selectedFile ? "pointer" : "not-allowed",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
          }}
          onMouseEnter={(e) => {
            if (selectedFile) (e.target as HTMLElement).style.backgroundColor = "#303f9f";
          }}
          onMouseLeave={(e) => {
            if (selectedFile) (e.target as HTMLElement).style.backgroundColor = "#3f51b5";
          }}
        >
          업로드하기...
        </button>
      </div>
      <p
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          marginTop: "10px",
          color: selectedFile ? "#555" : "#000000",
        }}
      >
        {selectedFile ? `선택된 파일: ${selectedFile.name}` : "'파일선택 버튼'을 통해 파일을 업로드해주세요."}
      </p>
    </div>
  );
};

export default PDFUploader;
