"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Toast, { ToastType } from "@/components/ui/Toast";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(
    () => (
      <>
        {typeof window !== "undefined" &&
          createPortal(
            <div className="fixed top-0 right-0 z-50 p-6 space-y-4 pointer-events-none">
              {toasts.map((toast, index) => (
                <div
                  key={toast.id}
                  className="pointer-events-auto"
                  style={{
                    transform: `translateY(${index * 10}px)`,
                    transition: "transform 0.3s ease",
                  }}
                >
                  <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                  />
                </div>
              ))}
            </div>,
            document.body
          )}
      </>
    ),
    [toasts, removeToast]
  );

  return {
    showToast,
    ToastContainer,
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
    warning: (message: string) => showToast(message, "warning"),
    info: (message: string) => showToast(message, "info"),
  };
}
