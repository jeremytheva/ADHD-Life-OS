import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    authService.clearCurrentUser();
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      if (authService.isUnauthorizedError(error)) {
        clearAuthState();
        return null;
      }

      console.error('Error checking auth state:', error);
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  useEffect(() => {
    // Listen for auth changes from explicit sign-in/sign-out actions.
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    refreshSession,
    checkSession: refreshSession,
    clearAuthState,
    signIn: async (email, password) => {
      try {
        const result = await authService.signIn(email, password);
        setUser(result.user);
        return result;
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },
    signUp: async (email, password) => {
      try {
        const result = await authService.signUp(email, password);
        setUser(result.user);
        return result;
      } catch (error) {
        console.error('Sign up error:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await authService.signOut();
        setUser(null);
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
