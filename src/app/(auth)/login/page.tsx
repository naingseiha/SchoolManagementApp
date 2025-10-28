"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // ✅ FIX: Destructure from formData
      const { email, password } = formData;
      await login({ email, password, rememberMe });
      // Redirect is handled by AuthContext
    } catch (err: any) {
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
  };

  // Demo credentials for quick login
  const fillDemoCredentials = (role: "admin" | "teacher" | "student") => {
    const credentials = {
      admin: { email: "admin@school.com", password: "Admin123!" },
      teacher: { email: "teacher@school.com", password: "Teacher123!" },
      student: { email: "student@school.com", password: "Student123!" },
    };

    setFormData(credentials[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            School Management System
          </h2>
          <p className="mt-2 text-lg font-semibold text-gray-700">
            ប្រព័ន្ធគ្រប់គ្រងសាលា
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start animate-shake">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                អ៊ីមែល • Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition english-modern"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                លេខសម្ងាត់ • Password
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
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                >
                  ចងចាំខ្ញុំ • Remember me
                  <span className="text-xs text-gray-500 ml-1">(7 days)</span>
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Sign in
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

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="group px-3 py-2.5 border-2 border-blue-200 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span className="block">👨‍💼</span>
                <span className="block mt-1">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("teacher")}
                className="group px-3 py-2.5 border-2 border-green-200 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span className="block">👨‍🏫</span>
                <span className="block mt-1">Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("student")}
                className="group px-3 py-2.5 border-2 border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span className="block">👨‍🎓</span>
                <span className="block mt-1">Student</span>
              </button>
            </div>

            <div className="mt-4 text-xs text-center text-gray-500">
              <p>Click any role above to auto-fill credentials</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Register here
          </a>
        </p>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400">
          © 2025 School Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
