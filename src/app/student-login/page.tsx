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
} from "lucide-react";

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
        router.push("/student-portal");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
      <div className="w-full max-w-md mx-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/90 p-4 rounded-2xl shadow-lg">
                <GraduationCap className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h1 className="font-khmer-title text-4xl text-white mb-2">ចូលប្រើសិស្ស</h1>
            <p className="text-white/80 text-sm">Student Portal Login</p>
          </div>

          <div className="px-8 py-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {(error || authError) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-sm text-red-800">{error || authError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  លេខកូដសិស្ស / អ៊ីមែល / ទូរស័ព្ទ
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="បញ្ចូលលេខកូដសិស្ស"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">ពាក្យសម្ងាត់</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span>កំពុងចូល...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    <span>ចូលប្រព័ន្ធសិស្ស</span>
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  តើអ្នកជាគ្រូទេ?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    ចូលសម្រាប់គ្រូ
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
