// Blockchain.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/blockchain";

const Blockchain = () => {
  const [blocks, setBlocks] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blockchain and validity from backend

    useEffect(() => {
    const fetchBlockchain = async () => {
      try {
        // Fetch full blockchain
        const chainResponse = await axios.get(`${API_BASE_URL}/chain`);
        setBlocks(chainResponse.data);

        // Fetch blockchain validity
        const validateResponse = await axios.get(`${API_BASE_URL}/validate`);
        setIsValid(validateResponse.data.valid);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching blockchain:", error);
        setLoading(false);
      }
    };

    fetchBlockchain();
  }, []);

    if (loading) {
    return <p>Loading blockchain data...</p>;
  }

  //Render loading state, validity, and blocks
  
  return (
    <div style={{ padding: "20px" }}>
      <h2>Blockchain Status: {isValid ? "Valid ✅" : "Invalid ❌"}</h2>

      <h3>All Blocks</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Index</th>
            <th>Previous Hash</th>
            <th>Block Hash</th>
            <th>Data</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.index}>
              <td>{block.index}</td>
              <td style={{ wordBreak: "break-all" }}>{block.previous_hash}</td>
              <td style={{ wordBreak: "break-all" }}>{block.block_hash}</td>
              <td>
                <pre style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              </td>
              <td>{new Date(block.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Blockchain;

