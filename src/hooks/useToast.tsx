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
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] p-2 space-y-3 pointer-events-none w-full max-w-md">
              {toasts.map((toast, index) => (
                <div
                  key={toast.id}
                  className="pointer-events-auto"
                  style={{
                    transform: `translateY(${index * 4}px) scale(${
                      1 - index * 0.02
                    })`,
                    opacity: 1 - index * 0.1,
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    zIndex: 99999 - index,
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
