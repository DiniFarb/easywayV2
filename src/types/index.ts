export interface User {
  _id: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PersonEntry {
  _id: string;
  person: Person;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Person {
  birthdate: string;
  city: string;
  comments: string;
  emergency_phone: string;
  firstname: string;
  gender: string;
  lastname: string;
  phone: string;
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
  user: User[];
  expiresAt: number;
}
