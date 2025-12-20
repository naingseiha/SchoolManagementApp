"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgGradient: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-600",
    },
    error: {
      icon: AlertCircle,
      bgGradient: "from-red-500 to-rose-500",
      bgLight: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
    },
    warning: {
      icon: AlertTriangle,
      bgGradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      iconColor: "text-amber-600",
    },
    info: {
      icon: Info,
      bgGradient: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
  };

  const style = config[type];
  const Icon = style.icon;

  return (
    <div className="animate-in slide-in-from-top-5 fade-in duration-300 ease-out">
      <div
        className={`${style.bgLight} ${style.borderColor} border rounded-xl shadow-lg overflow-hidden w-full backdrop-blur-sm bg-opacity-95`}
      >
        {/* Gradient Top Bar */}
        <div
          className={`h-1 bg-gradient-to-r ${style.bgGradient}`}
        />

        {/* Content */}
        <div className="p-3 flex items-center gap-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${style.bgGradient} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>

          {/* Message */}
          <div className="flex-1">
            <p
              className={`${style.textColor} font-medium text-sm leading-snug`}
            >
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${style.iconColor} hover:bg-gray-200 p-1 rounded transition-colors duration-150`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-1 bg-gray-200/50">
          <div
            className={`h-full bg-gradient-to-r ${style.bgGradient}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
