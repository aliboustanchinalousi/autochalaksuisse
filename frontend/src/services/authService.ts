import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  // Try to parse JSON regardless of response.ok, as backend might send error details in JSON
  let data: AuthResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    // If JSON parsing fails, throw a generic error based on status
    if (!response.ok) {
      throw new Error(`Registration failed with status ${response.status}. Could not parse error response.`);
    }
    // If response was ok but JSON parsing failed (unlikely for this API but good practice)
    throw new Error('Registration succeeded but failed to parse response.');
  }

  if (!response.ok) {
    throw new Error(data.message || `Registration failed with status ${response.status}`);
  }

  if (!data.data.user) {
    throw new Error('Registration response missing user data.');
  }
  return data.data.user;
};

export const loginUser = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  let data: AuthResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}. Could not parse error response.`);
    }
    throw new Error('Login succeeded but failed to parse response.');
  }

  if (!response.ok) {
    throw new Error(data.message || `Login failed with status ${response.status}`);
  }

  if (!data.data.token || data.data.userId === undefined || !data.data.email) {
    // Check for userId being undefined as ID 0 could be valid in some systems, though unlikely for SERIAL.
    console.error("Login response data structure issue:", data.data);
    throw new Error('Login response missing token or essential user data (userId, email).');
  }

  // Construct the User object based on what login endpoint returns.
  // The backend login response returns: { token, userId: user.id, email: user.email }
  // It does NOT return full_name or created_at directly in the 'data' part for login.
  // The 'user' object in AuthData is primarily for the registration response.
  // For login, we construct a minimal User object. A more complete User object could be fetched separately if needed.
  const user: User = {
    id: data.data.userId,
    email: data.data.email,
    // full_name and created_at are not available from this specific login response.
    // If needed, a separate GET /users/me endpoint (using the token) would provide full user details.
  };

  return { token: data.data.token, user };
};
