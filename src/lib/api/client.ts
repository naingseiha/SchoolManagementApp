// API Client with automatic token attachment

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log("📤 GET:", url);

    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        // ✅ FIX: Disable caching to avoid 304 responses
        cache: "no-store",
      });

      console.log("📥 Response status:", response.status);

      // ✅ Handle 304 Not Modified - treat as success but need to refetch
      if (response.status === 304) {
        console.log("⚠️ 304 Not Modified - forcing fresh fetch");
        // Force a fresh request without cache
        const freshResponse = await fetch(url, {
          method: "GET",
          headers: {
            ...headers,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!freshResponse.ok && freshResponse.status !== 304) {
          throw new Error(
            `HTTP ${freshResponse.status}: ${freshResponse.statusText}`
          );
        }

        const data: ApiResponse<T> = await freshResponse.json();
        console.log("✅ GET Success (after 304)");
        return data.data;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error("❌ GET Error:", error);
        throw new Error(error.message || "Request failed");
      }

      const data: ApiResponse<T> = await response.json();
      console.log("✅ GET Success");
      return data.data;
    } catch (error: any) {
      console.error("❌ GET Failed:", error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log("📤 POST:", url);

    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store", // ✅ Disable caching
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error("❌ POST Error:", error);
        throw new Error(error.message || "Request failed");
      }

      const fullResponse: ApiResponse<T> = await response.json();
      console.log("✅ POST Success");
      return fullResponse.data;
    } catch (error: any) {
      console.error("❌ POST Failed:", error);
      throw error;
    }
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = this.getHeaders();

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || "Request failed");
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = this.getHeaders();

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || "Request failed");
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
