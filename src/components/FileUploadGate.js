import React, { useState } from "react";

function FileUploadGate({ onContinue }) {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    setFiles([...e.target.files]);
  };

  const handleContinue = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    onContinue(files);
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0d0d14", color: "#fff" }}>
      <div style={{ background: "#1a1a2e", padding: 40, borderRadius: 20, width: 400, textAlign: "center" }}>
        <h2>Upload Business Files</h2>

        <input type="file" multiple onChange={handleUpload} style={{ marginTop: 20 }} />

        <button
          onClick={handleContinue}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 10,
            background: "#4ac6ff",
            border: "none",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

export default FileUploadGate;