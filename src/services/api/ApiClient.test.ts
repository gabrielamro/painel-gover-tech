import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from './ApiClient';

describe('ApiClient', () => {
  it('envia o token e retorna data', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }));
    const client = new ApiClient({ baseUrl: '/api', accessToken: 'token', fetcher });
    await expect(client.request('/health')).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith('/api/health', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }));
  });

  it('expõe erro da API', async () => {
    const client = new ApiClient({ fetcher: vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401 })) });
    await expect(client.request('/private')).rejects.toThrow('Não autorizado.');
  });
});

