import React from "react";

const BlockCard = ({ block }) => {
  return (
    <div className="block-card border p-3 rounded shadow mb-3">
      <h5>Block Index: {block.index}</h5>
      <p>Previous Hash: {block.previous_hash}</p>
      <p>Block Hash: {block.block_hash}</p>
      <p>Timestamp: {new Date(block.timestamp).toLocaleString()}</p>
      <pre className="bg-light p-2 rounded">
        {JSON.stringify(block.data, null, 2)}
      </pre>
    </div>
  );
};

export default BlockCard;
