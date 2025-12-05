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
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div
        className={`${style.bgLight} ${style.borderColor} border-2 rounded-xl shadow-2xl overflow-hidden max-w-md`}
      >
        {/* Gradient Top Bar */}
        <div className={`h-1. 5 bg-gradient-to-r ${style.bgGradient}`} />

        {/* Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${style.bgGradient} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Message */}
          <div className="flex-1 pt-1">
            <p
              className={`${style.textColor} font-semibold text-sm leading-relaxed`}
            >
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${style.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full bg-gradient-to-r ${style.bgGradient} animate-shrink`}
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
        .animate-shrink {
          animation: shrink ${duration}ms linear forwards;
        }
      `}</style>
    </div>
  );
}
