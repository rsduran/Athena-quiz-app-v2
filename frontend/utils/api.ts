// utils/api.ts

import { getBackendUrl } from './getBackendUrl';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Redirect to login page or handle unauthorized access
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  return response;
}