// frontend/src/types/auth.ts
export interface User {
  id: number;
  email: string;
  full_name?: string;
  created_at?: string; // From backend (users table)
  // Add any other user fields you expect from the backend, e.g., role
}

export interface RegisterCredentials {
  email: string;
  password?: string; // Frontend sends this, backend hashes it
  full_name?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Frontend sends this
}

// Based on backend auth.controller.js responses
// For login: { status: 'success', data: { token, userId: user.id, email: user.email }}
// For register: { status: 'success', data: { user: newUser } } (newUser has id, email, full_name, created_at)
export interface AuthData {
    token?: string;      // Present in login response
    userId?: number;     // Present in login response as part of data, not in user object
    email?: string;      // Present in login response as part of data, not in user object
    user?: User;         // Present in registration response (and can be constructed for login)
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string; // Error message from backend
  data: AuthData; // Data structure varies slightly between login and register
}
