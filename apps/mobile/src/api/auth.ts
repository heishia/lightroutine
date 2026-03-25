import { apiClient } from './client';
import type { RegisterRequest, LoginRequest, AuthTokens, UserProfile } from '@lightroutine/types';

interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);
  return res.data.data;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', data);
  return res.data.data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const res = await apiClient.post<{ data: AuthTokens }>('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
}
