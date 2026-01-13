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
} from "lucide-react";

type LoginMode = "teacher" | "student";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, isAuthenticated, currentUser } = useAuth();
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
      // Redirect based on role
      if (currentUser.role === "STUDENT") {
        console.log("→ Redirecting student to student portal");
        router.push("/student-portal");
      } else {
        console.log("→ Redirecting to dashboard");
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions
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
      // On success, login function will redirect, so we don't need to do anything here
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "ការចូលបរាជ័យ។ សូមពិនិត្យមើលព័ត៌មានរបស់អ្នក។");
    } finally {
      // Always reset isSubmitting to ensure button doesn't get stuck
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
      return "បញ្ចូលលេខកូដសិស្ស / អ៊ីមែល / ទូរស័ព្ទ";
    }
    return "បញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល";
  };

  const getInputLabel = () => {
    if (loginMode === "student") {
      return "លេខកូដសិស្ស / អ៊ីមែល / ទូរស័ព្ទ";
    }
    return "លេខទូរស័ព្ទ ឬអ៊ីមែល";
  };

  const inputType = formData.identifier.includes("@") ? "email" : "phone";
  const displayError = error || authError;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white/20 rounded-full"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-8 py-12 text-center">
            <div className="absolute inset-0 bg-black/5"></div>

            <div className="relative">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <BookOpen className="h-12 w-12 text-indigo-600" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-khmer-title text-4xl text-white mb-2 drop-shadow-lg">
                ប្រព័ន្ធគ្រប់គ្រងសាលា
              </h1>
              <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            {/* Login Mode Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("teacher");
                  setFormData({ identifier: "", password: "" });
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-khmer-body font-semibold transition-all duration-200 ${
                  loginMode === "teacher"
                    ? "bg-white text-indigo-600 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>គ្រូ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("student");
                  setFormData({ identifier: "", password: "" });
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-khmer-body font-semibold transition-all duration-200 ${
                  loginMode === "student"
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <GraduationCap className="h-5 w-5" />
                <span>សិស្ស</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {displayError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="font-khmer-body text-sm text-red-800">
                      {displayError}
                    </span>
                  </div>
                </div>
              )}

              {/* Identifier Field */}
              <div className="space-y-2">
                <label
                  htmlFor="identifier"
                  className="font-khmer-body block text-sm font-semibold text-gray-700"
                >
                  {getInputLabel()}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    className="font-khmer-body block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder={getPlaceholder()}
                  />
                </div>
                <p className="font-khmer-body text-xs text-gray-500 ml-1">
                  {loginMode === "teacher"
                    ? "គ្រូប្រើលេខទូរស័ព្ទ ចំណែកអ្នកគ្រប់គ្រងប្រើអ៊ីមែល"
                    : "សិស្សប្រើលេខកូដសិស្ស ឬអ៊ីមែល ឬទូរស័ព្ទ"}
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="font-khmer-body block text-sm font-semibold text-gray-700"
                >
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    className="font-khmer-body block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-khmer-body font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
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
        <p className="font-khmer-body text-center text-sm text-white/80 mt-6 drop-shadow-lg">
          © ២០២៥ ប្រព័ន្ធគ្រប់គ្រងសាលា។ រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
