import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/config/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ user: User; isAdmin: boolean }>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'blocknet_token';
const USER_KEY = 'blocknet_user';

/* ---------------- JWT helpers ---------------- */
function decodeJWT(token: string): { role?: string; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}



function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

/* ---------------- Provider ---------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
  });

  const setAuthState = useCallback((user: User | null, token: string | null) => {
    const decoded = token ? decodeJWT(token) : null;
    const isAdmin = decoded?.role === 'admin' || user?.role === 'admin';

    setState({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin,
      isLoading: false,
    });

    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  
  /* ---------------- LOGIN ---------------- */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await api.post<AuthResponse>(ENDPOINTS.LOGIN, credentials, false);
      const user = response.user;
      const decoded = decodeJWT(response.access_token);
      const isAdmin = decoded?.role === 'admin';

      setAuthState(user, response.access_token);

      return { user, isAdmin };
    },
    [setAuthState]
  );

  /* ---------------- REGISTER ---------------- */
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      await api.post(ENDPOINTS.REGISTER, credentials, false);
      // Backend does NOT return token, user must login after registration
    },
    []
  );

  /* ---------------- LOGOUT ---------------- */
  const logout = useCallback(() => {
    setAuthState(null, null);
  }, [setAuthState]);

  /* ---------------- REFRESH USER ---------------- */
  // safer refreshUser
const refreshUser = useCallback(async () => {
  try {
    const user = await api.get<User>(ENDPOINTS.PROFILE);
    setAuthState(user, state.token); // ensures isAdmin is updated
  } catch {
    logout();
  }
}, [logout, state.token]);


  /* ---------------- INIT FROM STORAGE ---------------- */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr && !isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuthState(user, token);
      } catch {
        setAuthState(null, null);
      }
    } else {
      setAuthState(null, null);
    }
  }, [setAuthState]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
