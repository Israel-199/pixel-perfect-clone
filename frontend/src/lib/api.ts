export interface FetchApiOptions extends RequestInit {
  skipCache?: boolean;
}

const rawBaseUrl =
  import.meta.env["VITE_API_URL"] ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : "https://pixel-perfect-clone-1-5lm4.onrender.com/api");

const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const API_BASE_URL = cleanBaseUrl.endsWith("/api") ? cleanBaseUrl : `${cleanBaseUrl}/api`;

// In-memory cache for GET requests with 60s TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL_MS = 60_000; // 60 seconds

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of Array.from(cache.keys())) {
    if (key.includes(prefix)) {
      cache.delete(key);
    }
  }
}

export async function fetchApi<T = any>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const token = typeof window !== "undefined" ? localStorage.getItem("rabbi_auth_token") : null;

  // On any mutation, invalidate cached queries so subsequent reads return fresh data
  if (method !== "GET") {
    clearApiCache();
  }

  const isGet = method === "GET";
  const cacheKey = `${endpoint}_${token || "anon"}`;

  // Instant response from in-memory cache if available and fresh
  if (isGet && !options.skipCache && typeof window !== "undefined") {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DEFAULT_TTL_MS) {
      return cached.data as T;
    }

    // In-flight deduplication: reuse active request to prevent duplicate network calls
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const executeFetch = async (): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      if (isGet && typeof window !== "undefined") {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data as T;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  };

  if (isGet && typeof window !== "undefined") {
    const promise = executeFetch();
    inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  return executeFetch();
}
