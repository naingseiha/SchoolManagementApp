"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Lock,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Eye,
  EyeOff,
  UserCircle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import StunityLogo from "@/components/common/StunityLogo";
import Image from "next/image";

type LoginMode = "teacher" | "student";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    isLoading,
    error: authError,
    isAuthenticated,
    currentUser,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("teacher");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && currentUser) {
      console.log("✅ User already authenticated, redirecting...");
      if (currentUser.role === "STUDENT") {
        console.log("→ Redirecting student to feed");
        router.push("/feed");
      } else if (currentUser.role === "PARENT") {
        console.log("→ Redirecting parent to parent portal");
        router.push("/parent-portal");
      } else {
        console.log("→ Redirecting to feed");
        router.push("/feed");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || isLoading) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { identifier, password } = formData;

      if (!identifier || !password) {
        setError("សូមបំពេញលេខទូរស័ព្ទ និងពាក្យសម្ងាត់");
        return;
      }

      await login({ identifier, password });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "ការចូលបរាជ័យ។ សូមពិនិត្យមើលព័ត៌មានរបស់អ្នក។");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const getInputIcon = () => {
    if (loginMode === "student") {
      return <UserCircle className="h-5 w-5 text-gray-400" />;
    }
    return formData.identifier.includes("@") ? (
      <Mail className="h-5 w-5 text-gray-400" />
    ) : (
      <Phone className="h-5 w-5 text-gray-400" />
    );
  };

  const getPlaceholder = () => {
    if (loginMode === "student") {
      return "អត្តលេខ / អ៊ីមែល / ទូរស័ព្ទ";
    }
    return "បញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល";
  };

  const getInputLabel = () => {
    if (loginMode === "student") {
      return "អត្តលេខសិស្ស / អ៊ីមែល / ទូរស័ព្ទ";
    }
    return "លេខទូរស័ព្ទ ឬអ៊ីមែល";
  };

  const displayError = error || authError;

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-white safe-area-inset">
      {/* Login Card */}
      <div className="w-full max-w-md mx-4 sm:mx-6 my-4 sm:my-8">
        {/* Card Container */}
        <div className="bg-white overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-8 sm:px-8 sm:py-10 text-center border-b border-gray-100">
            <div>
              {/* Stunity Logo */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <StunityLogo size="md" />
              </div>

              {/* Title */}
              <h1 className="font-moul text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent mb-2 tracking-wide">
                ប្រព័ន្ធគ្រប់គ្រងសាលា
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm font-poppins tracking-wider mb-2">
                School Management System
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {/* Modern Login Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("teacher");
                  setFormData({ identifier: "", password: "" });
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl font-koulen font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation ${
                  loginMode === "teacher"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span>គ្រូ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("student");
                  setFormData({ identifier: "", password: "" });
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl font-koulen font-semibold text-sm sm:text-base transition-all duration-300 touch-manipulation ${
                  loginMode === "student"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                <span>សិស្ស</span>
              </button>
            </div>

            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Enhanced Error Message */}
              {displayError && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-shake">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="font-battambang text-sm text-red-800 leading-relaxed">
                      {displayError}
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Identifier Field */}
              <div className="space-y-2">
                <label
                  htmlFor="identifier"
                  className="font-koulen block text-sm sm:text-base font-semibold text-gray-700 ml-1"
                >
                  {getInputLabel()}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-orange-600">
                    {getInputIcon()}
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="font-battambang block w-full pl-12 pr-4 py-4 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                    placeholder={getPlaceholder()}
                  />
                </div>
                <p className="font-battambang text-xs sm:text-sm text-gray-500 ml-2">
                  {loginMode === "teacher"
                    ? "គ្រូប្រើលេខទូរស័ព្ទ ចំណែកអ្នកគ្រប់គ្រងប្រើអ៊ីមែល"
                    : "សិស្សប្រើលេខកូដសិស្ស ឬអ៊ីមែល ឬទូរស័ព្ទ"}
                </p>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="font-koulen block text-sm sm:text-base font-semibold text-gray-700 ml-1"
                >
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-orange-600">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="font-battambang block w-full pl-12 pr-14 py-4 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-600 transition-all duration-200 touch-manipulation active:scale-95"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 hover:from-orange-600 hover:via-orange-700 hover:to-yellow-600 text-white font-koulen font-bold py-4 sm:py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base sm:text-lg touch-manipulation relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span>កំពុងចូល...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    <span>ចូលប្រព័ន្ធ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="font-battambang text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 px-4">
          © ២០២៥ ប្រព័ន្ធគ្រប់គ្រងសាលា។ រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
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
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(1.1);
          }
          66% {
            transform: translate(20px, -20px) scale(0.9);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
