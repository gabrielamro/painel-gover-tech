export interface ApiClientOptions { baseUrl?: string; accessToken?: string; fetcher?: typeof fetch; }

export class ApiClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;
  private readonly fetcher: typeof fetch;
  constructor(options: ApiClientOptions = {}) { this.baseUrl = options.baseUrl || ''; this.accessToken = options.accessToken; this.fetcher = options.fetcher || fetch; }
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}), ...(init.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Falha na API (${response.status}).`);
    return (body.data ?? body) as T;
  }
}

export function createConfiguredApiClient(): ApiClient | null {
  const enabled = import.meta.env.VITE_API_ENABLED === 'true';
  if (!enabled) return null;
  return new ApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL || '', accessToken: window.localStorage.getItem('painelpro-access-token') || undefined });
}
