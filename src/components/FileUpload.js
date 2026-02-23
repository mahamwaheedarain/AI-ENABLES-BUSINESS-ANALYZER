import React from "react";
import * as XLSX from "xlsx";

const FileUpload = ({ onDataReady }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws);
      onDataReady(data);
    };
    reader.readAsBinaryString(file);
  };

  return <input type="file" accept=".xlsx,.xls" onChange={handleFile} />;
};

export default FileUpload;
