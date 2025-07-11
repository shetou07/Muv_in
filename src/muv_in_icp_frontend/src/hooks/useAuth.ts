import { useState, useEffect, useCallback } from 'react';
import { icpService } from '../services/icpService';

interface AuthState {
  isAuthenticated: boolean;
  principal: string;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: '',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Ensure ICP service is initialized
        await icpService.init();
        
        setAuthState({
          isAuthenticated: icpService.isAuthenticated,
          principal: icpService.principal,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to check authentication:', error);
        setAuthState({
          isAuthenticated: false,
          principal: '',
          isLoading: false,
          error: 'Failed to check authentication',
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await icpService.login();
      
      if (success) {
        setAuthState({
          isAuthenticated: true,
          principal: icpService.principal,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Login failed',
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await icpService.logout();
      
      setAuthState({
        isAuthenticated: false,
        principal: '',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
}
