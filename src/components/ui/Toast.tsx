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
    <div className="animate-in slide-in-from-right-5 fade-in duration-500 ease-out">
      <div
        className={`${style.bgLight} ${style.borderColor} border-2 rounded-2xl shadow-2xl overflow-hidden max-w-md backdrop-blur-sm bg-opacity-95 transform transition-all hover:scale-105 hover:shadow-3xl`}
      >
        {/* Gradient Top Bar with Pulse Animation */}
        <div
          className={`h-2 bg-gradient-to-r ${style.bgGradient} animate-pulse-subtle`}
        />

        {/* Content */}
        <div className="p-4 flex items-start gap-4">
          {/* Icon with Bounce Animation */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${style.bgGradient} flex items-center justify-center shadow-lg animate-bounce-subtle`}
          >
            <Icon className="w-6 h-6 text-white drop-shadow-md" />
          </div>

          {/* Message */}
          <div className="flex-1 pt-1.5">
            <p
              className={`${style.textColor} font-bold text-base leading-relaxed tracking-tight`}
            >
              {message}
            </p>
          </div>

          {/* Close Button with Hover Effect */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${style.iconColor} hover:bg-gray-200 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-1.5 bg-gray-200/50">
          <div
            className={`h-full bg-gradient-to-r ${style.bgGradient} shadow-inner`}
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
        @keyframes pulse-subtle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
