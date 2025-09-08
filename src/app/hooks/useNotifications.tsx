// hooks/useNotification.tsx

import { useState, useEffect, useCallback } from "react";

interface NotificationState {
  message: string;
  type: "success" | "error";
  visible: boolean;
}

const initialState: NotificationState = {
  message: "",
  type: "success",
  visible: false,
};

const useNotification = () => {
  const [notification, setNotification] =
    useState<NotificationState>(initialState);

  const showNotification = useCallback(
    (message: string, type: "success" | "error", duration = 3000) => {
      setNotification({ message, type, visible: true });

      // Cache la notification après la durée spécifiée
      const timeoutId = setTimeout(() => {
        setNotification(initialState);
      }, duration);

      // Nettoie le timer si le composant est démonté
      return () => clearTimeout(timeoutId);
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(initialState);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

export default useNotification;
