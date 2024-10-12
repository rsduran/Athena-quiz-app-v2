// utils/getBackendUrl.ts

export const getBackendUrl = (): string => {
  console.log(`[DEBUG] Getting backend URL. NEXT_PUBLIC_BACKEND_URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}, NEXT_PUBLIC_ENV: ${process.env.NEXT_PUBLIC_ENV}, NODE_ENV: ${process.env.NODE_ENV}`);
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log(`[DEBUG] Using NEXT_PUBLIC_BACKEND_URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  } else if (process.env.NEXT_PUBLIC_ENV === 'docker') {
    console.log('[DEBUG] Using Docker Compose environment URL');
    return 'http://localhost:5000/api';
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Using local development URL');
    return 'http://localhost:5000/api';
  } else {
    console.log('[DEBUG] Using fallback URL for production');
    return '/api';
  }
};