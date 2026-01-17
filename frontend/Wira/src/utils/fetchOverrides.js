const LOCAL_DEV_API_BASE = "http://localhost:5242/api";
const normalizeEnvApiUrl = (rawUrl) => rawUrl?.replace(/\/+$/, "");
const rawEnvApiUrl = import.meta.env.VITE_API_URL;
const normalizedEnvApiUrl = normalizeEnvApiUrl(rawEnvApiUrl);
const envUrlIncludesApi = normalizedEnvApiUrl?.endsWith("/api");
const API_HOST = envUrlIncludesApi
  ? normalizedEnvApiUrl
  : normalizedEnvApiUrl
  ? `${normalizedEnvApiUrl}/api`
  : LOCAL_DEV_API_BASE;

const originalFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith(LOCAL_DEV_API_BASE)) {
    const suffix = input.slice(LOCAL_DEV_API_BASE.length);
    return originalFetch(`${API_HOST}${suffix}`, init);
  }
  return originalFetch(input, init);
};
