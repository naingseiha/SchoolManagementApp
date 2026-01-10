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
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration: number = 5000; // 5 seconds cache for repeated requests

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Initializes the API client with the given base URL.
   * @param {string} baseURL - The base URL of the API.
   */
  /*******  5363a146-c879-41fa-8f9b-012217083ba8  *******/ constructor(
    baseURL: string
  ) {
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

  async get<T = any>(endpoint: string, useCache: boolean = false): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Check cache for auth endpoints to reduce duplicate requests
    if (useCache && endpoint === "/auth/me") {
      const cached = this.requestCache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log("✅ Using cached response for:", endpoint);
        return cached.data;
      }
    }

    console.log("📤 GET:", url);

    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error("❌ GET Error:", error);
        throw new Error(error.message || "Request failed");
      }

      const data = await response.json();
      console.log("✅ GET Success");

      // ✅ Check if response has .data property
      let result: T;
      if (data && typeof data === "object" && "data" in data) {
        result = data.data;
      } else {
        // ✅ Otherwise return as is (direct array/object)
        result = data;
      }

      // Cache the result for auth endpoints
      if (useCache && endpoint === "/auth/me") {
        this.requestCache.set(endpoint, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error: any) {
      console.error("❌ GET Failed:", error);
      throw error;
    }
  }

  // Clear cache when needed (e.g., on logout)
  clearCache() {
    this.requestCache.clear();
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
    // ✅ Check if wrapped in {success, data}
    if (data && typeof data === "object" && "data" in data) {
      return data.data;
    }

    // ✅ Otherwise return direct object (like backend does)
    return data;
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
