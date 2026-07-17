import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';
import { createAuthSessionController } from './authSessionController';

const AuthContext = createContext();

export const AUTH_STATUS = {
  INITIALIZING: 'initializing',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
  ERROR: 'error'
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.INITIALIZING);
  const [error, setError] = useState(null);
  const mounted = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    authService.clearCurrentUser();
  }, []);

  const controller = useRef(null);
  if (!controller.current) {
    controller.current = createAuthSessionController({
      auth: authService,
      isActive: () => mounted.current,
      updateState: ({ user: nextUser, status: nextStatus, error: nextError }) => {
        if (nextUser !== undefined) setUser(nextUser);
        if (nextStatus !== undefined) setStatus(nextStatus);
        if (nextError !== undefined) setError(nextError);
      },
      clearAuthState
    });
  }

  const verifySession = controller.current.verifySession;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // This guard also prevents React Strict Mode's development effect replay
    // from sending a second get-session request.
    controller.current.startVerification();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      // An auth event is newer than a pending startup or retry verification.
      // Ignore that stale request when it eventually settles so explicit
      // sign-in/sign-out state cannot be overwritten by an older response.
      controller.current.handleAuthStateChange(event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    status,
    error,
    loading: status === AUTH_STATUS.INITIALIZING,
    clearAuthState,
    retrySessionVerification: verifySession,
    signIn: async (email, password) => {
      try {
        const result = await authService.signIn(email, password);
        setUser(result.user);
        setError(null);
        setStatus(result.user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS);
        return result;
      } catch (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
    },
    signUp: async (email, password) => {
      try {
        const result = await authService.signUp(email, password);
        setUser(result.user);
        setError(null);
        setStatus(result.user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS);
        return result;
      } catch (signUpError) {
        console.error('Sign up error:', signUpError);
        throw signUpError;
      }
    },
    signOut: async () => {
      try {
        await authService.signOut();
        clearAuthState();
        setError(null);
        setStatus(AUTH_STATUS.ANONYMOUS);
      } catch (signOutError) {
        console.error('Sign out error:', signOutError);
        throw signOutError;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
