// utils/getBackendUrl.ts

let cachedBackendUrl: string | null = null;

export const getBackendUrl = (): string => {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }

  console.log(`[DEBUG] Getting backend URL. NEXT_PUBLIC_BACKEND_URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}, NEXT_PUBLIC_ENV: ${process.env.NEXT_PUBLIC_ENV}, NODE_ENV: ${process.env.NODE_ENV}`);
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    cachedBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  } else if (process.env.NEXT_PUBLIC_ENV === 'docker') {
    cachedBackendUrl = 'http://localhost:5000/api';
  } else if (process.env.NODE_ENV === 'development') {
    cachedBackendUrl = 'http://localhost:5000/api';
  } else {
    cachedBackendUrl = '/api';
  }

  console.log(`[DEBUG] Using backend URL: ${cachedBackendUrl}`);
  return cachedBackendUrl;
};
