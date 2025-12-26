export interface Person {
  _id: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EventEntry {
  _id: string;
  event: Event;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Event {
name: string;
  eventDate: string;
  place: string;
  comments: string;
  participants: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Person[];
  expiresAt: number;
}
