"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  User,
  Lock,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth(); // ✅ Get error from context
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState(""); // ✅ Local error state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // ✅ Clear previous errors
    setIsSubmitting(true);

    try {
      const { identifier, password } = formData;

      // ✅ Validate inputs
      if (!identifier || !password) {
        setError("សូមបំពេញលេខទូរស័ព្ទ និងពាក្យសម្ងាត់");
        setIsSubmitting(false);
        return;
      }

      await login({ identifier, password, rememberMe });
      // Redirect is handled by AuthContext
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError("");
  };

  // ✅ Updated demo credentials
  const fillDemoCredentials = (role: "admin" | "teacher") => {
    const credentials = {
      admin: { identifier: "admin@school.edu.kh", password: "admin123" },
      teacher: { identifier: "012123456", password: "012123456" },
    };

    setFormData(credentials[role]);
    setError(""); // Clear errors when filling demo
  };

  // ✅ Detect input type (phone or email)
  const inputType = formData.identifier.includes("@") ? "email" : "phone";

  // ✅ Use local error or auth context error
  const displayError = error || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg: px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full shadow-lg">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            School Management System
          </h2>
          <p className="mt-2 text-lg font-semibold text-gray-700">
            ប្រព័ន្ធគ្រប់គ្រងសាលា
          </p>
          <p className="mt-2 text-sm text-gray-500">
            ចូលប្រើប្រាស់ប្រព័ន្ធ • Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {displayError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">{displayError}</span>
              </div>
            )}

            {/* Identifier Field (Phone or Email) */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                លេខទូរស័ព្ទ ឬអ៊ីមែល • Phone or Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {inputType === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus: ring-2 focus:ring-green-500 focus:border-transparent transition font-semibold"
                  placeholder="012345678 or admin@school.edu.kh"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 font-semibold">
                គ្រូប្រើលេខទូរស័ព្ទ • Admin ប្រើអ៊ីមែល
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                ពាក្យសម្ងាត់ • Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-semibold"
                  placeholder="Enter your password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 font-semibold">
                គ្រូ: ពាក្យសម្ងាត់លើកដំបូគឺដូចគ្នានឹងលេខទូរស័ព្ទ
              </p>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-700 cursor-pointer select-none font-semibold"
                >
                  ចងចាំខ្ញុំ • Remember me
                  <span className="text-xs text-gray-500 ml-1 font-normal">
                    (7 days)
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-green-600 to-blue-600 hover: from-green-700 hover: to-blue-700 focus: outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    កំពុងចូល...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    ចូលប្រព័ន្ធ • Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">
                  ចូលរហ័ស • Quick Login (Demo)
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="group px-4 py-3 border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span className="block text-2xl">👨‍💼</span>
                <span className="block mt-1">Admin</span>
                <span className="block text-xs text-blue-600 mt-0.5">
                  អ៊ីមែល
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("teacher")}
                className="group px-4 py-3 border-2 border-green-200 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span className="block text-2xl">👨‍🏫</span>
                <span className="block mt-1">Teacher</span>
                <span className="block text-xs text-green-600 mt-0.5">
                  លេខទូរស័ព្ទ
                </span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-center text-blue-800 font-semibold mb-2">
                📝 ការណែនាំ
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • <strong>Admin:</strong> ប្រើអ៊ីមែល + ពាក្យសម្ងាត់
                </li>
                <li>
                  • <strong>គ្រូ:</strong> ប្រើលេខទូរស័ព្ទ
                  (ពាក្យសម្ងាត់លើកដំបូគឺដូចគ្នា)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400">
          © 2025 School Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
