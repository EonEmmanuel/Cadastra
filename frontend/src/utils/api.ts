/**
 * Resilient API client helper for Cadastra-Cameroon.
 *
 * In the browser, routes through Next.js rewrite (/api-backend/...) on the same origin.
 * This bypasses CORS preflight, Private Network Access (PNA), and IPv6 loopback restrictions entirely.
 * Falls back to direct IPv4 127.0.0.1:8000 and localhost:8000.
 */

export const API_BASE = "http://127.0.0.1:8000";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const candidateUrls: string[] = [];
  if (typeof window !== "undefined") {
    // Same-origin reverse proxy through Next.js
    candidateUrls.push(`/api-backend${normalizedPath}`);
  }
  candidateUrls.push(`http://127.0.0.1:8000${normalizedPath}`);
  candidateUrls.push(`http://localhost:8000${normalizedPath}`);

  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ??
    new Error(`Impossible de contacter le serveur backend sur ${candidateUrls.join(" ou ")}`)
  );
}
