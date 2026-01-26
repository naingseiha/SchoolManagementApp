"use client";

import { useEffect, useState } from "react";
import StunityLoader from "./StunityLoader";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash after 2.5 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-out"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fde68a 100%)',
        animation: 'fadeOut 0.5s ease-out 2s forwards',
      }}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 right-1/3 w-44 h-44 bg-yellow-300/30 rounded-full blur-3xl animate-float-delayed" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <StunityLoader size="xl" showText={true} />
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          66% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
