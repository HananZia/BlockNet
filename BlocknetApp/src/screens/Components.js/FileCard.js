import React from "react";

const FileCard = ({ file }) => {
  return (
    <div className="file-card border p-3 rounded shadow mb-3">
      <h5>Filename: {file.filename}</h5>
      <p>Hash: {file.filehash}</p>
      <p>Uploaded At: {new Date(file.created_at).toLocaleString()}</p>
      {file.certificate && (
        <div className="certificate-info mt-2 p-2 border rounded bg-light">
          <p>Certificate ID: {file.certificate.cert_id}</p>
          <p>Blockchain Index: {file.certificate.blockchain_index}</p>
        </div>
      )}
    </div>
  );
};

export default FileCard;
