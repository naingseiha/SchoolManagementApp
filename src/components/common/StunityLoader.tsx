import React from "react";

interface StunityLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const StunityLoader: React.FC<StunityLoaderProps> = ({
  size = "md",
  showText = false,
  className = "",
}) => {
  // Size configurations
  const sizes = {
    sm: {
      container: "48px",
      text: "text-sm",
      gap: "gap-2",
      flexDirection: "flex-row",
    },
    md: {
      container: "80px",
      text: "text-xl",
      gap: "gap-3",
      flexDirection: "flex-col",
    },
    lg: {
      container: "120px",
      text: "text-3xl",
      gap: "gap-4",
      flexDirection: "flex-col",
    },
    xl: {
      container: "160px",
      text: "text-4xl",
      gap: "gap-5",
      flexDirection: "flex-col",
    },
  };

  const { container: containerSize, text, gap, flexDirection } = sizes[size];

  return (
    <div className={`flex ${flexDirection} items-center justify-center ${gap} ${className}`}>
      {/* Animated Loader Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Circular Background with Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 shadow-2xl" />

        {/* SVG S Letter with Multiple Concentric Outlines */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outermost S Outline (Layer 1) - Draws First */}
            <path
              d="M 70 22 C 70 10, 60 5, 50 5 C 35 5, 22 15, 22 28 C 22 40, 32 46, 50 52 C 68 58, 78 64, 78 75 C 78 88, 65 95, 50 95 C 35 95, 22 85, 22 72"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: "250",
                strokeDashoffset: "250",
                animation: "drawS 2s ease-in-out infinite",
              }}
            />

            {/* Second S Outline (Layer 2) - Draws Second */}
            <path
              d="M 68 24 C 68 13, 59 8, 50 8 C 37 8, 26 17, 26 29 C 26 39, 35 45, 50 51 C 65 57, 74 63, 74 74 C 74 85, 63 92, 50 92 C 37 92, 26 83, 26 71"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: "240",
                strokeDashoffset: "240",
                animation: "drawS 2s ease-in-out 0.15s infinite",
              }}
            />

            {/* Third S Outline (Layer 3) - Draws Third */}
            <path
              d="M 66 26 C 66 16, 58 11, 50 11 C 39 11, 30 19, 30 30 C 30 39, 38 44, 50 50 C 62 56, 70 61, 70 73 C 70 83, 61 89, 50 89 C 39 89, 30 81, 30 70"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: "230",
                strokeDashoffset: "230",
                animation: "drawS 2s ease-in-out 0.3s infinite",
              }}
            />

            {/* Inner S Fill (Solid Core) - Fades In Last */}
            <path
              d="M 64 28 C 64 19, 57 14, 50 14 C 41 14, 34 21, 34 31 C 34 39, 41 43, 50 49 C 59 55, 66 59, 66 71 C 66 81, 59 86, 50 86 C 41 86, 34 79, 34 69"
              fill="white"
              opacity="0.95"
              style={{
                animation: "fadeIn 2s ease-in-out 0.5s infinite",
              }}
            />
          </svg>
        </div>
      </div>

      {/* StunitY Text */}
      {showText && (
        <div className="flex flex-col items-center gap-2 animate-fade-in-up">
          <h2
            className={`font-bold tracking-wide ${text}`}
            style={{
              background:
                "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb923c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            StunitY
          </h2>
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "1s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "150ms", animationDuration: "1s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "300ms", animationDuration: "1s" }}
            />
          </div>
        </div>
      )}

      {/* Inline Keyframe Animations */}
      <style jsx>{`
        @keyframes drawS {
          0% {
            stroke-dashoffset: 250;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            stroke-dashoffset: 0;
          }
          80% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 250;
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0;
          }
          50% {
            opacity: 0.95;
          }
          80% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StunityLoader;
