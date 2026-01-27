"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Lock,
  AlertCircle,
  Loader2,
  UserCircle,
  Eye,
  EyeOff,
  BookOpen,
  Star,
  Sparkles,
} from "lucide-react";
import StunityLogo from "@/components/common/StunityLogo";

export default function StudentLoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, isAuthenticated, currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && currentUser) {
      if (currentUser.role === "STUDENT") {
        router.push("/feed");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    setError("");
    setIsSubmitting(true);

    try {
      const { identifier, password } = formData;
      if (!identifier || !password) {
        setError("សូមបំពេញលេខកូដសិស្ស និងពាក្យសម្ងាត់");
        return;
      }
      await login({ identifier, password });
    } catch (err: any) {
      setError(err.message || "ការចូលបរាជ័យ។ សូមពិនិត្យមើលព័ត៌មានរបស់អ្នក។");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 safe-area-inset">
      {/* Optimized Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-rose-400/30"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed"></div>
        </div>

        {/* Student-themed Decorative Stars */}
        <div className="hidden sm:block absolute top-10 right-10 text-white/20 animate-pulse">
          <Star className="w-8 h-8 fill-current" />
        </div>
        <div className="hidden sm:block absolute bottom-32 left-16 text-white/15">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div className="hidden md:block absolute top-1/3 right-1/4 text-white/20 animate-pulse animation-delay-1000">
          <Sparkles className="w-7 h-7" />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4 sm:mx-6 my-4 sm:my-8">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
          {/* Compact Header Section - Mobile Optimized */}
          <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 px-6 py-8 sm:px-8 sm:py-10 text-center overflow-hidden">
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            
            {/* Sparkle Effects */}
            <div className="absolute top-4 right-4 text-white/30 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute bottom-4 left-4 text-white/20">
              <Star className="w-4 h-4 fill-current" />
            </div>

            <div className="relative">
              {/* Stunity Logo - Mobile Optimized */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <StunityLogo size="md" />
                  </div>
                </div>
              </div>

              {/* Compact Title */}
              <h1 className="font-battambang text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg tracking-wide">
                ចូលប្រើសិស្ស
              </h1>
              <p className="text-white/90 text-xs sm:text-sm font-poppins tracking-wider mb-2">Student Portal Access</p>
              <div className="w-16 h-1 bg-white/50 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Form Section - Enhanced Spacing */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Enhanced Error Message */}
              {(error || authError) && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-shake">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="font-battambang text-sm text-red-800 leading-relaxed">
                      {error || authError}
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Identifier Field */}
              <div className="space-y-2">
                <label className="font-battambang block text-sm sm:text-base font-semibold text-gray-700 ml-1">
                  លេខកូដសិស្ស / អ៊ីមែល / ទូរស័ព្ទ
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="font-battambang block w-full pl-12 pr-4 py-4 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                    placeholder="បញ្ចូលលេខកូដសិស្ស"
                  />
                </div>
                <p className="font-battambang text-xs sm:text-sm text-gray-500 ml-2">
                  ប្រើលេខកូដសិស្សដែលសាលាបានផ្តល់ឱ្យ
                </p>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-2">
                <label className="font-battambang block text-sm sm:text-base font-semibold text-gray-700 ml-1">
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="font-battambang block w-full pl-12 pr-14 py-4 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-all duration-200 touch-manipulation active:scale-95"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Enhanced Submit Button - Mobile Optimized */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-battambang font-bold py-4 sm:py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base sm:text-lg touch-manipulation relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span>កំពុងចូល...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <span>ចូលប្រព័ន្ធសិស្ស</span>
                  </>
                )}
              </button>

              {/* Teacher Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="font-battambang text-sm text-gray-600 mb-2">
                  តើអ្នកជាគ្រូទេ?
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-battambang font-semibold transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>ចូលសម្រាប់គ្រូ</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Compact on Mobile */}
        <p className="font-battambang text-center text-xs sm:text-sm text-white/90 mt-4 sm:mt-6 drop-shadow-lg px-4">
          © ២០២៥ ប្រព័ន្ធគ្រប់គ្រងសាលា។ រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </p>
      </div>

      <style jsx>{`
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
            transform: translate(-30px, 30px) scale(1.1); 
          }
          66% { 
            transform: translate(20px, -20px) scale(0.9); 
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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

        .animation-delay-1000 {
          animation-delay: 1s;
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
