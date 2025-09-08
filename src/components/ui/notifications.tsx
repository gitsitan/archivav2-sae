// components/Notification.tsx

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const baseClasses =
    "fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-transform duration-300 ease-out z-50";

  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <Icon size={24} />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
};

export default Notification;
