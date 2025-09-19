// components/Notification.tsx

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import MySpinner from "./my-spinner";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "loading";
  onClose: () => void;
  isLoading?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  isLoading = false,
}) => {
  const baseClasses =
    "fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ease-out z-50 backdrop-blur-sm";

  const typeClasses = {
    success: "bg-green-500/90 text-white border border-green-400/30",
    error: "bg-red-500/90 text-white border border-red-400/30",
    loading: "bg-blue-500/90 text-white border border-blue-400/30",
  };

  const getIcon = () => {
    if (isLoading || type === "loading") {
      return <MySpinner size="md" color="white" />;
    }
    return type === "success" ? <CheckCircle size={24} /> : <XCircle size={24} />;
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {getIcon()}
      <span className="font-medium">{message}</span>
      {!isLoading && type !== "loading" && (
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
};

export default Notification;
