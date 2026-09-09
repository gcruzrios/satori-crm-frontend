// Tiny bridge shared by api.js and auth.jsx to avoid an import cycle.
// Holds the in-memory access token (spec §2: never localStorage/sessionStorage)
// and the callback the API interceptor uses when the session is unrecoverable.

let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : () => {};
}

export function notifyUnauthorized() {
  onUnauthorized();
}
