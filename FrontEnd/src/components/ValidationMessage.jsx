import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const ValidationMessage = ({ type = "error", message }) => {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    success: "bg-green-50 border-green-200 text-green-700",
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 mb-4 flex items-start`}>
      <AiOutlineExclamationCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default ValidationMessage;