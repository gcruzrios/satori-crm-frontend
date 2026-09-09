import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, refreshAccessToken, toApiError } from './api';
import {
  setAccessToken,
  setUnauthorizedHandler,
} from './authBridge';
import { resolveCapabilities } from './permissions';

const AuthContext = createContext(null);

const STATUS = {
  BOOTSTRAPPING: 'bootstrapping',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
};

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(STATUS.BOOTSTRAPPING);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const capabilities = useMemo(() => resolveCapabilities(user), [user]);
  const bootstrapped = useRef(false);

  const applySession = useCallback((accessToken, nextUser) => {
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(nextUser ?? null);
    setStatus(nextUser ? STATUS.AUTHENTICATED : STATUS.ANONYMOUS);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
    setStatus(STATUS.ANONYMOUS);
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await api.post('/auth/login', { email, password });
      applySession(data.access_token, data.user ?? null);
      return data.user ?? null;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* endpoint may not exist; clearing local state is what matters */
    }
    clearSession();
  }, [clearSession]);

  // Silent re-auth on mount (spec §2). Degrades cleanly when the backend has
  // no /auth/refresh or /auth/me yet. Runs to completion even under
  // StrictMode's mount/unmount/mount so `status` always leaves BOOTSTRAPPING.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        const accessToken = await refreshAccessToken();
        if (!accessToken) throw new Error('no token');
        let me = null;
        try {
          me = (await api.get('/auth/me')).data;
        } catch {
          me = null;
        }
        if (me) applySession(accessToken, me);
        else clearSession();
      } catch {
        clearSession();
      }
    })();
  }, [applySession, clearSession]);

  // The API interceptor calls this when a session is unrecoverable.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      const here = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign(`/login?redirect=${encodeURIComponent(here)}`);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const can = useCallback(
    (capability) => {
      if (!capability) return true;
      if (Array.isArray(capability)) return capability.some((c) => capabilities.has(c));
      return capabilities.has(capability);
    },
    [capabilities],
  );

  const value = useMemo(
    () => ({
      status,
      isBootstrapping: status === STATUS.BOOTSTRAPPING,
      isAuthenticated: status === STATUS.AUTHENTICATED,
      user,
      accessToken: token,
      capabilities,
      can,
      login,
      logout,
    }),
    [status, user, token, capabilities, can, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export { AuthContext, STATUS as AUTH_STATUS, toApiError };
