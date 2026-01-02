import type { LoginCredentials, LoginResponse, User } from '@/types';

//const API_URL = 'https://wolfy.r2v.ch/login';
const API_URL = 'http://localhost:3000/login';
const TOKEN_KEY = 'jwt_token';
const EXPIRES_AT_KEY = 'token_expires_at';
const USER_KEY = 'user_data';

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
        // Store user data (assuming it's the first user in the array)
        if (data.user && data.user.length > 0) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user[0]));
        }
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
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
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
