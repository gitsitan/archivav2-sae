// hooks/useNotification.tsx

import { useState, useEffect, useCallback } from "react";

interface NotificationState {
  message: string;
  type: "success" | "error" | "loading";
  visible: boolean;
  isLoading?: boolean;
}

const initialState: NotificationState = {
  message: "",
  type: "success",
  visible: false,
  isLoading: false,
};

const useNotification = () => {
  const [notification, setNotification] =
    useState<NotificationState>(initialState);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "loading", duration = 1000, isLoading = false) => {
      setNotification({ message, type, visible: true, isLoading });

      // Cache la notification après la durée spécifiée (sauf pour loading)
      if (type !== "loading") {
        const timeoutId = setTimeout(() => {
          setNotification(initialState);
        }, duration);

        // Nettoie le timer si le composant est démonté
        return () => clearTimeout(timeoutId);
      }
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
