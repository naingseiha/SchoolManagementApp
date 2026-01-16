"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";

export interface PasswordStatus {
  isDefaultPassword: boolean;
  passwordExpiresAt: string | null;
  passwordChangedAt: string | null;
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  alertLevel: "none" | "info" | "warning" | "danger" | "expired";
  canExtend: boolean;
}

export function usePasswordStatus() {
  const [status, setStatus] = useState<PasswordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auth/password-status");
      
      // Response is already unwrapped by apiClient
      if (response) {
        setStatus(response);
        setError(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch password status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
}
