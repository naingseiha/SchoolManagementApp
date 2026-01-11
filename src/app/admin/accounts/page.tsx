"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { adminApi, type AccountStatistics } from "@/lib/api/admin";
import { classesApi } from "@/lib/api/classes";

export default function AdminAccountsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-khmer-title text-3xl mb-8">គ្រប់គ្រងគណនីសិស្ស</h1>
        <p className="font-khmer-body">Admin page - under construction</p>
      </div>
    </div>
  );
}
