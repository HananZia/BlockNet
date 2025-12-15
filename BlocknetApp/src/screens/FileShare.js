// FileShare.js
import React, { useEffect, useState } from "react";
import axios from "axios";

//API base URL & JWT helper

const API_BASE = "http://localhost:5000/api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

// Component state

const FileShare = () => {
  const [myFiles, setMyFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);

  const [receiverEmail, setReceiverEmail] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");

  const [message, setMessage] = useState("");

  // Fetch user’s own files Needed to select file_id while sharing.

    const fetchMyFiles = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/files/me`,
        authHeader()
      );
      setMyFiles(res.data);
    } catch (err) {
      console.error("Failed to load files");
    }
  };

  //Fetch files shared by user

    const fetchSentFiles = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/share/sent`,
        authHeader()
      );
      setSentFiles(res.data);
    } catch (err) {
      console.error("Failed to load sent files");
    }
  };

  // Fetch files shared with user

    const fetchReceivedFiles = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/share/received`,
        authHeader()
      );
      setReceivedFiles(res.data);
    } catch (err) {
      console.error("Failed to load received files");
    }
  };

  // Load all data on page load

    useEffect(() => {
    fetchMyFiles();
    fetchSentFiles();
    fetchReceivedFiles();
  }, []);

  // Share file handler

    const handleShare = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        `${API_BASE}/share/send`,
        {
          receiver_email: receiverEmail,
          file_id: selectedFileId,
        },
        authHeader()
      );

      setMessage(res.data.message);
      setReceiverEmail("");
      setSelectedFileId("");

      fetchSentFiles(); // refresh list
    } catch (err) {
      setMessage(
        err.response?.data?.error || "File sharing failed"
      );
    }
  };

  //Share file form UI
    return (
    <div>
      <h2>Share a File</h2>

      <form onSubmit={handleShare}>
        <input
          type="email"
          placeholder="Receiver Email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          required
        />

        <select
          value={selectedFileId}
          onChange={(e) => setSelectedFileId(e.target.value)}
          required
        >
          <option value="">Select File</option>
          {myFiles.map((file) => (
            <option key={file.id} value={file.id}>
              {file.filename}
            </option>
          ))}
        </select>

        <button type="submit">Share File</button>
      </form>

      {message && <p>{message}</p>}

      <h3>Files Shared By You</h3>
      <ul>
        {sentFiles.map((share) => (
          <li key={share.id}>
            File ID: {share.file_id} → User ID: {share.receiver_id}
          </li>
        ))}
      </ul>

      <h3>Files Shared With You</h3>
      <ul>
        {receivedFiles.map((share) => (
          <li key={share.id}>
            File ID: {share.file_id} ← User ID: {share.sender_id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileShare;

