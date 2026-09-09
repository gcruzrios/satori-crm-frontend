// Centralized API client (spec §2 interceptor + §14 error mapping).
// No component calls fetch/axios directly — everything goes through here or a
// feature-level api.js that imports this instance.
import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  notifyUnauthorized,
} from './authBridge';

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send/receive the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------------------ *
 * Request: attach the in-memory access token.
 * ------------------------------------------------------------------ */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ *
 * Silent refresh — deduped so a burst of 401s triggers only one call.
 * The backend of this spec may not expose /auth/refresh yet; a 404/405
 * there is treated the same as a failed refresh (-> logout).
 * ------------------------------------------------------------------ */
let refreshPromise = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        const token = res.data?.access_token ?? null;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/* ------------------------------------------------------------------ *
 * Response: on 401 try refresh once, then replay the original request.
 * ------------------------------------------------------------------ */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const status = response?.status;
    const url = config?.url ?? '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (status === 401 && config && !config.__retried && !isAuthCall) {
      config.__retried = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }
      } catch {
        /* fall through to logout */
      }
      notifyUnauthorized();
    }

    return Promise.reject(toApiError(error));
  },
);

/* ------------------------------------------------------------------ *
 * Error shape used across the app.
 * ------------------------------------------------------------------ */
export class ApiError extends Error {
  constructor(message, { status, code, fieldErrors, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors ?? null;
    this.cause = cause;
  }
}

const STATUS_MESSAGES = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Hay un conflicto con el estado actual del recurso.',
  422: 'Revisa los datos ingresados.',
  429: 'Demasiadas solicitudes. Intenta de nuevo en un momento.',
  500: 'Ocurrió un error en el servidor. Intenta más tarde.',
};

/** Parse FastAPI 422 `detail` array into a { field: message } map. */
function parseFieldErrors(detail) {
  if (!Array.isArray(detail)) return null;
  const out = {};
  for (const item of detail) {
    const loc = Array.isArray(item.loc) ? item.loc : [];
    const field = loc.filter((p) => p !== 'body').join('.') || 'form';
    if (!out[field]) out[field] = item.msg;
  }
  return Object.keys(out).length ? out : null;
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return new ApiError('No se pudo conectar con el servidor.', {
      code: 'network',
      cause: error,
    });
  }
  if (error?.code === 'ECONNABORTED') {
    return new ApiError('La solicitud tardó demasiado. Intenta de nuevo.', {
      code: 'timeout',
      cause: error,
    });
  }

  const status = error?.response?.status;
  const data = error?.response?.data;
  const detail = data?.detail ?? data?.message;

  let message;
  if (typeof detail === 'string') {
    message = detail;
  } else if (Array.isArray(detail) && detail[0]?.msg) {
    message = STATUS_MESSAGES[422];
  } else {
    message = STATUS_MESSAGES[status] ?? 'Ocurrió un error inesperado.';
  }

  return new ApiError(message, {
    status,
    code: data?.code,
    fieldErrors: parseFieldErrors(detail),
    cause: error,
  });
}

/** Convenience for surfacing an error to the user (toasts, error states). */
export function getErrorMessage(error) {
  return toApiError(error).message;
}

/* ------------------------------------------------------------------ *
 * Thin verb helpers — return `data` directly.
 * ------------------------------------------------------------------ */
export const http = {
  get: (url, config) => api.get(url, config).then((r) => r.data),
  post: (url, body, config) => api.post(url, body, config).then((r) => r.data),
  put: (url, body, config) => api.put(url, body, config).then((r) => r.data),
  patch: (url, body, config) => api.patch(url, body, config).then((r) => r.data),
  delete: (url, config) => api.delete(url, config).then((r) => r.data),
};

/** Normalize the list envelope `{ items, total, page, page_size }`. */
export function asPage(data, fallbackPageSize) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, page_size: data.length };
  }
  return {
    items: data?.items ?? [],
    total: data?.total ?? data?.items?.length ?? 0,
    page: data?.page ?? 1,
    page_size: data?.page_size ?? fallbackPageSize ?? 20,
  };
}
