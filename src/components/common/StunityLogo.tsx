import React from "react";

interface StunityLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const StunityLogo: React.FC<StunityLogoProps> = ({
  size = "md",
  className = "",
  showText = false,
}) => {
  // Size configurations
  const sizes = {
    sm: {
      container: "32px",
      text: "text-sm",
      gap: "gap-1.5",
    },
    md: {
      container: "48px",
      text: "text-base",
      gap: "gap-2",
    },
    lg: {
      container: "64px",
      text: "text-xl",
      gap: "gap-3",
    },
  };

  const { container: containerSize, text, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Static Logo */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Circular Background with Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 shadow-lg" />

        {/* SVG S Letter */}
        <div className="absolute inset-0 flex items-center justify-center p-[15%]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* First S Outline - Outer Line */}
            <path
              d="M 70 22 C 70 10, 60 5, 50 5 C 35 5, 22 15, 22 28 C 22 40, 32 46, 50 52 C 68 58, 78 64, 78 75 C 78 88, 65 95, 50 95 C 35 95, 22 85, 22 72"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Second S Outline - Inner Line */}
            <path
              d="M 66 26 C 66 16, 58 11, 50 11 C 39 11, 30 19, 30 30 C 30 39, 38 44, 50 50 C 62 56, 70 61, 70 73 C 70 83, 61 89, 50 89 C 39 89, 30 81, 30 70"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Inner Solid S */}
            <path
              d="M 64 28 C 64 19, 57 14, 50 14 C 41 14, 34 21, 34 31 C 34 39, 41 43, 50 49 C 59 55, 66 59, 66 71 C 66 81, 59 86, 50 86 C 41 86, 34 79, 34 69"
              fill="white"
              opacity="0.98"
            />
          </svg>
        </div>
      </div>

      {/* Stunity Text */}
      {showText && (
        <span
          className={`font-bold tracking-wide ${text}`}
          style={{
            background:
              "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb923c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))",
            WebkitTextStroke: "0.5px rgba(234, 88, 12, 0.3)",
          }}
        >
          Stunity
        </span>
      )}
    </div>
  );
};

export default StunityLogo;
