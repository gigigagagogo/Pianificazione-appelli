const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new ApiError(message ?? 'Errore imprevisto', response.status);
  }

  return data as T;
}

export type Role = 'docente' | 'segreteria';

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
}

export interface RegisteredUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export function registerUser(payload: RegisterPayload) {
  return post<RegisteredUser>('/register', payload);
}

export function loginUser(payload: LoginPayload) {
  return post<LoginResult>('/login', payload);
}
