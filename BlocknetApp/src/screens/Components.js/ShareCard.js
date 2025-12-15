import React from "react";

const ShareCard = ({ share }) => {
  return (
    <div className="share-card border p-3 rounded shadow mb-3">
      <h5>File: {share.file?.filename}</h5>
      <p>Sender: {share.sender?.username} ({share.sender?.email})</p>
      <p>Receiver: {share.receiver?.username} ({share.receiver?.email})</p>
      <p>Shared At: {new Date(share.created_at).toLocaleString()}</p>
    </div>
  );
};

export default ShareCard;
