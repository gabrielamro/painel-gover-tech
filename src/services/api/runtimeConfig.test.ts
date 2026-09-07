import { describe, expect, it } from 'vitest';
import { getRuntimeConfig } from './runtimeConfig';

describe('configuração de runtime', () => {
  it('mantém API desativada por padrão e não exige credencial local', () => {
    const config = getRuntimeConfig();
    expect(config.apiEnabled).toBe(false);
    expect(config.hasAccessToken).toBe(false);
    expect(config.apiBaseUrl).toBe('/api');
  });
});
