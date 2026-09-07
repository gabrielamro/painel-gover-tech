export interface RuntimeConfig {
  apiEnabled: boolean;
  apiBaseUrl: string;
  hasAccessToken: boolean;
}

export function getRuntimeConfig(): RuntimeConfig {
  return {
    apiEnabled: import.meta.env.VITE_API_ENABLED === 'true',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    hasAccessToken: typeof window !== 'undefined' && Boolean(window.localStorage.getItem('painelpro-access-token')),
  };
}
