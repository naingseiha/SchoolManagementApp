"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { User, School, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ការកំណត់ Settings
            </h1>
            <p className="text-gray-600">ការកំណត់ប្រព័ន្ធ System Settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    គណនីរបស់ខ្ញុំ My Account
                  </h2>
                  <p className="text-sm text-gray-600">ព័ត៌មានអ្នកប្រើប្រាស់</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">ឈ្មោះ:</span>
                  <span className="font-medium">{currentUser?.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">តួនាទី:</span>
                  <span className="font-medium capitalize">
                    {currentUser?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">លេខទូរស័ព្ទ:</span>
                  <span className="font-medium">
                    {currentUser?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <School className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    ព័ត៌មានសាលា School Info
                  </h2>
                  <p className="text-sm text-gray-600">ព័ត៌មានរបស់សាលា</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">ឈ្មោះសាលា:</span>
                  <span className="font-medium">សាលាមធ្យម</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">ឆ្នាំសិក្សា:</span>
                  <span className="font-medium">
                    {new Date().getFullYear()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">ប្រព័ន្ធ:</span>
                  <span className="font-medium">v1.0.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    ការជូនដំណឹង Notifications
                  </h2>
                  <p className="text-sm text-gray-600">ការកំណត់ការជូនដំណឹង</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                មុខងារនេះនឹងមាននៅក្នុងកំណែបន្ទាប់ Coming soon in next version
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    សុវត្ថិភាព Security
                  </h2>
                  <p className="text-sm text-gray-600">ការកំណត់សុវត្ថិភាព</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                ផ្លាស់ប្តូរលេខសម្ងាត់ និងការកំណត់សុវត្ថិភាពផ្សេងៗ Change
                password and other security settings
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
