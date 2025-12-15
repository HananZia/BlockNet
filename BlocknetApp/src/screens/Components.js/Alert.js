import React from "react";

const Alert = ({ message, type = "info" }) => {
  const colorClass = {
    success: "alert-success",
    error: "alert-danger",
    info: "alert-info",
    warning: "alert-warning",
  }[type];

  return (
    <div className={`alert ${colorClass} mt-2`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
