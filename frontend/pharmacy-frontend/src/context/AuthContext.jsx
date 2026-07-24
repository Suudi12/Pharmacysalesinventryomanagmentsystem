import { createContext, useCallback, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { extractErrorMessage } from '../services/api';
import { normalizeRole } from '../utils/roles';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const persistSession = useCallback((authResponse) => {
    const sessionUser = {
      username: authResponse.username,
      fullName: authResponse.fullName,
      role: normalizeRole(authResponse.role),
    };
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setToken(authResponse.token);
    setUser(sessionUser);
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        const response = await authService.login({ username, password });
        persistSession(response);
        return {
          success: true,
          message: response.message,
          role: normalizeRole(response.role),
        };
      } catch (error) {
        return { success: false, message: extractErrorMessage(error) };
      }
    },
    [persistSession]
  );

  // Only ever creates the very first admin account — see authService.register.
  const register = useCallback(
    async (payload) => {
      try {
        const response = await authService.register(payload);
        persistSession(response);
        return { success: true, message: response.message };
      } catch (error) {
        return { success: false, message: extractErrorMessage(error) };
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
