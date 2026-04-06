/**
 * Session context and hooks for auth state management.
 * Provides user and authentication state to the application.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthResult, LogoutResult } from '../../domain/contracts';
import { IApiClient } from '../api/client';

interface SessionContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<LogoutResult>;
  setApiClient: (client: IApiClient) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  apiClient: IApiClient;
}

export function SessionProvider({ children, apiClient }: SessionProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<IApiClient>(apiClient);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const existingSession = await client.getSession();
        if (existingSession) {
          setSession(existingSession);
          const user = await client.getUser(existingSession.userId);
          if (user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [client]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await client.login(email, password);
      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<LogoutResult> => {
    setIsLoading(true);
    try {
      const result = await client.logout();
      if (result.success) {
        setUser(null);
        setSession(null);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SessionContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    login,
    logout,
    setApiClient: setClient,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
