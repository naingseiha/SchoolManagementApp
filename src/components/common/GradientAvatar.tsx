"use client";

import { useState } from "react";

interface GradientAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
  isVerified?: boolean;
  level?: number;
  onClick?: () => void;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
};

export default function GradientAvatar({
  name,
  imageUrl,
  size = "md",
  isOnline = false,
  isVerified = false,
  level,
  onClick,
  className = "",
}: GradientAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const initial = name.charAt(0).toUpperCase();
  const sizeClass = SIZE_CLASSES[size];
  
  const shouldShowImage = imageUrl && !imageError;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative ${sizeClass} ${className} ${
        onClick ? "cursor-pointer" : "cursor-default"
      } flex-shrink-0`}
    >
      {/* Simple Instagram-style avatar */}
      <div
        className={`w-full h-full rounded-full overflow-hidden ring-1 ring-gray-200 ${
          !shouldShowImage
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold"
            : ""
        } hover:opacity-90 transition-opacity`}
      >
        {shouldShowImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* Minimal online indicator */}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      )}
    </button>
  );
}
