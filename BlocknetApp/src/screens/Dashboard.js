import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Main Dashboard component

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [chainValid, setChainValid] = useState(null);

  // JWT header
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchUserInfo();
    fetchSharedFiles();
    fetchBlockchain();
  }, []);

  //Fetch logged-in user info

    const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, config);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  // Fetch shared files

    const fetchSharedFiles = async () => {
    try {
      const receivedRes = await axios.get(`${API_BASE_URL}/share/received`, config);
      setReceivedFiles(receivedRes.data);

      const sentRes = await axios.get(`${API_BASE_URL}/share/sent`, config);
      setSentFiles(sentRes.data);
    } catch (err) {
      console.error("Error fetching shared files:", err);
    }
  };

  //Fetch blockchain info

    const fetchBlockchain = async () => {
    try {
      const chainRes = await axios.get(`${API_BASE_URL}/blockchain/chain`);
      setBlockchain(chainRes.data);

      const validateRes = await axios.get(`${API_BASE_URL}/blockchain/validate`);
      setChainValid(validateRes.data.valid);
    } catch (err) {
      console.error("Error fetching blockchain info:", err);
    }
  };

  //File upload handler

    const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/files/upload`, formData, config);
      alert("File uploaded successfully: " + res.data.file.filename);
      fetchSharedFiles(); // refresh file lists if needed
    } catch (err) {
      console.error("File upload error:", err);
      alert("File upload failed");
    }
  };

  //File verification handler

    const handleFileVerify = async () => {
    const filehash = prompt("Enter file hash to verify:");
    if (!filehash) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/files/verify`, { filehash }, config);
      if (res.data.verified) {
        alert(`File verified: ${res.data.file.filename}`);
      } else {
        alert("File not found / verification failed");
      }
    } catch (err) {
      console.error("File verification error:", err);
    }
  };

  //File sharing handler

    const handleFileShare = async () => {
    const fileId = prompt("Enter file ID to share:");
    const email = prompt("Enter recipient email:");
    if (!fileId || !email) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/share/send`,
        { receiver_email: email, file_id: Number(fileId) },
        config
      );
      alert("File shared successfully");
      fetchSharedFiles();
    } catch (err) {
      console.error("File share error:", err);
      alert("File share failed: " + (err.response?.data?.error || ""));
    }
  };

  //JSX for rendering dashboard

    return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}

      <hr />

      <div>
        <h3>Actions</h3>
        <input type="file" onChange={handleFileUpload} />
        <button onClick={handleFileVerify}>Verify File</button>
        <button onClick={handleFileShare}>Share File</button>
      </div>

      <hr />

      <div>
        <h3>Files Shared With You</h3>
        <ul>
          {receivedFiles.map(f => (
            <li key={f.id}>{f.file_id} shared by {f.sender_id}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Files You Shared</h3>
        <ul>
          {sentFiles.map(f => (
            <li key={f.id}>{f.file_id} shared to {f.receiver_id}</li>
          ))}
        </ul>
      </div>

      <hr />

      <div>
        <h3>Blockchain Info</h3>
        <p>Chain valid: {chainValid ? "Yes" : "No"}</p>
        <ul>
          {blockchain.map(block => (
            <li key={block.index}>
              #{block.index} - {block.block_hash.substring(0, 10)}... - {block.timestamp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;