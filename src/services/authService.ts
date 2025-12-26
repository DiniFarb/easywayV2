import type { LoginCredentials, LoginResponse } from '@/types';

const API_URL = 'https://wolfy.r2v.ch/login';
const TOKEN_KEY = 'jwt_token';
const EXPIRES_AT_KEY = 'token_expires_at';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store the token and expiration
      if (data.accessToken) {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        localStorage.setItem(EXPIRES_AT_KEY, data.expiresAt.toString());
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    
    const expirationTime = parseInt(expiresAt, 10);
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  },

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    if (!hasToken) return false;
    
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  },
};
