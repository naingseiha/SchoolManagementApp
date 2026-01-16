"use client";

import React from "react";
import { AlertTriangle, Clock, Lock, X } from "lucide-react";

interface PasswordExpiryWarningProps {
  isDefaultPassword: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  alertLevel: "none" | "info" | "warning" | "danger" | "expired";
  onChangePassword: () => void;
  onDismiss?: () => void;
  canDismiss?: boolean;
}

export default function PasswordExpiryWarning({
  isDefaultPassword,
  daysRemaining,
  hoursRemaining,
  alertLevel,
  onChangePassword,
  onDismiss,
  canDismiss = true,
}: PasswordExpiryWarningProps) {
  if (!isDefaultPassword || alertLevel === "none") {
    return null;
  }

  const getAlertStyles = () => {
    switch (alertLevel) {
      case "danger":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-200",
          button: "bg-red-600 hover:bg-red-700 text-white",
          icon: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800",
          text: "text-orange-800 dark:text-orange-200",
          button: "bg-orange-600 hover:bg-orange-700 text-white",
          icon: "text-orange-600 dark:text-orange-400",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-200",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: "text-blue-600 dark:text-blue-400",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          text: "text-gray-800 dark:text-gray-200",
          button: "bg-gray-600 hover:bg-gray-700 text-white",
          icon: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const getMessage = () => {
    if (alertLevel === "expired") {
      return {
        title: "ពាក្យសម្ងាត់ផុតកំណត់ | Password Expired",
        message: "សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ | Please contact admin",
      };
    }

    if (daysRemaining === 0) {
      return {
        title: "ចាំបាច់ប្តូរពាក្យសម្ងាត់ភ្លាមៗ! | Change Password Urgently!",
        message: `នៅសល់តែ ${hoursRemaining} ម៉ោងទៀត | Only ${hoursRemaining} hours remaining`,
      };
    }

    if (daysRemaining === 1) {
      return {
        title: "ចាំបាច់ប្តូរពាក្យសម្ងាត់! | Change Password Required!",
        message: `នៅសល់ 1 ថ្ងៃទៀត | 1 day remaining`,
      };
    }

    return {
      title: "សូមប្តូរពាក្យសម្ងាត់ | Please Change Password",
      message: `នៅសល់ ${daysRemaining} ថ្ងៃទៀត | ${daysRemaining} days remaining`,
    };
  };

  const styles = getAlertStyles();
  const { title, message } = getMessage();
  const shouldAnimate = alertLevel === "danger";

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg p-4 mb-4 
        transition-all duration-300
        ${shouldAnimate ? "animate-pulse" : ""}
      `}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {alertLevel === "danger" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{title}</h3>
              <p className="text-sm mb-3">{message}</p>
              
              {/* Time Display */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Clock className="w-4 h-4" />
                <span>
                  អ្នកកំពុងប្រើពាក្យសម្ងាត់លំនាំដើម (លេខទូរសព្ទ)
                </span>
              </div>

              <p className="text-xs opacity-80">
                You are using the default password (your phone number). Please change it to a secure password.
              </p>
            </div>

            {/* Dismiss Button */}
            {canDismiss && onDismiss && alertLevel !== "danger" && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={onChangePassword}
            className={`
              ${styles.button}
              px-6 py-2 rounded-lg font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
          >
            ប្តូរពាក្យសម្ងាត់ឥឡូវនេះ | Change Password Now
          </button>
        </div>
      </div>
    </div>
  );
}
