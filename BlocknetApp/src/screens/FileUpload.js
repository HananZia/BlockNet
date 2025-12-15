import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/files";

// stores file input, upload result, certificate, verification result, and errors.

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState("");

  // Handle file selection

    const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  // Upload file to backend

    const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedFile(response.data.file);
      setCertificate(response.data.certificate);
      setError("");
    } catch (err) {
      setError("File upload failed");
    }
  };

  // Verify file (send raw file bytes)

    const handleVerify = async () => {
    if (!verifyFile) {
      setError("Please select a file to verify");
      return;
    }

    const formData = new FormData();
    formData.append("file", verifyFile);

    try {
      const response = await axios.post(
         `${API_BASE_URL}/verify`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setVerifyResult(response.data);
      setError("");
    } catch (err) {
      setError("Verification failed");
    }
  };

  // JSX – Upload UI

    return (
    <div style={{ padding: "20px" }}>
      <h2>File Upload</h2>

      <input type="file" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload File</button>


      {uploadedFile && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded File Details</h3>
          <p><strong>Filename:</strong> {uploadedFile.filename}</p>
          <p><strong>File Hash:</strong> {uploadedFile.filehash}</p>
          <p><strong>Uploaded At:</strong> {uploadedFile.created_at}</p>
          <p><strong>Blockchain Index:</strong> {uploadedFile.block_index}</p>
        </div>
      )}


      {certificate && (
        <div style={{ marginTop: "20px" }}>
          <h3>Digital Certificate</h3>
          <p><strong>Certificate ID:</strong> {certificate.cert_id}</p>
          <p><strong>File ID:</strong> {certificate.file_id}</p>
          <p><strong>User ID:</strong> {certificate.user_id}</p>
          <p><strong>Issued At:</strong> {certificate.issued_at}</p>
          <p><strong>Blockchain Index:</strong> {certificate.blockchain_index}</p>
        </div>
      )}


      <hr />

      <h2>Verify File</h2>
      <input
        type="file"
        onChange={(e) => setVerifyFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={handleVerify}>Verify</button>


      {/* Display verification result */}

      {verifyResult && (
        <div style={{ marginTop: "20px" }}>
          {verifyResult.verified ? (
            <>
              <p style={{ color: "green" }}>✅ File is verified</p>
              <p><strong>Filename:</strong> {verifyResult.file.filename}</p>
              <p><strong>File Hash:</strong> {verifyResult.file.filehash}</p>
            </>
          ) : (
            <p style={{ color: "red" }}>❌ File not found</p>
          )}
        </div>
      )}

      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
