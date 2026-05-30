const ACCESS_KEY  = "lf_access_token";
const REFRESH_KEY = "lf_refresh_token";

// ── Save ───────────────────────────────────────────────────────────────────────
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_KEY,  accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

// ── Get ────────────────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// ── Remove ─────────────────────────────────────────────────────────────────────
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// ── Decode JWT payload (no library needed) ─────────────────────────────────────
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

// ── Check if token is expired ──────────────────────────────────────────────────
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return decoded.exp * 1000 < Date.now();
};

// ── Get current user info from token ──────────────────────────────────────────
export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) return null;
  const decoded = decodeToken(token);
  return decoded
    ? { id: decoded.sub, role: decoded.role }
    : null;
};

// ── Check if user is authenticated ────────────────────────────────────────────
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
};
