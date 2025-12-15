import React from "react";

const Modal = ({ title, children, show, onClose }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content p-4 bg-white rounded shadow">
        <h5>{title}</h5>
        {children}
        <button className="btn btn-secondary mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
