import { authService } from './authService';
import { WS_BASE_URL } from '@/config';

type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<WebSocketCallback>> = new Map();
  private isConnecting = false;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    const token = authService.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.isConnecting = true;
    
    // WebSocket connection with token as query parameter
    this.socket = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      
      // Notify listeners about connection
      this.emit('connected', {});
      
      // Subscribe to collections
      this.send('subscribe', { collections: ['persons', 'events'] });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnecting = false;
      this.socket = null;
      
      // Notify listeners about disconnection
      this.emit('disconnected', {});
      
      // Attempt to reconnect
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.listeners.clear();
  }

  private handleMessage(message: any) {
    const { type, data } = message;
    
    // Notify all listeners for this event type
    this.emit(type, data);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  on(event: string, callback: WebSocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: WebSocketCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  send(type: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected. Message not sent:', type, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
